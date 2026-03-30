"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Camera,
  CircleUserRound,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)

  const updateUserDetails = useMutation(api.users.updateUserDetails)
  const generateAvatarUploadUrl = useMutation(api.users.generateAvatarUploadUrl)
  const saveUserAvatar = useMutation(api.users.saveUserAvatar)

  const [name, setName] = React.useState(user.name)
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatar)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const hasAvatar = Boolean(avatarUrl && avatarUrl.trim().length > 0)

  console.log("-------hasavatar", hasAvatar)
  console.log("-------avatarUrl", avatarUrl)

  React.useEffect(() => {
    setAvatarUrl(user.avatar)
  }, [user.avatar])

  React.useEffect(() => {
    if (!isProfileOpen) return
    setName(user.name)
  }, [isProfileOpen, user.name])

  const handlePickAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return
    setIsUploading(true)
    try {
      const uploadUrl = await generateAvatarUploadUrl({})
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })
      const json = (await res.json()) as { storageId?: string }
      if (!json.storageId) {
        throw new Error("Upload failed")
      }

      const updatedUser = await saveUserAvatar({
        storageId: json.storageId as Id<"_storage">,
      })
      const nextAvatarUrl = updatedUser?.avatar_url
      if (typeof nextAvatarUrl === "string") {
        setAvatarUrl(nextAvatarUrl)
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await updateUserDetails({ name })
      setIsProfileOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {hasAvatar ? <AvatarImage src={avatarUrl} alt={user.name} /> : null}
                <AvatarFallback className="rounded-lg">
                  <CircleUserRound className="size-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {hasAvatar ? <AvatarImage src={avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-lg">
                    <CircleUserRound className="size-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setIsProfileOpen(true)
                }}
              >
                <CircleUserRound />
                Profile
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() =>
            void signOut().then(() => {
              router.push("/");
            })
          }>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Manage your profile details.</DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarFile(e.target.files?.[0] ?? null)}
          />

          <Card className="border-0 py-0 shadow-none">
            <CardContent className="px-0 space-y-5">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="relative"
                  onClick={handlePickAvatar}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  <Avatar className="h-16 w-16 rounded-xl">
                    {hasAvatar ? <AvatarImage src={avatarUrl} alt={user.name} /> : null}
                    <AvatarFallback className="rounded-xl">
                      <CircleUserRound className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="bg-background border absolute -bottom-1 -right-1 inline-flex size-7 items-center justify-center rounded-full shadow-sm">
                    <Camera className="size-4" />
                  </span>
                </button>

                <div className="min-w-0">
                  <div className="truncate font-medium">{user.name}</div>
                  <div className="text-muted-foreground truncate text-sm">
                    {isUploading ? "Uploading..." : "Click the photo to change"}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={user.email} readOnly disabled />
              </div>

              <Button
                className="w-full"
                onClick={() => void handleSaveChanges()}
                disabled={isSaving || isUploading || name.trim().length === 0}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
