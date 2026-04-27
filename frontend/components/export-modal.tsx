"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Check, Presentation, Download } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideaId: number
  ideaTitle: string
}

type ThemeKey = "dark_executive" | "clean_light" | "gradient_bold"

const TEMPLATES: {
  key: ThemeKey
  name: string
  description: string
  bestFor: string
  preview: { bg: string; accent: string; text: string; card: string }
}[] = [
  {
    key: "dark_executive",
    name: "Dark Executive",
    description: "Premium, investor-ready dark theme with high contrast.",
    bestFor: "Investor pitches, serious presentations",
    preview: { bg: "#0A0A14", accent: "#6366F1", text: "#F1F5F9", card: "#111827" },
  },
  {
    key: "clean_light",
    name: "Clean Light",
    description: "Clean, minimal and professional white layout.",
    bestFor: "Corporate, accelerators, demo days",
    preview: { bg: "#FFFFFF", accent: "#6366F1", text: "#0F172A", card: "#F8FAFC" },
  },
  {
    key: "gradient_bold",
    name: "Gradient Bold",
    description: "Modern tech startup aesthetic with vibrant cyan accents.",
    bestFor: "Tech competitions, hackathons, demo pitches",
    preview: { bg: "#0D1117", accent: "#00D4FF", text: "#FFFFFF", card: "#161B22" },
  },
]

function ThemePreview({ preview }: { preview: (typeof TEMPLATES)[0]["preview"] }) {
  return (
    <div
      className="w-full h-24 rounded-lg overflow-hidden relative flex-shrink-0"
      style={{ background: preview.bg, border: `1.5px solid ${preview.accent}33` }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: preview.accent }} />
      {/* Fake slide content */}
      <div className="px-3 pt-3 space-y-1.5">
        <div className="h-2 w-2/3 rounded-sm" style={{ background: preview.text, opacity: 0.9 }} />
        <div className="h-1.5 w-1/2 rounded-sm" style={{ background: preview.text, opacity: 0.4 }} />
        {/* Card */}
        <div className="h-8 rounded-sm mt-1" style={{ background: preview.card, border: `0.5px solid ${preview.accent}44` }}>
          <div className="h-full flex items-center gap-1.5 px-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: preview.accent }} />
            <div className="h-1 w-12 rounded-sm" style={{ background: preview.text, opacity: 0.5 }} />
          </div>
        </div>
      </div>
      {/* Bottom slide number */}
      <div className="absolute bottom-1.5 right-2.5">
        <div className="h-1 w-2 rounded-sm" style={{ background: preview.text, opacity: 0.3 }} />
      </div>
    </div>
  )
}

export function ExportModal({ open, onOpenChange, ideaId, ideaTitle }: ExportModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!selectedTheme || isGenerating) return
    setIsGenerating(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/ideas/${ideaId}/export/ppt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ theme: selectedTheme }),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Export failed")
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${ideaTitle.replace(/\s+/g, "-")}-InvestorDeck.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Your presentation is ready!")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate presentation")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary" />
              Choose Your Presentation Style
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a theme that matches your audience. All real analysis data will be included.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Template Cards */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => {
            const selected = selectedTheme === tpl.key
            return (
              <button
                key={tpl.key}
                onClick={() => setSelectedTheme(tpl.key)}
                className={cn(
                  "relative text-left rounded-xl border-2 p-3 transition-all duration-150 focus:outline-none",
                  selected
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
              >
                {/* Check badge */}
                {selected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                <ThemePreview preview={tpl.preview} />

                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold leading-none">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{tpl.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    <span className="font-medium">Best for:</span> {tpl.bestFor}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {selectedTheme
              ? `Selected: ${TEMPLATES.find((t) => t.key === selectedTheme)?.name}`
              : "No template selected"}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedTheme || isGenerating}
              onClick={handleGenerate}
              className="gap-2 min-w-[11rem]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building your deck…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Presentation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
