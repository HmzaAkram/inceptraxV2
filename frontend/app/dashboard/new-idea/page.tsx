"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function NewIdeaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
  if (!formData.title || !formData.description) {
    toast.error("Please fill in both fields")
    return
  }

  setIsSubmitting(true)

  try {
    const response = await apiFetch("/ideas/", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    toast.success("Idea submitted. AI analysis in progress...")
    router.push(`/dashboard/idea/${response.data.idea.id}`)
  } catch (error: any) {
    toast.error(error.message || "Failed to submit idea")
    setIsSubmitting(false)
  }



    setIsSubmitting(true)
    try {
      const response = await apiFetch("/ideas/", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      toast.success("Idea analyzed successfully!")
      router.push(`/dashboard/idea/${response.data.idea.id}/validation`)
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze idea")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gradient ">
          Create New Idea
        </h1>
        <p className="text-muted-foreground text-lg">
          Enter your startup name and idea to start the AI analysis.
        </p>
      </div>

      <Card
        className={cn(
          "border-none overflow-hidden rounded-2xl shadow-2xl",
          "bg-gradient-to-br from-white/70 to-primary/10 hover:from-white/80 hover:to-primary/20 transition-all duration-300"
        )}
      >
        <CardContent className="p-10 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-bold uppercase text-muted-foreground">
              Startup Name / Working Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. AI Coffee Roaster"
              className="h-14 rounded-xl text-lg border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-bold uppercase text-muted-foreground">
              What's your idea
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your idea..."
              className="min-h-[140px] rounded-xl resize-none text-lg border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl h-14 px-10 font-semibold flex items-center gap-3  hover:scale-105 transition-transform duration-200 shadow-lg text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Start AI Analysis <Sparkles className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
