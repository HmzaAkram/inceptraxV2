"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Calendar, Sparkles, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"
import Link from "next/link"

interface Idea {
  id: number;
  title: string;
  created_at: string;
}

export default function ReportsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const response = await apiFetch("/ideas/")
        setIdeas(response.data.ideas)
      } catch (error) {
        console.error("Failed to fetch ideas for reports:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Insights</h1>
          <p className="text-muted-foreground mt-1">Access and export your generated AI analysis reports.</p>
        </div>
        <Button className="rounded-xl gap-2 font-semibold">
          <Download className="h-4 w-4" /> Export All Data
        </Button>
      </div>

      <div className="grid gap-6">
        {ideas.length > 0 ? (
          ideas.map((idea) => (
            <Card key={idea.id} className="border-none shadow-sm overflow-hidden group bg-card/50">
              <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-foreground">{idea.title} - Full Analysis</h3>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] uppercase">
                      Complete Business Plan
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                    <span>Dynamic PDF</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5" asChild>
                    <Link href={`/dashboard/idea/${idea.id}/validation`}>
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
            No reports generated yet. Analyze an idea to see it here.
          </div>
        )}
      </div>

      <Card className="border-none shadow-sm bg-muted/50 border border-dashed border-border p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Generate a new Custom Report</h2>
          <p className="text-muted-foreground">
            Need a specific deep-dive into a niche market or technical feasibility? Our custom AI agent can generate a
            tailored report in minutes.
          </p>
          <Button variant="secondary" className="rounded-xl mt-4 font-semibold shadow-sm">
            Request Custom Analysis
          </Button>
        </div>
      </Card>
    </div>
  )
}
