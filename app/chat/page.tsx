"use client";

// Simple page component - prompt input is now in the layout

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Start a new conversation</h2>
        <p className="text-muted-foreground">Type your message below to begin chatting with the AI assistant.</p>
      </div>
    </div>
  );
}
