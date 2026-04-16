"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  Circle,
  Wrench,
  BookOpen,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Zap,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ResearchLink {
  title: string
  url: string
  source: string
  relevance: string
}

interface ChecklistItem {
  phase: "Validation" | "MVP" | "Growth"
  step: string
  description: string
}

interface ToolRecommendation {
  name: string
  category: string
  url: string
  use_case: string
}

interface ActionWeek {
  week: number
  focus: string
  tasks: string[]
}

interface HubData {
  research_links: ResearchLink[]
  execution_checklist: ChecklistItem[]
  tool_recommendations: ToolRecommendation[]
  action_plan: ActionWeek[]
}

// ─────────────────────────────────────────────
// Section Tab configuration
// ─────────────────────────────────────────────
const TABS = [
  { id: "research",  label: "Deep Dive Research",    icon: BookOpen },
  { id: "checklist", label: "Execution Checklist",   icon: CheckCircle2 },
  { id: "tools",    label: "Tool Recommendations",   icon: Wrench },
  { id: "plan",     label: "Action Plan",            icon: Calendar },
] as const

type TabId = typeof TABS[number]["id"]

// Phase styling
const PHASE_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  Validation: { color: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/30",  dot: "bg-blue-500" },
  MVP:        { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", dot: "bg-violet-500" },
  Growth:     { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-500" },
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ResearchHubPage() {
  const params = useParams()
  const ideaId = params.id as string

  const [hub, setHub]           = useState<HubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("research")
  const [checked, setChecked]   = useState<Record<string, boolean>>({})

  // ── Load persisted checkbox state ──────────
  useEffect(() => {
    if (!ideaId) return
    const stored = localStorage.getItem(`hub-checklist-${ideaId}`)
    if (stored) setChecked(JSON.parse(stored))
  }, [ideaId])

  // ── Fetch / generate hub data ───────────────
  const fetchHub = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiFetch(`/ideas/${ideaId}/research-hub`, { method: "POST" })
      if (response.data?.hub) {
        setHub(response.data.hub)
      } else {
        setError("Hub data could not be retrieved.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate Research Hub.")
    } finally {
      setIsLoading(false)
    }
  }, [ideaId])

  useEffect(() => { fetchHub() }, [fetchHub])

  // ── Toggle checkbox with persistence ───────
  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(`hub-checklist-${ideaId}`, JSON.stringify(next))
      return next
    })
  }

  // ─────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FlaskConical className="h-7 w-7 text-primary animate-bounce" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="font-semibold text-foreground">Generating your Research Hub…</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Our AI is curating resources, tools, and an action plan specific to your idea. This takes about 15 seconds.
          </p>
        </div>
        <div className="flex gap-2">
          {["Deep Dive", "Checklist", "Tools", "Plan"].map((label, i) => (
            <div
              key={label}
              className="h-1.5 w-16 rounded-full bg-muted overflow-hidden"
            >
              <div
                className="h-full bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // Error State
  // ─────────────────────────────────────────────
  if (error || !hub) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">Hub Generation Failed</h2>
        <p className="text-muted-foreground max-w-sm">{error || "Unknown error occurred."}</p>
        <Button onClick={() => fetchHub()} className="gap-2 mt-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  // ── Checklist stats ─────────────────────────
  const phases = ["Validation", "MVP", "Growth"] as const
  const byPhase = (phase: string) =>
    hub.execution_checklist.filter(item => item.phase === phase)
  const phaseProgress = (phase: string) => {
    const items = byPhase(phase)
    if (!items.length) return 0
    const done = items.filter((_, i) => checked[`${phase}-${i}`]).length
    return Math.round((done / items.length) * 100)
  }
  const totalDone  = hub.execution_checklist.filter((item, i) => checked[`${item.phase}-${byPhase(item.phase).indexOf(item)}`]).length
  const totalSteps = hub.execution_checklist.length

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ── Hero ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none gap-1.5">
              <FlaskConical className="h-3 w-3" />
              Research &amp; Execution Hub
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Execution Playbook
          </h1>
          <p className="text-muted-foreground mt-1">
            Curated resources, step-by-step guides, and tools — tailored to your idea&apos;s stage and industry.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => {
            // Clear cache hint by removing from analysis — just re-fetch (server handles cache)
            fetchHub(true)
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Hub
        </Button>
      </div>

      {/* ── Stat Pills ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Research Links",  value: hub.research_links.length,        icon: BookOpen,   color: "text-blue-500" },
          { label: "Checklist Steps", value: `${totalDone}/${totalSteps}`,     icon: CheckCircle2, color: "text-violet-500" },
          { label: "Curated Tools",   value: hub.tool_recommendations.length,  icon: Wrench,     color: "text-amber-500" },
          { label: "Week Sprint",     value: `${hub.action_plan.length} Weeks`, icon: Calendar,  color: "text-emerald-500" },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
          >
            <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          Section: Deep Dive Research
      ═══════════════════════════════════════════ */}
      {activeTab === "research" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Deep Dive Research</h2>
            <span className="text-sm text-muted-foreground ml-1">— Authoritative sources for your market</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {hub.research_links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-xs font-medium border-border shrink-0">
                        {link.source}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {link.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {link.relevance}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
          {hub.research_links.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No research links available.</p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Section: Execution Checklist
      ═══════════════════════════════════════════ */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Execution Checklist</h2>
            <span className="text-sm text-muted-foreground ml-1">— Your progress is saved automatically</span>
          </div>

          {/* Overall progress */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm font-bold text-primary">{totalDone}/{totalSteps} steps</span>
            </div>
            <Progress value={totalSteps ? Math.round(totalDone / totalSteps * 100) : 0} className="h-2" />
          </div>

          {/* Phases */}
          {phases.map(phase => {
            const items  = byPhase(phase)
            const prog   = phaseProgress(phase)
            const cfg    = PHASE_CONFIG[phase]
            return (
              <div key={phase} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
                    <h3 className={cn("font-semibold text-sm uppercase tracking-wider", cfg.color)}>
                      {phase} Phase
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{prog}% complete</span>
                </div>
                <Progress value={prog} className="h-1.5" />
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const key    = `${phase}-${i}`
                    const isDone = !!checked[key]
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCheck(key)}
                        className={cn(
                          "group w-full flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left",
                          isDone
                            ? "bg-muted/40 border-border/50 opacity-70"
                            : cn("border-border hover:border-primary/30", cfg.bg)
                        )}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isDone
                            ? <CheckCircle2 className={cn("h-4 w-4", cfg.color)} />
                            : <Circle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium transition-colors",
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {item.step}
                          </p>
                          {!isDone && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Section: Tool Recommendations
      ═══════════════════════════════════════════ */}
      {activeTab === "tools" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Tool Recommendations</h2>
            <span className="text-sm text-muted-foreground ml-1">— Handpicked for your idea</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hub.tool_recommendations.map((tool, i) => (
              <Card key={i} className="border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2 font-medium">
                        {tool.category}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </CardTitle>
                    </div>
                    <div className="p-1.5 rounded-lg bg-muted mt-1 shrink-0">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.use_case}
                  </p>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs group-hover:border-primary/40 group-hover:text-primary transition-colors">
                      Open Tool
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
          {hub.tool_recommendations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No tool recommendations available.</p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Section: Action Plan
      ═══════════════════════════════════════════ */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">8-Week Action Plan</h2>
            <span className="text-sm text-muted-foreground ml-1">— Sprint-based execution roadmap</span>
          </div>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border" />

            <div className="space-y-4">
              {hub.action_plan.map((week, i) => {
                const isEven    = i % 2 === 0
                const dotColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"]
                const dotColor  = dotColors[i % dotColors.length]
                return (
                  <div key={week.week} className="flex gap-5">
                    {/* Timeline dot */}
                    <div className="relative shrink-0 flex flex-col items-center" style={{ width: 44 }}>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 border-background z-10 flex items-center justify-center shadow-sm",
                        dotColor
                      )}>
                        <span className="text-[9px] text-white font-bold">{week.week}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs font-semibold border-border">
                            Week {week.week}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">{week.focus}</span>
                        </div>
                        <div className="space-y-1.5">
                          {(week.tasks || []).map((task, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-xs text-muted-foreground leading-relaxed">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {hub.action_plan.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No action plan available.</p>
          )}

          {/* Final CTA */}
          <div className="mt-8 p-5 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-primary mx-auto" />
            <p className="font-semibold text-foreground">Ready to Execute?</p>
            <p className="text-sm text-muted-foreground">
              Start with Week 1 and check items off in the Execution Checklist as you go. Your progress is automatically saved.
            </p>
            <Button
              size="sm"
              className="mt-2 gap-2"
              onClick={() => setActiveTab("checklist")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Go to Checklist
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
