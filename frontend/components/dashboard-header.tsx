"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  LogOut,
  Settings,
  Sparkles,
  FileText,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "JD"

  // Cmd + K / Ctrl + K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Command Trigger */}
        <div className="flex-grow max-w-lg">
          <button
            onClick={() => setOpen(true)}
            className="w-full h-10 rounded-xl bg-muted/50 border border-border px-4 text-sm text-muted-foreground flex items-center justify-between hover:bg-muted transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Ask AI or search ideas…
            </span>
            <kbd className="text-xs border rounded px-2 py-0.5">⌘ K</kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <p className="text-sm font-bold">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")} className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Ask AI or search ideas..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => router.push("/dashboard/new-idea")}>
              <Plus className="mr-2 h-4 w-4" /> New Idea
            </CommandItem>
            
            <CommandItem onSelect={() => router.push("/dashboard/reports")}>
              <FileText className="mr-2 h-4 w-4" /> View Reports
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
