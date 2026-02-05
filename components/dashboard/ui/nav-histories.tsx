"use client"

import {
  Check,
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavHistories({
  histories,
  activeUrl,
}: {
  histories: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  activeUrl?: string
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const deleteThread = useMutation(api.threads.deleteThread)
  const renameThreadTitle = useMutation(api.threads.renameThreadTitle)
  const [renamingUrl, setRenamingUrl] = React.useState<string | null>(null)
  const [renameValue, setRenameValue] = React.useState("")
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null)

  const getThreadIdFromUrl = (url: string) => {
    const prefix = "/chat/"
    if (!url.startsWith(prefix)) return null
    const id = url.slice(prefix.length)
    return id.length ? id : null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {histories.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={activeUrl === item.url}>
              <Link href={item.url} scroll={false}>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setRenamingUrl(item.url)
                    setRenameValue(item.name)
                  }}
                >
                  <Folder className="text-muted-foreground" />
                  <span>Rename Title</span>
                </DropdownMenuItem>
                {renamingUrl === item.url ? (
                  <div className="px-2 py-1.5">
                    <InputGroup>
                      <InputGroupInput
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key !== "Enter") return
                          e.preventDefault()

                          const threadId = getThreadIdFromUrl(item.url)
                          if (!threadId) return

                          const nextTitle = renameValue.trim()
                          if (!nextTitle) return

                          await renameThreadTitle({
                            threadId: threadId as Id<"threads">,
                            title: nextTitle,
                          })
                          setRenamingUrl(null)
                          router.refresh()
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Save"
                          title="Save"
                          size="icon-xs"
                          onClick={async () => {
                            const threadId = getThreadIdFromUrl(item.url)
                            if (!threadId) return

                            const nextTitle = renameValue.trim()
                            if (!nextTitle) return

                            await renameThreadTitle({
                              threadId: threadId as Id<"threads">,
                              title: nextTitle,
                            })
                            setRenamingUrl(null)
                            router.refresh()
                          }}
                        >
                          <Check />
                        </InputGroupButton>
                        <InputGroupButton
                          aria-label="Cancel"
                          title="Cancel"
                          size="icon-xs"
                          onClick={() => setRenamingUrl(null)}
                        >
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                ) : null}
                <DropdownMenuItem
                  onClick={async () => {
                    const fullUrl = `${window.location.origin}${item.url}`
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(fullUrl)
                      setCopiedUrl(item.url)
                      window.setTimeout(() => setCopiedUrl(null), 1200)
                      return
                    }

                    const textarea = document.createElement("textarea")
                    textarea.value = fullUrl
                    textarea.style.position = "fixed"
                    textarea.style.left = "-9999px"
                    textarea.style.top = "-9999px"
                    document.body.appendChild(textarea)
                    textarea.focus()
                    textarea.select()
                    document.execCommand("copy")
                    document.body.removeChild(textarea)
                    setCopiedUrl(item.url)
                    window.setTimeout(() => setCopiedUrl(null), 1200)
                  }}
                >
                  {copiedUrl === item.url ? (
                    <Check className="text-green-500 animate-in zoom-in-95 duration-200" />
                  ) : (
                    <Forward className="text-muted-foreground" />
                  )}
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={async () => {
                    const threadId = getThreadIdFromUrl(item.url)
                    if (!threadId) return

                    await deleteThread({ threadId: threadId as Id<"threads"> })

                    if (activeUrl === item.url) {
                      router.push("/chat")
                    }
                    router.refresh()
                  }}
                >
                  <Trash2 className="text-destructive" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
