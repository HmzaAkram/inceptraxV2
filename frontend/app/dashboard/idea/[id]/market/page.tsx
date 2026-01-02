"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users, Loader2, CreditCard, Rocket } from "lucide-react"
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
        {["tam", "sam", "som"].map((key, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {key.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {market[key]}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {key === "tam"
                  ? "Total Addressable Market"
                  : key === "sam"
                    ? "Serviceable Addressable Market"
                    : "Serviceable Obtainable Market"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends & Segments */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Key Market Trends */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-primary" /> Key Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {market.trends.map((trend: any, i: number) => (
              <div key={i} className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground break-words">
                  {trend.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-normal">
                  <span>{trend.description} </span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-secondary" /> Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {market.segments.map((segment: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-muted/30 border border-border overflow-hidden"
              >
                <h3 className="font-semibold text-sm mb-1 text-foreground break-words">
                  {segment.name}
                </h3>

                <p className="text-xs text-muted-foreground mb-3 break-words whitespace-normal">
                  <ExpandableText text={segment.description} />
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 max-w-full whitespace-normal break-words text-center"
                  >
                    {segment.percentage} Segment
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 max-w-full whitespace-normal break-words text-center"
                  >
                    {segment.wtp} WTP
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Monetization Strategy */}
      {idea.analysis_data.monetization && (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" /> Monetization Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Pricing Model</h3>
                <p className="text-sm text-muted-foreground">{idea.analysis_data.monetization.pricing_model}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Conversion Logic</h3>
                <p className="text-sm text-muted-foreground">{idea.analysis_data.monetization.conversion_logic}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Recommended Plans</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {idea.analysis_data.monetization.plans.map((plan: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm">{plan.name}</h4>
                      <Badge variant="outline" className="text-[10px]">{plan.price}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-3 leading-tight">{plan.target}</p>
                    <ul className="space-y-1">
                      {plan.features.map((f: string, j: number) => (
                        <li key={j} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-xs text-primary uppercase tracking-wider mb-1">Recommended Strategy</h3>
              <p className="text-sm text-foreground leading-relaxed italic">
                "{idea.analysis_data.monetization.recommended_strategy}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GTM Strategy */}
      {idea.analysis_data.gtm_strategy && (
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Rocket className="h-5 w-5 text-accent" /> Acquisition Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {idea.analysis_data.gtm_strategy.acquisition_channels.map((ac: any, i: number) => (
                <div key={i} className="space-y-1 p-3 rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-sm text-foreground">{ac.channel}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ac.strategy}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Funnel Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1 bg-border h-4" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-1 bg-border h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Awareness</h4>
                    <p className="text-sm text-foreground">{idea.analysis_data.gtm_strategy.funnel_stages.awareness}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1 bg-border h-4" />
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <div className="w-1 bg-border h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Activation</h4>
                    <p className="text-sm text-foreground">{idea.analysis_data.gtm_strategy.funnel_stages.activation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1 bg-border h-4" />
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="w-1 bg-border h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Conversion</h4>
                    <p className="text-sm text-foreground">{idea.analysis_data.gtm_strategy.funnel_stages.conversion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-accent/10 border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-accent tracking-widest">
                  Early Traction (First 1,000 Users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {idea.analysis_data.gtm_strategy.early_traction}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
