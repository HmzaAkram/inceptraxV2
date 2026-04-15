"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Briefcase, Copy, Download, Check, AlertCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function InvestorPage() {
  const params = useParams()
  const [pitches, setPitches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    async function fetchPitches() {
      try {
        const response = await apiFetch(`/ideas/${params.id}/investor-pitch`, {
          method: 'POST'
        });
        if (response.data && response.data.pitches) {
            setPitches(response.data.pitches);
        } else {
            setError("Failed to generate pitches.");
        }
      } catch (err: any) {
        console.error("Failed to fetch pitches:", err)
        setError(err.message || "Failed to load investor pitches.");
      } finally {
        setIsLoading(false)
      }
    }
    fetchPitches()
  }, [params.id])

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  
  const handleDownloadPPT = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ideas/${params.id}/download-ppt`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `idea-${params.id}-presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch(err) {
        console.error("Failed to download presentation", err);
        alert("Failed to generate presentation.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Generating your investor pitches. This may take a few moments...</p>
      </div>
    )
  }

  if (error || pitches.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Pitch Generation Failed</h2>
        <p className="text-muted-foreground mt-2">{error || "Could not generate investor pitches."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              <Briefcase className="h-3 w-3 mr-1" />
              Investor Ready
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Investor Pitches</h1>
          <p className="text-muted-foreground mt-1">
            Choose from 3 distinct generated pitch styles to present your idea optimally.
          </p>
        </div>
        
        <Button onClick={handleDownloadPPT} className="gap-2 shrink-0" variant="default">
          <Download className="h-4 w-4" />
          Generate Presentation (PPT)
        </Button>
      </div>

      <div className="grid gap-6">
        {pitches.map((pitch, index) => (
          <Card key={index} className="border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 text-primary border-primary/20">Version {index + 1}</Badge>
                    <CardTitle className="text-xl capitalize">{pitch.style || "Standard Pitch"}</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                        "gap-2",
                        copiedIndex === index ? "text-green-500 border-green-500 bg-green-500/10 hover:bg-green-500/10" : ""
                    )}
                    onClick={() => copyToClipboard(pitch.full_pitch, index)}
                  >
                    {copiedIndex === index ? (
                        <><Check className="h-4 w-4" /> Copied</>
                    ) : (
                        <><Copy className="h-4 w-4" /> Copy Pitch</>
                    )}
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Hook</h4>
                  <p className="text-foreground italic">"{pitch.hook}"</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">The Problem</h4>
                        <p className="text-foreground bg-accent/5 p-3 rounded-lg text-sm">{pitch.problem}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">The Solution</h4>
                        <p className="text-foreground bg-primary/5 p-3 rounded-lg text-sm border border-primary/10">{pitch.solution}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Market & Traction</h4>
                        <p className="text-foreground text-sm">{pitch.traction_market}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">The Ask</h4>
                        <p className="text-foreground font-medium text-sm border-l-2 border-primary pl-3">{pitch.ask}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
