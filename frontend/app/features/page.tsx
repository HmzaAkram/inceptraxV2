import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, Search, Target, Users, Rocket, BarChart3, Shield, Zap, Globe } from "lucide-react"

const features = [
  {
    title: "AI Idea Validation",
    description:
      "Get instant feedback on your startup idea with a comprehensive validation score based on market data and current trends.",
    icon: CheckCircle2,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Deep Market Research",
    description:
      "Access detailed insights into industry growth, market size (TAM/SAM/SOM), and emerging opportunities in your niche.",
    icon: Search,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Competitor Intelligence",
    description:
      "Identify key players, analyze their strengths and weaknesses, and find gaps in the market where you can win.",
    icon: Target,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "User Persona Builder",
    description:
      "Understand exactly who your customers are with AI-generated personas including pain points, motivations, and behaviors.",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "MVP Feature Roadmap",
    description:
      "Stop feature creep. Our AI helps you identify the core functionality needed to launch your MVP and start learning.",
    icon: Rocket,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "GTM Strategy",
    description:
      "Build a solid foundation for launch with recommended marketing channels, positioning, and strategic growth paths.",
    icon: BarChart3,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="container px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Powerful tools for <span className="text-primary">visionary</span> founders
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Inceptrax combines advanced AI with real-world market data to give you the clarity you need to build the
              next big thing.
            </p>
          </div>
        </section>

        <section className="py-24">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-8 rounded-3xl border border-border bg-card hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="container px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Why founders choose Inceptrax</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Zap className="h-6 w-6 shrink-0 text-white/80" />
                    <div>
                      <h4 className="font-bold text-xl mb-1">Speed to Insight</h4>
                      <p className="text-primary-foreground/70">
                        Go from a raw idea to a 20-page strategic analysis in under 5 minutes.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Shield className="h-6 w-6 shrink-0 text-white/80" />
                    <div>
                      <h4 className="font-bold text-xl mb-1">Data-Backed Decisions</h4>
                      <p className="text-primary-foreground/70">
                        Our AI is trained on successful startup patterns and real-time market signals.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Globe className="h-6 w-6 shrink-0 text-white/80" />
                    <div>
                      <h4 className="font-bold text-xl mb-1">Global Market Data</h4>
                      <p className="text-primary-foreground/70">
                        Access intelligence across hundreds of industries and global regions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute -top-1/2 -right-1/2 w-full h-full" />
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative">
                  <p className="text-xl italic mb-6">
                    "Inceptrax saved us months of research. We pivot based on the market insights we got in our first
                    week."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/20" />
                    <div>
                      <p className="font-bold">Sarah Chen</p>
                      <p className="text-sm text-primary-foreground/60">CEO, Lumina AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
