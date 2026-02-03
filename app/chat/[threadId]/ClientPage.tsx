"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatNotFound } from "@/components/dashboard/ChatNotFound";
import { Loader } from "@/components/ai-elements/loader";
import { Id } from "@/convex/_generated/dataModel";
import ConversationComponent from "@/components/dashboard/ConversationComponent";
import { useThreadMetadata } from "@/hooks/useThreadMetadata"; // Adjust path to your hook

export default function ChatThreadPage() {
  const params = useParams();
  // We get agentId from params but don't need to use it directly in this component
  // as it's already part of the URL structure
  const threadId = params?.threadId as Id<'threads'>;
  
  // Get the latest messages to track streaming
  const messages = useQuery(
    api.messages.listMessages, 
    threadId ? { thread_id: threadId } : "skip"
  );
  
  // New: Optimistic title management (updates immediately, preserves old during load)
  useThreadMetadata(threadId);
  
  console.log("messagesssssss", messages)
  // Always call hooks at the top level, before any conditionals
  // Use "skip" when threadId is undefined to avoid validation errors
  const threadExists = useQuery(
    api.threads.checkThreadExists, 
    threadId ? { thread_id: threadId } : "skip"
  );
  
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    // This function is passed to the ConversationComponent
    const messagesEnd = document.getElementById("messages-end");
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior });
    }
  }, []);

  const drivenIds = useMemo(() => {
    const newDrivenIds = new Set<string>();
    if (!messages || messages.length === 0) return newDrivenIds;

    messages.forEach((msg) => {
      if (msg.role === "assistant" && msg.responseStreamId && msg.text === "") {
        newDrivenIds.add(msg._id);
      }
    });

    return newDrivenIds;
  }, [messages]);

  const isStreaming = drivenIds.size > 0;
  
  const handleStreamingComplete = useCallback(() => {
    // Streaming state is derived from messages.
  }, []);

  // Share streaming status with parent layout
  useEffect(() => {
    // Use a custom event to communicate with the layout
    const event = new CustomEvent('streamingStatusChange', { 
      detail: { isStreaming, threadId } 
    });
    window.dispatchEvent(event);
  }, [isStreaming, threadId]);
  
  // Show loader while checking if thread exists
  if (threadId && threadExists === undefined) {
    return <Loader />;
  }
  
  // Show not found state if thread doesn't exist
  if (threadExists === false) {
    return <ChatNotFound />;
  }
  
  return (
    <>
      <ConversationComponent 
        threadId={threadId}
        drivenIds={drivenIds}
        isStreaming={isStreaming}
        onStreamingComplete={handleStreamingComplete}
        scrollToBottom={scrollToBottom}
      />
      <div id="messages-end" />
    </>  
  );
}