// // agent-switcher.tsx (updated with null checks and loading state)
// "use client"

// import * as React from "react"
// import { ChevronsUpDown, Plus } from "lucide-react"
// import { useRouter } from "next/navigation"

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar"
// import { Button } from "@/components/ui/button"
// import { CreateAgentDialog } from "@/components/dashboard/CreateAgentDialog"
// import { useState, useEffect } from "react"

// export function AgentSwitcher({
//   agents,
// }: {
//   agents: {
//     name: string
//     logo: React.ElementType
//     model: string
//     id: string
//     url: string
//     onClick?: () => void
//   }[]
// }) {
//   const router = useRouter();
//   const { isMobile } = useSidebar()
//   const [activeAgent, setActiveAgent] = React.useState<{
//     name: string
//     logo: React.ElementType
//     model: string
//     id: string
//     url: string
//     onClick?: () => void
//   } | null>(null);
//   const [open, setOpen] = useState(false);

//   // Sync activeAgent when agents prop changes (e.g., after loading from Convex)
//   useEffect(() => {
//     if (agents.length > 0) {
//       const currentPath = window.location.pathname;
//       const currentAgent = agents.find(agent => currentPath.includes(agent.id));
//       if (currentAgent) {
//         setActiveAgent(currentAgent);
//       } else if (!activeAgent) {
//         setActiveAgent(agents[0]);
//       }
//     }
//   }, [agents, activeAgent]);

//   // Show loading if agents is still loading (empty array but userAgents undefined previously)
//   if (agents.length === 0) {
//     return (
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <div className="flex items-center gap-3 p-3 text-sm font-medium text-muted-foreground">
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
//             Loading agents...
//           </div>
//         </SidebarMenuItem>
//       </SidebarMenu>
//     );
//   }

//   // If no active agent yet (shouldn't happen with effect, but safety)
//   if (!activeAgent) {
//     return null;
//   }

//   return (
//     <>
//       <CreateAgentDialog open={open} onOpenChange={setOpen} />
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <SidebarMenuButton
//                 size="lg"
//                 className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//               >
//                 <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
//                   <activeAgent.logo className="size-4" />
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight gap-1">
//                   <span className="truncate font-medium">{activeAgent.name}</span>
//                   <span className="truncate text-xs">{activeAgent.model}</span>
//                 </div>
//                 <ChevronsUpDown className="ml-auto" />
//               </SidebarMenuButton>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
//               align="start"
//               side={isMobile ? "bottom" : "right"}
//               sideOffset={4}
//             >
//               <DropdownMenuLabel className="text-muted-foreground text-xs">
//                 Agents
//               </DropdownMenuLabel>
//               {agents.map((agent, index) => (
//                 <DropdownMenuItem
//                   key={agent.id}
//                   onClick={() => {
//                     setActiveAgent(agent);
//                     // Call the onClick callback if provided
//                     if (agent.onClick) {
//                       agent.onClick();
//                     }
//                     // Navigate to the agent's URL using client-side navigation
//                     if (agent.url !== '#') {
//                       router.push(agent.url);
//                     }
//                   }}
//                   className="gap-2 p-2"
//                 >
//                   <div className="flex size-6 items-center justify-center rounded-md border">
//                     <agent.logo className="size-3.5 shrink-0" />
//                   </div>
//                   {agent.name}
//                   <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
//                 </DropdownMenuItem>
//               ))}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem 
//                 className="gap-2 p-2" 
//                 onClick={() => setOpen(true)}
//                 onSelect={(e) => {
//                   // Prevent the dropdown from closing when clicking this item
//                   e.preventDefault();
//                   setOpen(true);
//                 }}
//               >
//                 <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
//                   <Plus className="size-4" />
//                 </div>
//                 <div className="text-muted-foreground font-medium">Create an Agent</div>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </SidebarMenuItem>
//       </SidebarMenu>
//     </>  
//   );
// }

import React from 'react'

export function AgentSwitcher() {
  return (
    <div>AgentSwitcher</div>
  )
}
