"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function MVPBlueprintPage() {
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

    if (!idea || !idea.analysis_data || !idea.analysis_data.mvp_blueprint) {
        return (
            <div className="text-center py-20 text-foreground">
                <h2 className="text-2xl font-bold">MVP Blueprint not found</h2>
            </div>
        )
    }

    const blueprint = idea.analysis_data.mvp_blueprint

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    MVP Blueprint
                </h1>
                <p className="text-muted-foreground mt-1">
                    Minimum Viable Product roadmap and AI capabilities for {idea.title}.
                </p>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Zap className="h-5 w-5 text-primary" /> Core Feature Set
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {blueprint.map((feature: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1 max-w-xl">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-foreground">{feature.feature_name}</h3>
                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 bg-primary/10 text-primary border-none">
                                            {feature.ai_capability}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{feature.problem_solved}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Priority</p>
                                        <Badge variant={feature.priority === "Must-have" ? "default" : "outline"} className="text-[10px]">
                                            {feature.priority}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Value</p>
                                        <p className="text-sm font-bold text-foreground">{feature.business_value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
