"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { LayoutDashboard } from "lucide-react"

export function Navbar() {
  const { user, isAuthenticated, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    handler()
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full",
        "transition-all duration-300 ease-in-out",
        scrolled
          ? "h-14 bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "h-16 bg-transparent border-b border-transparent"
      )}
    >
      <div className="container h-full flex items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl transition-opacity hover:opacity-80">
          <Logo />
          <span>Inceptrax</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {[
            { label: "Explore", href: "/public-ideas" },
            { label: "Features", href: "/features" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-sm font-medium">
                    {user.first_name || user.name || ""}
                  </span>
                  <Button size="sm" className="gap-2 text-xs rounded-lg" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs px-3" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="text-xs px-3 rounded-lg" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
