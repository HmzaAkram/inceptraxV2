"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !user.is_admin) {
        // Redirect non-admins or unauthenticated users
        // The hmzaakram295@gmail.com is hardcoded as admin in the DB migration
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading || !user || !user.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-grow overflow-hidden">
        <DashboardHeader />
        <main className="flex-grow overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
