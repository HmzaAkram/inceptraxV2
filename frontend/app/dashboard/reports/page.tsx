import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Calendar, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const reports = [
  {
    id: 1,
    title: "AI Coffee Roaster - Full Analysis",
    date: "May 12, 2026",
    type: "Complete Business Plan",
    size: "2.4 MB",
    status: "Generated",
  },
  {
    id: 2,
    title: "Market Deep-Dive: Specialty Coffee",
    date: "May 10, 2026",
    type: "Market Research",
    size: "1.8 MB",
    status: "Generated",
  },
  {
    id: 3,
    title: "Competitive Landscape Analysis",
    date: "May 08, 2026",
    type: "Competitor Analysis",
    size: "1.2 MB",
    status: "Generated",
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Insights</h1>
          <p className="text-muted-foreground mt-1">Access and export your generated AI analysis reports.</p>
        </div>
        <Button className="rounded-xl gap-2">
          <Download className="h-4 w-4" /> Export All Data
        </Button>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FileText className="h-7 w-7" />
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{report.title}</h3>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
                    {report.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {report.date}
                  </span>
                  <span>{report.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg gap-2 bg-transparent">
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg gap-2 bg-transparent">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-muted/50 border border-dashed border-border p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Generate a new Custom Report</h2>
          <p className="text-muted-foreground">
            Need a specific deep-dive into a niche market or technical feasibility? Our custom AI agent can generate a
            tailored report in minutes.
          </p>
          <Button variant="secondary" className="rounded-xl mt-4">
            Request Custom Analysis
          </Button>
        </div>
      </Card>
    </div>
  )
}
