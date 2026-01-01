"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, BarChart3, ArrowRight, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

interface Stat {
  name: string;
  value: string;
  icon: any;
  change: string;
}

interface Idea {
  id: number;
  title: string;
  created_at: string;
  validation_score: number;
  status: string;
}

const iconMap: Record<string, any> = {
  Lightbulb,
  TrendingUp,
  BarChart3,
};

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stat[]>([])
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, ideasData] = await Promise.all([
          apiFetch("/users/stats"),
          apiFetch("/ideas/")
        ]);

        const formattedStats = statsData.data.stats.map((s: any) => ({
          ...s,
          icon: iconMap[s.icon] || Lightbulb
        }));

        setStats(formattedStats);
        setRecentIdeas(ideasData.data.ideas.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.first_name || 'Founder'}</h1>
          <p className="text-muted-foreground">Here's an overview of your startup ideas and progress.</p>
        </div>
        <Button asChild className="rounded-xl gap-2 font-semibold">
          <Link href="/dashboard/new-idea">
            <Plus className="h-5 w-5" /> New Idea
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-primary font-medium mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Ideas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage and track your latest concepts.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium" asChild>
              <Link href="/dashboard/ideas">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentIdeas.length > 0 ? (
                recentIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-foreground">{idea.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(idea.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground">Validation Score</div>
                        <div className="text-xl font-bold text-primary">{idea.validation_score || 0}%</div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg h-9 bg-transparent border-primary/20 text-primary hover:bg-primary/5" asChild>
                        <Link href={`/dashboard/idea/${idea.id}/validation`}>
                          Analyze <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No ideas yet. Create your first one to see it here!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-xl">Upgrade to Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-primary-foreground/80 leading-relaxed">
              Unlock unlimited idea validation, deep-dive market research, and priority AI processing.
            </p>
            <Button variant="secondary" className="w-full h-11 rounded-xl font-semibold shadow-md">
              Start Free Trial
            </Button>
            <ul className="space-y-3 text-sm pt-4">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                Unlimited deep-dives
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                Advanced GTM strategies
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                Export as PDF/JSON
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
