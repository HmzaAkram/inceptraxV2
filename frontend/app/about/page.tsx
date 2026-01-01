import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Our Mission</h1>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <p>
              At Inceptrax, we believe that the world's most pressing problems can be solved through entrepreneurship.
              However, the path from a raw idea to a successful company is fraught with uncertainty and wasted effort.
            </p>
            <p>
              Our mission is to democratize startup success by providing founders with the same level of analytical
              rigor and strategic insight that was previously only available to those with deep pockets or expensive
              consultants.
            </p>
            <div className="grid gap-8 py-12 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Why we exist</h2>
                <p>
                  Founders spend months building products that nobody wants. We exist to help you find product-market
                  fit faster using data-driven AI analysis before you write a single line of code.
                </p>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
                <p>
                  To be the operating system for the ideation phase of every new startup, empowering a new generation of
                  founders to build more meaningful and sustainable companies.
                </p>
              </div>
            </div>
            <p>
              Founded in 2025, Inceptrax combines cutting-edge large language models with real-world market data and
              proven business frameworks to give you a competitive edge from day one.
            </p>
          </div>

          <section className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {["Hamza Akram", "Zaki Haider", "Abdul Sami", "Muhammad Mudassir"].map((name) => (
                <div key={name} className="flex flex-col items-center text-center group">
                  <div className="w-32 h-32 rounded-full bg-muted mb-4 border-2 border-transparent group-hover:border-primary transition-all overflow-hidden relative">
                    <img
                      src={`/portrait-of-.jpg?key=tkww7&height=128&width=128&query=Portrait+of+${name.replace(" ", "+")}`}
                      alt={name}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">Founder & Developer</p>
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
