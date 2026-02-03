"use client";

import { Fragment, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Loader } from "@/components/ai-elements/loader";
import { CopyIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Response } from "@/components/ai-elements/response";
import dynamic from "next/dynamic";

const ServerMessage = dynamic(
  () => import("./ServerMessage").then((mod) => mod.ServerMessage),
  { ssr: false }
);

interface ConversationComponentProps {
  threadId: Id<'threads'>;
  drivenIds: Set<string>;
  isStreaming: boolean;
  onStreamingComplete: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export default function ConversationComponent({
  threadId,
  drivenIds,
  isStreaming,
  onStreamingComplete,
  scrollToBottom
}: ConversationComponentProps) {
  // Query messages for the thread
  const messages = useQuery(
    api.messages.listMessages, 
    threadId ? { thread_id: threadId } : "skip"
  );

  // Scroll to bottom when messages change or streaming status changes
  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Show loader while loading messages
  if (!messages) return <Loader />;

  return (
    <Conversation className="overflow-y-auto overscroll-none">
      <ConversationContent>
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <Fragment key={message._id}>
                <Message from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" && message.responseStreamId && message.text === "" ? (
                      <>
                        <ServerMessage
                          // userMessage={message.text}
                          message={message}
                          isDriven={drivenIds.has(message._id)}
                          stopStreaming={() => {
                            console.log(`Streaming complete for message: ${message._id}`);
                            onStreamingComplete();
                          }}
                          scrollToBottom={scrollToBottom}
                        />
                      </>
                    ) : (
                      <Response>
                        {message.text}
                      </Response>
                    )}
                  </MessageContent>
                </Message>
                {message.role === "assistant" && (
                    <Actions className="mt-2">
                      <Action
                        onClick={() => navigator.clipboard.writeText(message.text)}
                        label="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </Action>
                    </Actions>
                  )}
              </Fragment>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold mb-2">Start a new conversation</h2>
              <p className="text-muted-foreground">Type your message below to begin chatting with the AI assistant.</p>
            </div>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
