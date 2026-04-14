"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Lightbulb, Zap, MousePointer2, Loader2, ArrowUpRight } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface AdminStats {
  total_users: number
  total_ideas: number
  signups_today: number
  total_visitors: number
  api_usage: {
    used: number
    remaining: number
    total_budget: number
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiFetch("/admin/stats")
        setStats(response)
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      name: "Total Users",
      value: stats.total_users,
      icon: Users,
      change: `${stats.signups_today} new today`,
      color: "text-blue-500",
    },
    {
      name: "Total Ideas",
      value: stats.total_ideas,
      icon: Lightbulb,
      change: "Lifetime ideas",
      color: "text-amber-500",
    },
    {
      name: "Website Hits",
      value: stats.total_visitors,
      icon: MousePointer2,
      change: "Unique sessions",
      color: "text-green-500",
    },
    {
      name: "Gemini Credits",
      value: stats.api_usage.remaining,
      icon: Zap,
      change: `${stats.api_usage.used} used so far`,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Control Center</h1>
        <p className="text-muted-foreground">Real-time overview of Inceptrax platform health and growth.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-primary font-medium mt-1 inline-flex items-center gap-1">
                {stat.change} <ArrowUpRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm h-full">
          <CardHeader>
            <CardTitle>Gemini API Usage</CardTitle>
            <p className="text-sm text-muted-foreground">Resource consumption tracking</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage Progress</span>
                <span className="font-medium">{((stats.api_usage.used / stats.api_usage.total_budget) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(stats.api_usage.used / stats.api_usage.total_budget) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Used Credits</p>
                <p className="text-lg font-bold">{stats.api_usage.used}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Remaining</p>
                <p className="text-lg font-bold">{stats.api_usage.remaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Admin Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-primary-foreground/90 leading-relaxed">
              Quickly manage the platform assets and user base.
            </p>
            <div className="grid gap-2">
               <button className="w-full h-11 rounded-xl bg-white text-primary font-semibold shadow-md hover:bg-white/90 transition-colors text-left px-4 flex items-center justify-between">
                 View All Users <ArrowUpRight className="h-4 w-4" />
               </button>
               <button className="w-full h-11 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors text-left px-4 flex items-center justify-between">
                 System Logs <ArrowUpRight className="h-4 w-4" />
               </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
