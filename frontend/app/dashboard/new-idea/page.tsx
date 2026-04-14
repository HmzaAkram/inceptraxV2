"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, Mic, Upload, FileUp, X, StopCircle, FileText, Image as ImageIcon } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export default function NewIdeaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const animationRef = useRef<number>()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const [filePreview, setFilePreview] = useState<{
    name: string;
    type: string;
    size: string;
  } | null>(null)

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const autoSave = () => {
      if (formData.title || formData.description) {
        localStorage.setItem('ideaDraft', JSON.stringify(formData))
      }
    }

    const interval = setInterval(autoSave, 10000)
    return () => clearInterval(interval)
  }, [formData])

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('ideaDraft')
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft))
      toast.info('Loaded saved draft', {
        action: {
          label: 'Clear',
          onClick: () => {
            localStorage.removeItem('ideaDraft')
            setFormData({ title: "", description: "" })
          }
        }
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a startup name")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Please describe your idea")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiFetch("/ideas/", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
        }),
      })

      // Clear draft after successful submission
      localStorage.removeItem('ideaDraft')
      
      toast.success("Idea submitted for analysis!");
      router.push(`/dashboard/idea/${response.data.idea.id}/validation`)
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze idea")
      setIsSubmitting(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100 
        } 
      })
      
      // Initialize audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
          setAudioChunks(prev => [...prev, e.data])
        }
      }
      
      mediaRecorder.onstop = async () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: "audio/webm" })
          handleVoiceUpload(blob)
        }
        stream.getTracks().forEach(track => track.stop())
        cancelAnimationFrame(animationRef.current!)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Start visualization
      visualizeAudio()

    } catch (err) {
      toast.error("Microphone access denied or unavailable")
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current || !audioContextRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      // You can use this data for visualization
    }
    draw()
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
      setFormData(prev => ({ 
        title: prev.title || title || "", 
        description: prev.description ? `${prev.description}\n\n${description || ""}`.trim() : description || "" 
      }))
      setAudioChunks([])
      toast.success("Idea extracted from voice recording!")
    } catch (error: any) {
      toast.error("Failed to process voice: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // File validation
    const validTypes = [
      'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type) && !file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
      toast.error("Please upload PDF, Image, PPT, or Text files only")
      return
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB")
      return
    }

    // Set preview
    setFilePreview({
      name: file.name,
      type: file.type.split('/')[1].toUpperCase(),
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    })

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await apiFetch("/ideas/upload/file", {
        method: "POST",
        body: formData,
      })

      const { title, description } = response.data
      setFormData(prev => ({ 
        title: prev.title || title || "", 
        description: prev.description ? `${prev.description}\n\n${description || ""}`.trim() : description || "" 
      }))
      toast.success("Text extracted from file!")
    } catch (error: any) {
      toast.error("Failed to process file: " + error.message)
      setFilePreview(null)
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const removeFilePreview = () => {
    setFilePreview(null)
  }

  const handleClearDraft = () => {
    setFormData({ title: "", description: "" })
    localStorage.removeItem('ideaDraft')
    toast.success("Draft cleared")
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Create New Idea
        </h1>
        <p className="text-muted-foreground text-lg">
          Enter your startup name and idea to start the AI analysis.
        </p>
      </div>

      {/* Input Methods */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "secondary"}
          className="rounded-xl h-12 gap-2 shadow-sm relative overflow-hidden"
          disabled={isUploading}
        >
          {isRecording ? (
            <>
              <StopCircle className="h-4 w-4 animate-pulse" />
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                {formatTime(recordingTime)}
              </span>
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
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
            accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.ppt,.pptx"
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
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload File/PPT/PDF
          </Label>
        </div>

        {(formData.title || formData.description) && (
          <Button
            variant="outline"
            onClick={handleClearDraft}
            className="rounded-xl h-12 gap-2"
          >
            <X className="h-4 w-4" />
            Clear Draft
          </Button>
        )}
      </div>

      {filePreview && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {filePreview.type === 'PDF' ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium truncate max-w-xs">{filePreview.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {filePreview.type} • {filePreview.size}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFilePreview}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white/70 to-primary/10 hover:from-white/80 hover:to-primary/20 transition-all duration-300">
        <CardContent className="p-10 space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="title" className="text-sm font-bold uppercase text-muted-foreground">
                Startup Name / Working Title
              </Label>
              <span className="text-xs text-muted-foreground">
                {formData.title.length}/60 characters
              </span>
            </div>
            <Input
              id="title"
              placeholder="e.g. AI Coffee Roaster"
              className="h-14 rounded-xl text-lg border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={60}
              required
            />
            <Progress value={(formData.title.length / 60) * 100} className="h-1" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-sm font-bold uppercase text-muted-foreground">
                What's your idea
              </Label>
              <span className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe your idea..."
              className="min-h-[140px] rounded-xl resize-none text-lg border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={1000}
              required
            />
            <Progress value={(formData.description.length / 1000) * 100} className="h-1" />
          </div>

          <div className="flex justify-end mt-8 gap-4">
            <Button
              variant="outline"
              onClick={handleClearDraft}
              className="rounded-xl h-14 px-8 font-semibold"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="rounded-xl h-14 px-10 font-semibold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-transform duration-200 shadow-lg text-white"
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