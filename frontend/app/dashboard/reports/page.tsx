"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Calendar, Sparkles, Loader2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Idea {
  id: number
  title: string
  created_at: string
}

export default function ReportsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const response = await apiFetch("/ideas/")
        setIdeas(response.data.ideas)
      } catch (error) {
        console.error("Failed to fetch ideas for reports:", error)
        toast.error("Failed to load reports")
      } finally {
        setIsLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  const handleDownload = async (ideaId: number, title: string) => {
    setIsDownloading(ideaId)
    try {
      const blob = await apiFetch(`/ideas/${ideaId}/download`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '-')}-Full-Analysis.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Report downloaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to download report")
    } finally {
      setIsDownloading(null)
    }
  }

  // ZIP Export All PDFs
  const handleExportAll = async () => {
    if (ideas.length === 0) {
      toast.error("No reports to export")
      return
    }
    setIsExporting(true)
    try {
      const zip = new JSZip()
      for (const idea of ideas) {
        const blob: Blob = await apiFetch(`/ideas/${idea.id}/download`)
        zip.file(`${idea.title.replace(/\s+/g, '-')}-Full-Analysis.pdf`, blob)
      }
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "All_Idea_Reports.zip")
      toast.success("All reports exported successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to export reports")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async (ideaId: number) => {
    setIsDeleting(ideaId)
    try {
      await apiFetch(`/ideas/${ideaId}`, { method: "DELETE" })
      setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
      toast.success("Report deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete report")
    } finally {
      setIsDeleting(null)
    }
  }

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
        <Button
          className="rounded-xl gap-2 font-semibold"
          onClick={handleExportAll}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}{" "}
          Export All Data
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => handleDownload(idea.id, idea.title)}
                    disabled={isDownloading === idea.id}
                  >
                    {isDownloading === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-2 bg-transparent border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                        disabled={isDeleting === idea.id}
                      >
                        {isDeleting === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border-border rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the report and its associated PDF files from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-semibold"
                          onClick={() => handleDelete(idea.id)}
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
    </div>
  )
}
