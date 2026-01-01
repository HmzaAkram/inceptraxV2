import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, TrendingUp, ThumbsUp, Target } from "lucide-react"

export default function IdeaValidationPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              Validation Report
            </Badge>
            <span className="text-sm text-muted-foreground">Generated 2 hours ago</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Coffee Roaster Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Validating the problem-solution fit for high-end automated coffee roasting.
          </p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
            <p className="text-3xl font-bold text-primary">85/100</p>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold">
            85%
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-primary" /> Market Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <Progress value={88} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" /> Problem Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Severe</div>
            <Progress value={75} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Growth Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Strong</div>
            <Progress value={92} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Strong upward trend in home-brewing specialty coffee.",
              "Existing automated solutions are too bulky or expensive for consumers.",
              "High willingness to pay among the identified target persona.",
              "Subscription model opportunity for green coffee beans.",
            ].map((strength, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed">
                <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>{strength}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Risks & Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "High initial hardware manufacturing and R&D costs.",
              "Steep learning curve for casual coffee drinkers.",
              "Competitive pressure from established appliance brands.",
              "Supply chain complexity for international bean sourcing.",
            ].map((risk, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed">
                <div className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="h-3 w-3" />
                </div>
                <span>{risk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed opacity-90">
            Based on the analysis, this idea has significant merit but requires a focused go-to-market strategy.
            Recommendation: Proceed with a high-fidelity prototype focused on the automated roasting consistency. The
            market is shifting toward "craft-at-home" experiences, making the timing optimal for a premium entry.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
