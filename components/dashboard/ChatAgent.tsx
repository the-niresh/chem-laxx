"use client";

import { useRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export const models = [
  { name: "GPT 4o", value: "openai/gpt-4o" },
  { name: "Deepseek R1", value: "deepseek/deepseek-r1" },
];

interface ChatAgentProps {
  agentId?: string;
  threadId?: Id<'threads'>;
  children?: React.ReactNode;
}

/**
 * A lightweight wrapper component for chat functionality.
 * This component is used as a container for chat-related components
 * and provides context and props to its children.
 * 
 * @param props.agentId - The ID of the agent (used for context)
 * @param props.threadId - The ID of the thread (used for context)
 * @param props.children - Child components to render
 */
export default function ChatAgent({ children }: ChatAgentProps) {
  // We keep the messagesEndRef in this component for scrolling functionality
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-4xl mx-auto p-2 relative size-full min-h-min overflow-hidden">
      <div className="flex flex-col h-full">
        {children}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}