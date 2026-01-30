"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Zap, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { ExpandableText } from "@/components/ui/expandable-text"
import { TextSelectionTooltip } from "@/components/text-selection-tooltip"

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

  const handleAnalysisUpdate = (newData: any) => {
    setIdea((prev: any) => ({
      ...prev,
      analysis_data: {
        ...prev.analysis_data,
        competitors: newData
      }
    }))
  }

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
        <h2 className="text-2xl font-bold">Competitor Analysis not found</h2>
      </div>
    )
  }

  const competitors = idea.analysis_data?.competitors || []

  return (
    <TextSelectionTooltip
      ideaId={Number(params.id)}
      section="competitors"
      sectionName="Competitor Analysis"
      onUpdate={handleAnalysisUpdate}
    >
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Competitor Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Understanding the competitive landscape for {idea.title}.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {(competitors || []).map((comp: any) => (
            <Card
              key={comp.name}
              className="border border-border shadow-sm bg-card"
            >
              <CardContent className="p-6 space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold">{comp.name || "Unknown Competitor"}</h3>
                      <Badge variant={comp.type === "Direct" ? "default" : "secondary"}>
                        {comp.type || "N/A"}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Threat Level: </span>
                      <span
                        className={
                          (comp.threat === "High" || comp.threat === "Medium")
                            ? "text-destructive font-bold"
                            : "text-amber-500 font-bold"
                        }
                      >
                        {comp.threat}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STRENGTHS & WEAKNESSES */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Strengths
                    </h4>

                    <ul className="space-y-3">
                      {(comp.strengths || []).map((s: string, i: number) => (
                        <li
                          key={i}
                          className="flex gap-3 items-start text-sm text-muted-foreground"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                          <div className="min-w-0">
                            <ExpandableText text={s} lines={2} />
                          </div>
                        </li>
                      ))}
                      {(!comp.strengths || comp.strengths.length === 0) && (
                        <li className="text-sm text-muted-foreground italic">No strengths listed.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Weaknesses
                    </h4>

                    <ul className="space-y-3">
                      {(comp.weaknesses || []).map((w: string, i: number) => (
                        <li
                          key={i}
                          className="flex gap-3 items-start text-sm text-muted-foreground"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <ExpandableText text={w} lines={2} />
                          </div>
                        </li>
                      ))}
                      {(!comp.weaknesses || comp.weaknesses.length === 0) && (
                        <li className="text-sm text-muted-foreground italic">No weaknesses listed.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!competitors || competitors.length === 0) && (
            <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
              No competitor data available.
            </div>
          )}
        </div>

        {/* EDGE */}
        <Card className="border-none shadow-sm bg-secondary text-secondary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> Your Competitive Edge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed font-medium">
              Based on the analysis of {(competitors || []).length} competitors, your
              unique advantage lies in the specific solution proposed for{" "}
              {idea.title}.
            </p>
          </CardContent>
        </Card>


        <div className="flex justify-between pt-4 pb-8">
          <Link href={`/dashboard/idea/${params.id}/market`}>
            <Button variant="outline" className="gap-2 pl-6 pr-6" size="lg">
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
          </Link>
          <Link href={`/dashboard/idea/${params.id}/monetization`}>
            <Button className="gap-2 pl-6 pr-6" size="lg">
              Next: Monetization <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div >
    </TextSelectionTooltip>
  )
}
