"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Search, BarChart3, Users, Target, Rocket, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"
import CountUp from "react-countup"

export default function LandingPage() {
  const stats = [
    { name: "Ideas Validated", value: 1240, icon: CheckCircle2 },
    { name: "Reports Generated", value: 5380, icon: BarChart3 },
    { name: "Founders Joined", value: 5023, icon: Users },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Logo className="h-4 w-4 rounded-sm" />
              <span>Inceptrax: AI-Powered Startup Analysis is here</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
              Turn your raw ideas into <span className="text-primary">actionable</span> business plans
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty mb-10">
              Stop guessing. Use AI to validate your startup ideas, research markets, analyze competitors, and plan your MVP in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
                <Link href="/register">
                  Start Analyzing Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
                <Link href="/features">View All Features</Link>
              </Button>
            </div>

            {/* Hero Metrics */}
            <div className="mt-16 flex flex-wrap justify-center gap-6">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col items-center bg-card/50 rounded-xl p-6 shadow-md w-40">
                  <stat.icon className="h-6 w-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    <CountUp end={stat.value} duration={1.5} separator="," />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to build with confidence</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our suite of AI tools covers the entire early-stage startup journey.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: CheckCircle2, title: "Idea Validation", desc: "Analyze problem-solution fit and get a realistic validation score based on market data." },
                { icon: Search, title: "Market Research", desc: "Instant deep-dives into industry trends, market size (TAM/SAM/SOM), and growth potential." },
                { icon: Target, title: "Competitor Analysis", desc: "Identify direct and indirect competitors, their strengths, and your unique value proposition." },
                { icon: Users, title: "Target Audience", desc: "Generate detailed user personas and understand their pain points and buying behaviors." },
                { icon: Rocket, title: "MVP Planning", desc: "Define core features for your minimum viable product to launch faster with less waste." },
                { icon: BarChart3, title: "GTM Strategy", desc: "Craft a winning go-to-market plan with marketing channels and strategic launch positioning." },
              ].map((feature) => (
                <div key={feature.title} className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all relative overflow-hidden">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  <span className="absolute top-4 right-4 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">New</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4">
            <div className="relative rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to validate your next big thing?</h2>
                <p className="text-primary-foreground/80 text-lg mb-10">
                  Join 5,000+ founders who use Inceptrax to turn concepts into companies.
                </p>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
                  <Link href="/register">Start My Analysis Now</Link>
                </Button>
              </div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
