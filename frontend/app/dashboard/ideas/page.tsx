"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, Loader2, Lightbulb, Search } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"

interface Idea {
    id: number;
    title: string;
    description: string;
    created_at: string;
    validation_score: number;
}

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchIdeas() {
            try {
                const response = await apiFetch("/ideas/")
                setIdeas(response.data.ideas)
            } catch (error) {
                console.error("Failed to fetch ideas:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchIdeas()
    }, [])

    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Ideas</h1>
                    <p className="text-muted-foreground mt-1">Manage all your startup concepts and validation reports.</p>
                </div>
                <Button asChild className="rounded-xl gap-2 font-semibold">
                    <Link href="/dashboard/new-idea">
                        <Plus className="h-5 w-5" /> New Idea
                    </Link>
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter your ideas..."
                    className="pl-10 h-11 rounded-xl bg-card border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredIdeas.length > 0 ? (
                    filteredIdeas.map((idea) => (
                        <Card key={idea.id} className="border-none shadow-sm hover:shadow-md transition-shadow group bg-card/50 overflow-hidden flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score</div>
                                        <div className="text-xl font-bold text-primary">{idea.validation_score || 0}%</div>
                                    </div>
                                </div>
                                <CardTitle className="text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {idea.title}
                                </CardTitle>
                                <div className="text-xs text-muted-foreground">
                                    Created {new Date(idea.created_at).toLocaleDateString()}
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                                    {idea.description}
                                </p>
                                <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5 h-10" asChild>
                                    <Link href={`/dashboard/idea/${idea.id}/validation`}>
                                        View Analysis <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold">No ideas found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or create a new concept.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
