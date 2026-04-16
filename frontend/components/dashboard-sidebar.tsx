"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Lightbulb,
  Search,
  Target,
  Settings,
  FileText,
  Sparkles,
  PlusCircle,
  HelpCircle,
  CreditCard,
  Zap,
  Rocket,
  Briefcase,
  FlaskConical,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Ideas", href: "/dashboard/ideas", icon: Lightbulb },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Co-Founder Network", href: "/dashboard/cofounder", icon: Users },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  // Extract idea ID from pathname if present (e.g., /dashboard/idea/123/validation)
  const ideaMatch = pathname.match(/\/dashboard\/idea\/([^\/]+)/)
  const currentIdeaId = ideaMatch ? ideaMatch[1] : null

  const analysisLinks = currentIdeaId ? [
    { name: "Validation", href: `/dashboard/idea/${currentIdeaId}/validation`, icon: Sparkles },
    { name: "Market Research", href: `/dashboard/idea/${currentIdeaId}/market`, icon: Search },
    { name: "Competitors", href: `/dashboard/idea/${currentIdeaId}/competitors`, icon: Target },
    { name: "Monetization", href: `/dashboard/idea/${currentIdeaId}/monetization`, icon: CreditCard },
    { name: "MVP Blueprint", href: `/dashboard/idea/${currentIdeaId}/mvp-blueprint`, icon: Zap },
    { name: "Go-To-Market", href: `/dashboard/idea/${currentIdeaId}/gtm`, icon: Rocket },
    { name: "Investor Pitches", href: `/dashboard/idea/${currentIdeaId}/investor`, icon: Briefcase },
    { name: "Research Hub", href: `/dashboard/idea/${currentIdeaId}/research-hub`, icon: FlaskConical },
  ] : []

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-64 shrink-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Logo />
          <span>Inceptrax</span>
        </Link>
      </div>

      <div className="flex-grow px-4 space-y-8">
        <div>
          <Button asChild className="w-full justify-start gap-2 mb-6 rounded-xl" size="lg">
            <Link href="/dashboard/new-idea">
              <PlusCircle className="h-5 w-5" />
              New Idea
            </Link>
          </Button>

          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Navigation</p>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {analysisLinks.length > 0 && (
          <div>
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Current Analysis
            </p>
            <nav className="space-y-1">
              {analysisLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </Link>
        <Link
          href="/dashboard/support"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          Support
        </Link>
      </div>
    </div>
  )
}
