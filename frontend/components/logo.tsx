import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Inceptrax"
      width={size}
      height={size}
      className={cn("rounded-lg object-contain", className)}
      priority
    />
  )
}
