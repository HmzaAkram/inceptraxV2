"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowRight, ArrowLeft, Check, Lightbulb, Users, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "The Idea", icon: Lightbulb },
  { id: 2, name: "Problem & Solution", icon: Target },
  { id: 3, name: "Target Audience", icon: Users },
]

export default function NewIdeaPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsSubmitting(true)
      // Simulate AI analysis delay
      setTimeout(() => {
        router.push("/dashboard/idea/1/validation")
      }, 2000)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Analysis</h1>
        <p className="text-muted-foreground">Fill in the details below to start your AI-powered startup validation.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 bg-background",
                currentStep >= step.id ? "border-primary text-primary" : "border-border text-muted-foreground",
                currentStep > step.id && "bg-primary text-primary-foreground border-primary",
              )}
            >
              {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 overflow-hidden">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Startup Name / Working Title
                </Label>
                <Input id="title" placeholder="e.g. AI Coffee Roaster" className="h-12 rounded-xl text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  One-sentence Pitch
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your idea in a nutshell..."
                  className="min-h-[100px] rounded-xl resize-none text-lg"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="problem" className="text-base">
                  What problem are you solving?
                </Label>
                <Textarea
                  id="problem"
                  placeholder="Explain the pain point..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solution" className="text-base">
                  How does your product solve it?
                </Label>
                <Textarea
                  id="solution"
                  placeholder="Explain the solution..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-base">
                  Who is your ideal customer?
                </Label>
                <Textarea
                  id="audience"
                  placeholder="e.g. Tech-savvy homeowners, B2B SaaS founders..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market" className="text-base">
                  Any specific market or region? (Optional)
                </Label>
                <Input id="market" placeholder="e.g. North America, Global, Healthcare" className="h-12 rounded-xl" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-12 pt-8 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="rounded-xl h-11 px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <Button onClick={handleNext} disabled={isSubmitting} className="rounded-xl h-11 px-8 min-w-[140px]">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <>
                  {currentStep === steps.length ? (
                    <span className="flex items-center gap-2">
                      Start AI Analysis <Sparkles className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Next Step <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
