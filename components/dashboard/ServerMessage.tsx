"use client";

import { StreamId } from "@convex-dev/persistent-text-streaming";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useMemo, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { Loader } from "../ai-elements/loader";

export function ServerMessage({
  message,
  isDriven,
  stopStreaming,
  scrollToBottom,
}: {
  message: Doc<"messages">;
  isDriven: boolean;
  stopStreaming: () => void;
  scrollToBottom: () => void;
}) {
  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, ".site") ||
    "";

  const baseUrl = useMemo(() => {
    if (!convexSiteUrl) return null;
    return /^https?:\/\//.test(convexSiteUrl)
      ? convexSiteUrl
      : `https://${convexSiteUrl}`;
  }, [convexSiteUrl]);

  console.log("convexSiteUrl", convexSiteUrl);
  console.log("message", message);
  console.log("isDriven", isDriven);
  console.log("stopStreaming", stopStreaming);
  console.log("scrollToBottom", scrollToBottom);

  const patchAssistantText = useMutation(api.messages.patchAssistantText);

  const shouldStream =
    Boolean(message.responseStreamId) && isDriven && Boolean(baseUrl);
  
  // Create a URL with message ID as a query parameter
  const streamUrl = useMemo(() => {
    try {
      const url = new URL(`${baseUrl ?? "https://example.com"}/chat-stream`);
      url.searchParams.append('message_id', message._id);
      if (message.threadId) {
        url.searchParams.append('thread_id', message.threadId);
      }
      return url;
    } catch {
      const url = new URL('https://example.com/chat-stream');
      url.searchParams.append('message_id', message._id);
      return url;
    }
  }, [baseUrl, message._id, message.threadId]);
  // Pass the message ID and thread ID as query parameters
  
  const { text, status } = useStream(
    api.chat.getChatBody,
    new URL(streamUrl.toString()),
    shouldStream,
    message.responseStreamId as StreamId
  );

  const isCurrentlyStreaming = useMemo(() => {
    return shouldStream && (status === "pending" || status === "streaming");
  }, [shouldStream, status]);

  // Use useRef to track if we've already called stopStreaming
  const hasCalledStopStreamingRef = useRef(false);

  useEffect(() => {
    // Only proceed if we're supposed to be streaming
    if (!shouldStream) return;
    
    // When streaming completes
    if (!isCurrentlyStreaming && status !== "pending") {
      if (status === "done" && text && message.text === "") {
        // Save the streamed text to the message
        patchAssistantText({ id: message._id, text });
      }
      // Notify parent that streaming is complete only once
      if (status === "done" && !hasCalledStopStreamingRef.current) {
        hasCalledStopStreamingRef.current = true;
        stopStreaming();
      }
    }
  }, [shouldStream, isCurrentlyStreaming, status, text, message.text, message._id, patchAssistantText, stopStreaming]);

  useEffect(() => {
    if (text) {
      scrollToBottom();
    }
  }, [text, scrollToBottom]);

  if (!baseUrl) {
    return "Missing NEXT_PUBLIC_CONVEX_SITE_URL";
  }

  return text || message.text || <Loader />;
}