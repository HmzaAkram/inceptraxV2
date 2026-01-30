import Image from "next/image"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

export function Logo({ className }: { className?: string }) {
  return (
     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
    </div>
  )
}
