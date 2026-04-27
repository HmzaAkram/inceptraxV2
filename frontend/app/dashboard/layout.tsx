import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex">
        <DashboardSidebar />
      </div>

      <div className="flex flex-col flex-grow overflow-hidden">
        <DashboardHeader />
        <main className="flex-grow overflow-y-auto p-4 md:p-6 animate-fade-in pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — only visible on <md */}
      <MobileBottomNav />
    </div>
  )
}
