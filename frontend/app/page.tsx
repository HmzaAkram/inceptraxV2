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
    { name: "Founders Joined", value: 5023, icon: Users },
    { name: "Hours Saved", value: 45000, icon: BarChart3 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-0 pb-20 lg:pb-32 overflow-hidden">
          <div className="container px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Logo className="h-4 w-4 rounded-sm" />
              <span>Inceptrax: AI-Powered Startup Analysis</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
              Stop Guessing. <span className="text-primary">Start Building.</span><br />
              Verify Your Idea in Minutes.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty mb-10">
              The AI-powered co-founder that validates your business concept, analyzes market viability, and builds your GTM strategy—instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
                <Link href="/register">
                  Validate My Idea for Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
                <Link href="/features">View Sample Report</Link>
              </Button>
            </div>

            {/* Hero Metrics */}
            <div className="mt-16 flex flex-wrap justify-center gap-6">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col items-center bg-card/50 rounded-xl p-6 shadow-md w-40 backdrop-blur-sm border border-border/50">
                  <stat.icon className="h-6 w-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    <CountUp end={stat.value} duration={1.5} separator="," />+
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* Problem Statement Section */}
        <section className="py-24 bg-card border-y border-border/50">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">The Founder&apos;s Dilemma</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Building a startup is risky. Most fail not because they couldn&apos;t build the product, but because they built the <em>wrong</em> product.
                </p>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Uncertainty & Doubt</h3>
                      <p className="text-muted-foreground">Is this a real problem or just a hunch? Stop wasting weeks on guesswork.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Analysis Paralysis</h3>
                      <p className="text-muted-foreground">Spending months researching competitors instead of executing on your vision.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Biased Feedback</h3>
                      <p className="text-muted-foreground">Relying on friends who are too nice to tell you the harsh truth about your idea.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative h-full min-h-[400px] bg-muted/30 rounded-2xl border border-border overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="text-center p-8 relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Ideally...</h3>
                  <p className="text-muted-foreground">Getting a &quot;No&quot; now saves you 6 months of life.</p>
                  <p className="text-primary font-medium mt-2">Getting a &quot;Yes&quot; gives you the roadmap to a unicorn.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition / Solution Section */}
        <section className="py-24">
          <div className="container px-4 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Meet Inceptrax: Your Objective Truth Engine</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              We cut through the noise. Using advanced AI, we subject your idea to rigorous market stress-tests in seconds.
            </p>
          </div>

          <div className="container px-4 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Data-Driven Reality",
                desc: "Analysis based on real-time market signals, not opinions. We validate against current trends and data.",
                icon: BarChart3
              },
              {
                title: "Instant Clarity",
                desc: "Comprehensive 20+ page reports generated in under 60 seconds. Know your TAM, SAM, and SOM immediately.",
                icon: Rocket
              },
              {
                title: "Actionable Strategy",
                desc: "Don't just get a score; get a plan. MVP features, pricing models, and acquisition channels tailored to you.",
                icon: CheckCircle2
              }
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 bg-muted/20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trusted by 5,000+ Modern Founders</h2>
              <p className="text-muted-foreground">$40M+ in potential wasted development hours saved this year.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <p className="text-lg italic mb-6 text-foreground/80">&quot;Inceptrax saved me 6 months of dev time. It correctly identified a saturated market I was about to enter and suggested a pivot that got us funded.&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">SJ</div>
                  <div>
                    <p className="font-bold text-sm">Sarah J.</p>
                    <p className="text-xs text-muted-foreground">Founder, TechFlow</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <p className="text-lg italic mb-6 text-foreground/80">&quot;The MVP blueprint feature is insane. It prioritized my features better than my actual product manager. Essential for indie hackers.&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">DK</div>
                  <div>
                    <p className="font-bold text-sm">David K.</p>
                    <p className="text-xs text-muted-foreground">Indie Hacker</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4">
            <div className="relative rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to validate your next big thing?</h2>
                <p className="text-primary-foreground/80 text-lg mb-10">
                  Join thousands of founders who use Inceptrax to turn concepts into companies.
                </p>
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold shadow-lg hover:bg-background hover:text-foreground transition-all" asChild>
                  <Link href="/register">Start Analysis Now</Link>
                </Button>
              </div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
