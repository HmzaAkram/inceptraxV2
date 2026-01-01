import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users } from "lucide-react"

export default function MarketResearchPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Research</h1>
          <p className="text-muted-foreground mt-1">Deep-dive into the Global Specialty Coffee Equipment market.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">TAM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.4B</div>
            <p className="text-xs text-muted-foreground mt-1">Total Addressable Market</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SAM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.8B</div>
            <p className="text-xs text-muted-foreground mt-1">Serviceable Addressable Market</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SOM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450M</div>
            <p className="text-xs text-muted-foreground mt-1">Serviceable Obtainable Market</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Key Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Hyper-Personalization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consumers are increasingly looking for ways to control every aspect of their coffee experience, from
                roast profile to grind size.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">IoT Integration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart kitchen appliances with mobile app control are becoming the standard in premium segments.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Eco-Conscious Sourcing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Growing demand for transparent sourcing and direct-trade beans among Gen Z and Millennial drinkers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" /> Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h3 className="font-semibold text-sm mb-1">The Aficionado</h3>
              <p className="text-xs text-muted-foreground mb-3">
                High-income, tech-savvy, values quality above convenience.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] py-0">
                  45% Segment
                </Badge>
                <Badge variant="secondary" className="text-[10px] py-0">
                  High WTP
                </Badge>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h3 className="font-semibold text-sm mb-1">The Home Labber</h3>
              <p className="text-xs text-muted-foreground mb-3">
                DIY enthusiast, enjoys the process, likely to share on social media.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] py-0">
                  30% Segment
                </Badge>
                <Badge variant="secondary" className="text-[10px] py-0">
                  Viral Potential
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
