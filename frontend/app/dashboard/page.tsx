import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, BarChart3, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const stats = [
  { name: "Ideas Created", value: "12", icon: Lightbulb, change: "+2 this week" },
  { name: "Avg. Validation Score", value: "78%", icon: TrendingUp, change: "Top 15% of users" },
  { name: "Reports Generated", value: "45", icon: BarChart3, change: "+5 today" },
]

const recentIdeas = [
  { id: 1, title: "AI Coffee Roaster", date: "2 hours ago", score: 85, status: "Validated" },
  { id: 2, title: "Eco-Friendly Logistics", date: "1 day ago", score: 62, status: "Researching" },
  { id: 3, title: "Virtual Pet Therapy", date: "3 days ago", score: 91, status: "Planning MVP" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane</h1>
          <p className="text-muted-foreground">Here's an overview of your startup ideas and progress.</p>
        </div>
        <Button asChild className="rounded-xl gap-2">
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-primary font-medium mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Ideas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage and track your latest concepts.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
              <Link href="/dashboard/ideas">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{idea.title}</span>
                    <span className="text-sm text-muted-foreground">{idea.date}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Validation Score</div>
                      <div className="text-xl font-bold text-primary">{idea.score}%</div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg h-9 bg-transparent" asChild>
                      <Link href={`/dashboard/idea/${idea.id}/validation`}>
                        Analyze <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
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
