"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ChatNotFound() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-semibold mb-2">Chat not found</h2>
      <p className="text-muted-foreground mb-6">
        If this was a link someone shared with you, please ask the sender to
        explicitly send a share link.
      </p>
      <Button 
        onClick={() => router.push('/chat')}
        className="px-4 py-2"
      >
        Start a new chat
      </Button>
    </div>
  );
}
