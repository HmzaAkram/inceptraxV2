"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { ExpandableText } from "@/components/ui/expandable-text"

export default function MarketResearchPage() {
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
        <h2 className="text-2xl font-bold">Market Analysis not found</h2>
      </div>
    )
  }

  const market = idea.analysis_data.market_research

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Market Research
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep-dive into the target market for {idea.title}.
          </p>
        </div>
      </div>

      {/* TAM / SAM / SOM */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              TAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{market.tam}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total Addressable Market
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              SAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{market.sam}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Serviceable Addressable Market
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              SOM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{market.som}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Serviceable Obtainable Market
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends & Segments */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-primary" /> Key Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {market.trends.map((trend: any, i: number) => (
              <div key={i} className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">
                  {trend.title}
                </h3>

                {/* ONLY THIS LINE CHANGED */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <ExpandableText text={trend.description} />
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-secondary" /> Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {market.segments.map((segment: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-muted/30 border border-border"
              >
                <h3 className="font-semibold text-sm mb-1 text-foreground">
                  {segment.name}
                </h3>

                {/* ONLY THIS LINE CHANGED */}
                <p className="text-xs text-muted-foreground mb-3">
                  <ExpandableText text={segment.description} />
                </p>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {segment.percentage} Segment
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {segment.wtp} WTP
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
