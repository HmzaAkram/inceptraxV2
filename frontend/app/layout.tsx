import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inceptrax - Transform Ideas into Business Plans",
  description:
    "AI-powered platform that helps founders validate startup ideas, analyze markets, identify competitors, and create actionable business plans with Inceptrax.",

  openGraph: {
    title: "Inceptrax - Transform Ideas into Business Plans",
    description:
      "Validate startup ideas, analyze market viability, and build GTM strategy using AI.",
    url: "https://inceptrax-v2.vercel.app",
    siteName: "Inceptrax",
    images: [
      {
        url: "https://inceptrax-v2.vercel.app/og-home.png",
        width: 1200,
        height: 630,
        alt: "Inceptrax – AI Co-Founder for Startup Founders",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Inceptrax – AI Co-Founder",
    description: "Stop guessing. Validate your startup idea with AI.",
    images: ["https://inceptrax-v2.vercel.app/og-home.png"],
  },
}

import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { VisitTracker } from "@/components/visit-tracker"
import { PostHogProvider } from "@/components/posthog-provider"
import { LenisProvider } from "@/components/lenis-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <PostHogProvider>
          <AuthProvider>
            <LenisProvider>
              <VisitTracker />
              {children}
            </LenisProvider>
            <Toaster />
          </AuthProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
