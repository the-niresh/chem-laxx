"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatAgent from '@/components/dashboard/ChatAgent';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { Id as ConvexId } from '@/convex/_generated/dataModel';
import { DashBoardSidebar } from "@/components/dashboard/DashBoardSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { GlobeIcon, Plus, SquarePen } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const threadId = params?.threadId as Id<'threads'> | undefined;
  const user = useQuery(api.users.getCurrentUser);
  const thread = useQuery(api.threads.get, threadId ? { id: threadId } : "skip");
  
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [status, setStatus] = useState<'ready' | 'streaming' | 'submitted' | 'error'>('ready');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const createThread = useMutation(api.threads.createThread);

  // Focus the input field when needed
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);
  
  // Use this to refocus after message is sent
  useEffect(() => {
    if (status === 'ready') {
      focusInput();
    }
  }, [status, focusInput]);
  
  // Listen for streaming status changes from thread page
  useEffect(() => {
    const handleStreamingStatusChange = (event: CustomEvent) => {
      const { isStreaming, threadId: eventThreadId } = event.detail;
      
      console.log(`Layout received streaming status: ${isStreaming} for thread: ${eventThreadId}`);
      
      // Only update status if this event is for the current thread
      if (threadId && eventThreadId === threadId) {
        console.log(`Updating layout status to: ${isStreaming ? 'streaming' : 'ready'}`);
        setStatus(isStreaming ? 'streaming' : 'ready');
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener('streamingStatusChange', handleStreamingStatusChange as EventListener);
    
    // Log current status when component mounts or threadId changes
    console.log(`Layout mounted/updated with status: ${status} for thread: ${threadId}`);
    
    return () => {
      window.removeEventListener('streamingStatusChange', handleStreamingStatusChange as EventListener);
    };
  }, [threadId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a new thread if none exists
    let currentThreadId = threadId || null;
    let shouldRedirect = false;
    
    if (!currentThreadId) {
      if (!user?._id) return;
      currentThreadId = await createThread({
        user_id: user._id,
      });
      shouldRedirect = true;
    }

    setStatus('submitted');
    
    try {
      if (!user?._id) return;
      // Send the message - webhook handling is done in the sendMessage mutation
      await sendMessage({
        text: input,
        thread_id: currentThreadId ?? undefined,
        userId: user._id,
      });
      
      setStatus('streaming');
      setInput("");
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
      return;
    }
    
    // Update the URL to reflect the thread ID without reloading the page
    if (shouldRedirect && currentThreadId) {
      router.push(`/chat/${currentThreadId}`, { scroll: false });
    }
  };

  return (
    <SidebarProvider>
      <DashBoardSidebar externalUser={user ?? undefined} />
      <SidebarInset className="h-screen overflow-hidden flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* <div className="flex items-center gap-2"> */}
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
             
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {/* {pathname && pathname.split('/').length > 2 && ( */}
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={`/chat`}>
                          chat
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  {/*// )} */}
                  {/* {pathname && pathname.split('/').length > 3 && userAgents && userAgents.length > 0 && ( */}
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          Chattt
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  {/* )} */}
                </BreadcrumbList>
              </Breadcrumb>
            
            </div>

            <div className="flex flex-1 justify-end gap-2 px-4">
              <ModeToggle />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hover:bg-accent"
                onClick={() => router.push("/chat")}
                title="New chat"
              >
                <SquarePen />
              </Button>
            </div>
          {/* </div> */}
        </header>
        <div className="flex-1 overflow-y-auto">
        <ChatAgent threadId={threadId}>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">{children}</div>

            <PromptInput onSubmit={handleSubmit} className="mt-4 pb-4">
              <PromptInputTextarea
                ref={inputRef}
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Type your message..."
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputButton>
                    <Plus size={16} />
                  </PromptInputButton>
                  <PromptInputButton
                    variant={webSearch ? "default" : "ghost"}
                    onClick={() => setWebSearch(!webSearch)}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>
                </PromptInputTools>
                <PromptInputSubmit disabled={status !== 'ready' || !input.trim()} status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </ChatAgent>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}