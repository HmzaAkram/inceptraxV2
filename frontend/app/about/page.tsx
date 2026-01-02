import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Users, Globe, Target, CloudLightning } from "lucide-react";



const teamMembers = [
  {
    name: "Hamza Akram",
    role: "Founder & CEO",
    bio: "Visionary entrepreneur passionate about AI-driven startup success.",
    img: "/placeholder-user.jpg",
  },
  {
    name: "Zaki Haider",
    role: "Co-Founder & CTO",
    bio: "Tech enthusiast building intelligent systems for founders.",
    img: "/placeholder-user.jpg",
  },
  {
    name: "Abdul Sami",
    role: "Head of Product",
    bio: "Turning ideas into actionable products with data-driven insights.",
    img: "/placeholder-user.jpg",
  },
  {
    name: "Muhammad Mudassir",
    role: "Lead AI Engineer",
    bio: "Designs AI models that make startup validation fast and reliable.",
    img: "/placeholder-user.jpg",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow py-20">
        <div className="container px-4 max-w-5xl mx-auto space-y-16">

          {/* Mission Section */}
          <section className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Our Mission</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              At Inceptrax, we believe that the world's most pressing problems can be solved through entrepreneurship. Our mission is to democratize startup success by providing founders with AI-powered insights that were previously only available to deep-pocketed consultants.
            </p>

            <div className="grid gap-8 py-12 md:grid-cols-2">
              <div className="flex flex-col gap-4 p-6 border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-primary">
                  <Users className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Why we exist</h2>
                </div>
                <p className="text-muted-foreground">
                  Founders spend months building products that nobody wants. We help you find product-market fit faster using data-driven AI before you write a single line of code.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-6 border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-primary">
                  <Globe className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground">
                  To be the operating system for the ideation phase of every startup, empowering founders to build meaningful and sustainable companies.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground max-w-3xl mx-auto">
              Founded in 2025, Inceptrax combines cutting-edge AI with real-world market data and proven business frameworks to give you a competitive edge from day one.
            </p>
          </section>

          {/* How We Help Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">How We Help Founders</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center p-6 text-center bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Market Validation</h3>
                <p className="text-muted-foreground text-sm">
                  Quickly validate your startup ideas using AI-driven market insights and predictive analytics.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 text-center bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <CloudLightning className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">AI Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Receive actionable insights into strengths, risks, and growth potential before building your product.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 text-center bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <Globe className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Global Reach</h3>
                <p className="text-muted-foreground text-sm">
                  Explore opportunities across markets worldwide, backed by real data and AI predictions.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="space-y-12">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center text-center bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all mb-4">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
