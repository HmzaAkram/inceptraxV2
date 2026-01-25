"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  Target,
  Loader2
} from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function IdeaValidationPage() {
  const params = useParams()
  const [idea, setIdea] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIdea() {
      try {
        const ideaData = await apiFetch(`/ideas/${params.id}`)
        setIdea(ideaData) // Corrected: use the response directly
      } catch (err: any) {
        console.error("Failed to fetch idea:", err)
        setError(err.message || "Failed to fetch idea")
      } finally {
        setIsLoading(false)
      }
    }
    fetchIdea()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Idea not found</h2>
      </div>
    )
  }

  const analysis = idea.analysis_data

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Analysis not found</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't retrieve the validation report for this idea.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              Validation Report
            </Badge>
            <span className="text-sm text-muted-foreground">
              Generated {new Date(idea.updated_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {idea.title ?? "Untitled"} Analysis
          </h1>
          <p className="text-muted-foreground mt-1">{idea.pitch ?? ""}</p>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
            <p className="text-3xl font-bold text-primary">
              {analysis.overall_score ?? 0}/100
            </p>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold text-foreground">
            {analysis.overall_score ?? 0}%
          </div>
        </div>
      </div>

      {/* Scores Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreCard
          title="Market Demand"
          icon={<ThumbsUp className="h-4 w-4 text-primary" />}
          score={analysis?.scores?.market_demand}
        />
        <ScoreCard
          title="Problem Severity"
          icon={<Target className="h-4 w-4 text-secondary" />}
          score={analysis?.scores?.problem_severity}
        />
        <ScoreCard
          title="Growth Potential"
          icon={<TrendingUp className="h-4 w-4 text-accent" />}
          score={analysis?.scores?.growth_potential}
        />
      </div>

      {/* Strengths and Risks */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ListCard
          title="Key Strengths"
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          items={analysis?.strengths ?? []}
          color="green"
        />
        <ListCard
          title="Risks & Challenges"
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          items={analysis?.risks ?? []}
          color="amber"
        />
      </div>

      {/* Recommendation */}
      <Card className="border-none shadow-sm bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed opacity-90">{analysis?.recommendation ?? "No recommendation available."}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ----------------- Helper Components -----------------

function ScoreCard({
  title,
  icon,
  score
}: {
  title: string
  icon: React.ReactNode
  score?: { label?: string; value?: number }
}) {
  return (
    <Card className="border-none shadow-sm bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{score?.label ?? "N/A"}</div>
        <Progress value={score?.value ?? 0} className="h-2 mt-2" />
      </CardContent>
    </Card>
  )
}

function ListCard({
  title,
  icon,
  items,
  color
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  color: "green" | "amber"
}) {
  const bgColor = color === "green" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">No data available</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <div className={`h-5 w-5 rounded-full ${bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                {color === "green" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              </div>
              <span>{item}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
