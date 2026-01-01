import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Zap } from "lucide-react"

const competitors = [
  {
    name: "Ikawa Home",
    type: "Direct",
    threat: "High",
    strengths: ["Compact design", "Pro-level software", "Established brand"],
    weaknesses: ["Very expensive ($1,200+)", "Limited batch size", "Proprietary pods"],
  },
  {
    name: "Behmor 2000AB",
    type: "Direct",
    threat: "Medium",
    strengths: ["Large capacity", "Affordable", "Reliable hardware"],
    weaknesses: ["Bulky", "Manual controls", "Lack of smart features"],
  },
  {
    name: "Specialty Coffee Shops",
    type: "Indirect",
    threat: "Low",
    strengths: ["Convenience", "Expertly roasted", "Social experience"],
    weaknesses: ["Long-term cost", "Lack of personalization", "No DIY experience"],
  },
]

export default function CompetitorAnalysisPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitor Analysis</h1>
          <p className="text-muted-foreground mt-1">Understanding the competitive landscape and your edge.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {competitors.map((comp) => (
          <Card key={comp.name} className="border-none shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-4 divide-x divide-border">
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-xl">{comp.name}</h3>
                  <Badge variant={comp.type === "Direct" ? "default" : "secondary"}>{comp.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Threat Level:</span>
                  <span className={comp.threat === "High" ? "text-destructive font-bold" : "text-amber-500 font-bold"}>
                    {comp.threat}
                  </span>
                </div>
              </div>
              <div className="p-6 md:col-span-3 grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {comp.strengths.map((s) => (
                      <li key={s} className="text-sm flex items-start gap-2">
                        <div className="h-1 w-1 rounded-full bg-border mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {comp.weaknesses.map((w) => (
                      <li key={w} className="text-sm flex items-start gap-2">
                        <div className="h-1 w-1 rounded-full bg-border mt-2" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-secondary text-secondary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Your Competitive Edge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed font-medium">
            IdeaForge AI identifies your unique advantage as "Accessible Precision." By combining high-end IoT roasting
            sensors with a price point 40% lower than Ikawa, you can capture the "Prosumer" gap—those who want pro
            results without the $1k+ price tag.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
