"use client"

import { Bell, Search, LogOut, User, Settings, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { useAuth } from "@/components/auth-provider"

export function DashboardHeader() {
  const { user, logout } = useAuth()

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'JD'

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-grow max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas or analysis..."
            className="pl-10 h-10 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
