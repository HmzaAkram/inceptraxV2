"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, TrendingUp, ThumbsUp, Target, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function IdeaValidationPage() {
  const params = useParams()
  const [idea, setIdea] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchIdea() {
      try {
        const response = await apiFetch(`/ideas/${params.id}`)
        setIdea(response.data.idea)
      } catch (error) {
        console.error("Failed to fetch idea:", error)
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

  if (!idea || !idea.analysis_data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Analysis not found</h2>
        <p className="text-muted-foreground mt-2">We couldn't retrieve the validation report for this idea.</p>
      </div>
    )
  }

  const analysis = idea.analysis_data

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{idea.title} Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {idea.description}
          </p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
            <p className="text-3xl font-bold text-primary">{analysis.overall_score}/100</p>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold text-foreground">
            {analysis.overall_score}%
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <ThumbsUp className="h-4 w-4 text-primary" /> Market Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analysis.scores.market_demand.label}</div>
            <Progress value={analysis.scores.market_demand.value} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Target className="h-4 w-4 text-secondary" /> Problem Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analysis.scores.problem_severity.label}</div>
            <Progress value={analysis.scores.problem_severity.value} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-accent" /> Growth Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analysis.scores.growth_potential.label}</div>
            <Progress value={analysis.scores.growth_potential.value} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.strengths.map((strength: string, i: number) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>{strength}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Risks & Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.risks.map((risk: string, i: number) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="h-3 w-3" />
                </div>
                <span>{risk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed opacity-90">
            {analysis.recommendation}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
