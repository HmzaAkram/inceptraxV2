import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-8 w-8 overflow-hidden rounded-lg", className)}>
      <Image src="/logo.png" alt="Inceptrax Logo" fill className="object-cover" priority />
    </div>
  )
}
