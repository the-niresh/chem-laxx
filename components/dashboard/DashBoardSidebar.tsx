"use client"

import * as React from "react"
import { Frame, Map, PieChart } from "lucide-react"
// import { NavMain } from "@/components/dashboard/ui/nav-main";
import { NavHistories } from "@/components/dashboard/ui/nav-histories";
import { NavUser } from "@/components/dashboard/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
// import SearchBar from "@/components/dashboard/ui/SearchBar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export interface DashBoardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  externalUserAgents?: Array<{
    model: string;
    user_id: Id<"users">;
    subscription_active: boolean;
    updated_at: number;
    [key: string]: unknown;
  }>;
  externalUser?: {
    _id?: Id<"users">;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };
  activeThreadId?: Id<"threads">;
}

// Sidebar Skeleton Component
function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-6 p-2">
          {/* Main Nav Skeleton */}
          <div className="space-y-1">
            <div className="px-2 py-1">
              <Skeleton className="h-4 w-16 mb-3" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          
          {/* History Skeleton */}
          <div className="space-y-1">
            <div className="px-2 py-1">
              <Skeleton className="h-4 w-16 mb-3" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashBoardSidebar({
  externalUserAgents,
  externalUser,
  activeThreadId,
  ...props
}: DashBoardSidebarProps) {
  void externalUserAgents;
  const activeUrl = activeThreadId ? `/chat/${activeThreadId}` : undefined;
  // Only fetch local data if external props are not provided
  const localUser = useQuery(api.users.getCurrentUser, externalUser ? "skip" : undefined);
  
  
  // Use external props if provided, otherwise use local queries
  const user = externalUser || localUser;
  const userAgents = externalUserAgents;
  
  // Track loading state
  const [isAgentsLoading, setIsAgentsLoading] = React.useState(true);
  
  // Update loading state when userAgents changes
  React.useEffect(() => {
    if (user?._id) {
      setIsAgentsLoading(false);
    }
  }, [userAgents, user?._id]);

  const userThreads = useQuery(
    api.threads.listThreadsByUser,
    user?._id ? { user_id: user._id } : "skip"
  );

  // Create histories for the sidebar based on the agent's threads
  const histories = React.useMemo(() => {
    if (!userThreads || userThreads.length === 0) return [];
    
    const threadIcons = [Frame, PieChart, Map] as const;
    
    return userThreads.map((thread) => ({
      name: `${thread.title || "Untitled"}`,
      url: `/chat/${thread._id}`,
      icon: (() => {
        const id = String(thread._id);
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = (hash * 31 + id.charCodeAt(i)) | 0;
        }
        return threadIcons[Math.abs(hash) % threadIcons.length];
      })(),
    }));
  }, [userThreads]);



  // If loading, show skeleton
  if (isAgentsLoading || !user) {
    return <SidebarSkeleton />;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
     
      </SidebarHeader>
      <SidebarContent>
       
        <NavHistories histories={histories} activeUrl={activeUrl} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "user@example.com",
            avatar: user?.avatar_url ?? "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}