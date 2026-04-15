"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, BarChart3, ArrowRight, Plus, Loader2, Sparkles, Layers } from "lucide-react"
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

        <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-xl">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Quick Tips & Resources</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-primary-foreground/90 leading-relaxed">
      Boost your startup with these quick actionable tips and helpful resources.
    </p>
    <ul className="space-y-3 text-sm">
      <li className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
        Validate your idea early and often with real user feedback.
      </li>
      <li className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
        Use data-driven GTM strategies to target the right audience.
      </li>
      <li className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
        Monitor your KPIs regularly to track your growth trajectory.
      </li>
    </ul>
    <Button
      variant="secondary"
      className="w-full h-11 rounded-xl font-semibold shadow-md"
      onClick={() => window.open('https://example.com/resources', '_blank')}
    >
      Explore More
    </Button>
  </CardContent>
</Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6" /> AI Layers Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-indigo-100 leading-relaxed">
              Don't just analyze your idea — <strong>improve it.</strong> Our interactive engine 
              asks the critical questions that founders often miss.
            </p>
            <div className="space-y-2">
              {[
                "Deep-dive questioning",
                "Personalized insights",
                "High-accuracy analysis"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-indigo-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                  {feature}
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="secondary"
              className="w-full h-12 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform bg-white text-indigo-700 hover:bg-slate-100 border-none mt-4"
            >
              <Link href="/dashboard/new-idea">
                Launch Idea Engine <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
