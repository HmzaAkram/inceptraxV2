"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function CompetitorAnalysisPage() {
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
      <div className="text-center py-20 text-foreground">
        <h2 className="text-2xl font-bold">Competitor Analysis not found</h2>
      </div>
    )
  }

  const competitors = idea.analysis_data.competitors

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Competitor Analysis</h1>
          <p className="text-muted-foreground mt-1">Understanding the competitive landscape for {idea.title}.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {competitors.map((comp: any) => (
          <Card key={comp.name} className="border-none shadow-sm overflow-hidden bg-card/50">
            <div className="grid md:grid-cols-4 divide-x divide-border">
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-xl text-foreground">{comp.name}</h3>
                  <Badge variant={comp.type === "Direct" ? "default" : "secondary"}>{comp.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Threat Level:</span>
                  <span className={comp.threat === "High" ? "text-destructive font-bold" : "text-amber-500 font-bold"}>
                    {comp.threat}
                  </span>
                </div>
              </div>
              <div className="p-6 md:col-span-3 grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {comp.strengths.map((s: string) => (
                      <li key={s} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <div className="h-1 w-1 rounded-full bg-border mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {comp.weaknesses.map((w: string) => (
                      <li key={w} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <div className="h-1 w-1 rounded-full bg-border mt-2" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-secondary text-secondary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Your Competitive Edge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed font-medium">
            Based on the analysis of {competitors.length} competitors, your unique advantage lies in the specific solution proposed for {idea.title}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
