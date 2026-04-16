"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Lightbulb, Search, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface PublicIdea {
    id: number;
    title: string;
    description: string;
    created_at: string;
    validation_score: number;
    share_token: string;
}

export default function PublicIdeasGallery() {
    const [ideas, setIdeas] = useState<PublicIdea[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchPublicIdeas() {
            try {
                const response = await apiFetch("/ideas/public")
                // Sort by score descending to highlight best ideas
                const sorted = (response.data.ideas || []).sort((a: any, b: any) => 
                    (b.validation_score || 0) - (a.validation_score || 0)
                )
                setIdeas(sorted)
            } catch (error) {
                console.error("Failed to fetch public ideas:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPublicIdeas()
    }, [])

    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="flex-grow py-16 px-4">
                <div className="max-w-6xl mx-auto space-y-16">
                    {/* Hero Section - High Contrast B&W */}
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                           Explore Ideas
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                            Vetted Concepts.<br />
                            <span className="text-muted-foreground">Unlimited Potential.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
                            The collective brain of Inceptrax founders. Browse validated startup ideas and join the conversation.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by keyword, industry, or problem..."
                            className="pl-14 h-16 rounded-2xl bg-muted/30 border-2 border-border focus-visible:ring-primary focus-visible:border-primary text-lg font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex h-[40vh] items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : filteredIdeas.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredIdeas.map((idea) => (
                                <Card key={idea.id} className="border-2 border-border shadow-none hover:border-primary transition-all duration-300 group bg-card overflow-hidden flex flex-col rounded-3xl">
                                    <CardHeader className="pb-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                                                <Lightbulb className="h-6 w-6" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</div>
                                                <div className="text-3xl font-black text-foreground tabular-nums">{idea.validation_score || 0}%</div>
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black text-foreground line-clamp-2 leading-tight">
                                                {idea.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Analyzed {new Date(idea.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-grow space-y-8 pt-0">
                                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed font-medium">
                                            {idea.description}
                                        </p>
                                        <Button className="w-full rounded-2xl gap-3 h-14 font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/5" asChild>
                                            <Link href={`/share/${idea.share_token}`}>
                                                Investigate Idea <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-6 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border max-w-4xl mx-auto">
                            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground border-2 border-border">
                                <Search className="h-8 w-8" />
                            </div>
                            <div className="space-y-2 px-4">
                                <h3 className="text-3xl font-black tracking-tight">Zero matches found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto font-medium">We couldn't find any ideas matching those keywords. Maybe it's time to publish your own?</p>
                            </div>
                            <Button variant="outline" className="rounded-2xl px-10 h-12 font-bold border-2" onClick={() => setSearchQuery("")}>
                                Clear Search
                            </Button>
                        </div>
                    )}

                    {/* Footer CTA */}
                    <div className="rounded-[3rem] p-16 text-center bg-primary text-primary-foreground mt-24">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Your ideas deserve to be built.</h2>
                            <p className="text-primary-foreground/80 text-lg font-medium">
                                Join 5,000+ founders using Inceptrax to validate, plan, and launch their startups.
                            </p>
                            <Button size="lg" className="rounded-2xl px-12 h-16 text-lg font-black bg-background text-foreground hover:bg-background/90 transition-all uppercase tracking-widest shadow-2xl" asChild>
                                <Link href={"/dashboard"}>Get Started Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

