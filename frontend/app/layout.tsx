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
  keywords: ["startup validation", "business plan", "market research", "AI startup tools", "competitor analysis"],
  authors: [{ name: "Inceptrax Team" }],
  openGraph: {
    title: "Inceptrax - Transform Ideas into Business Plans",
    description: "AI-powered platform that helps founders validate startup ideas, analyze markets, and create actionable business plans.",
    url: "https://inceptrax-v2.vercel.app",
    siteName: "Inceptrax",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Inceptrax Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inceptrax - Transform Ideas into Business Plans",
    description: "AI-powered platform that helps founders validate startup ideas and create business plans.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  verification: {
    google: "zoa-o7ES2aKR7NIFHSEKqn7MCyLbwoBg2j7tTj4WCug",
  },
}

import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
