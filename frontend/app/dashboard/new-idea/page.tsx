"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, Mic, Upload, FileUp, X, StopCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function NewIdeaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

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

      toast.success("Idea analyzed successfully!")
      router.push(`/dashboard/idea/${response.data.idea.id}/validation`)
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze idea")
      setIsSubmitting(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        handleVoiceUpload(blob)
        stream.getTracks().forEach(track => track.stop()) // Stop mic
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      toast.error("Microphone access denied")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const handleVoiceUpload = async (audioBlob: Blob) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", audioBlob, "recording.webm")

    try {
      const response = await apiFetch("/ideas/upload/voice", {
        method: "POST",
        body: formData,
      })

      const { title, description } = response.data
      setFormData({ title: title || "", description: description || "" })
      toast.success("Idea extracted from voice!")
    } catch (error: any) {
      toast.error("Failed to process voice: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await apiFetch("/ideas/upload/file", {
        method: "POST",
        body: formData,
      })

      const { title, description } = response.data
      setFormData({ title: title || "", description: description || "" })
      toast.success("Idea extracted from file!")
    } catch (error: any) {
      toast.error("Failed to process file: " + error.message)
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ""
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

      <div className="flex gap-4 mb-8 justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "secondary"}
          className="rounded-xl h-12 gap-2 shadow-sm"
          disabled={isUploading}
        >
          {isRecording ? (
            <>
              <StopCircle className="h-4 w-4 animate-pulse" /> Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> Voice Input
            </>
          )}
        </Button>

        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="application/pdf,image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Label
            htmlFor="file-upload"
            className={cn(
              "flex items-center gap-2 h-12 px-4 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer shadow-sm font-medium transition-colors",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload File/PDF
          </Label>
        </div>
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
