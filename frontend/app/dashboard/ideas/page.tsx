"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, ArrowRight, Loader2, Lightbulb, Search, Globe, Lock, Link2, Check } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Idea {
    id: number;
    title: string;
    description: string;
    created_at: string;
    validation_score: number;
    is_public: boolean;
    share_token: string | null;
}

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [isTogglingVisibility, setIsTogglingVisibility] = useState<number | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    useEffect(() => {
        async function fetchIdeas() {
            try {
                const response = await apiFetch("/ideas/")
                setIdeas(response.data.ideas)
            } catch (error) {
                console.error("Failed to fetch ideas:", error)
                toast.error("Failed to load ideas")
            } finally {
                setIsLoading(false)
            }
        }
        fetchIdeas()
    }, [])

    const handleDelete = async (ideaId: number) => {
        setIsDeleting(ideaId)
        try {
            await apiFetch(`/ideas/${ideaId}`, { method: "DELETE" })
            setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
            toast.success("Idea deleted successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to delete idea")
        } finally {
            setIsDeleting(null)
        }
    }

    const handleToggleVisibility = async (idea: Idea) => {
        setIsTogglingVisibility(idea.id)
        try {
            const response = await apiFetch(`/ideas/${idea.id}/visibility`, {
                method: "PATCH",
                body: JSON.stringify({ is_public: !idea.is_public }),
            })
            const updated: Idea = response.data.idea
            setIdeas(prev => prev.map(i => i.id === idea.id ? updated : i))
            toast.success(updated.is_public ? "Idea is now public — share link is ready!" : "Idea is now private")
        } catch (error: any) {
            toast.error(error.message || "Failed to update visibility")
        } finally {
            setIsTogglingVisibility(null)
        }
    }

    const handleCopyLink = async (idea: Idea) => {
        if (!idea.share_token) return
        const shareUrl = `${window.location.origin}/share/${idea.share_token}`
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopiedId(idea.id)
            toast.success("Share link copied to clipboard!")
            setTimeout(() => setCopiedId(null), 2000)
        } catch {
            toast.error("Failed to copy link")
        }
    }

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
                                    <div className="flex items-center gap-1">
                                        <div className="text-right mr-3">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score</div>
                                            <div className="text-xl font-bold text-primary">{idea.validation_score || 0}%</div>
                                        </div>

                                        {/* Delete button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                    disabled={isDeleting === idea.id}
                                                >
                                                    {isDeleting === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-background border-border rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently remove &quot;{idea.title}&quot; and all associated analysis data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-semibold"
                                                        onClick={() => handleDelete(idea.id)}
                                                    >
                                                        Delete Permanently
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <CardTitle className="text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors text-ellipsis overflow-hidden">
                                    {idea.title}
                                </CardTitle>
                                <div className="text-xs text-muted-foreground">
                                    Created {new Date(idea.created_at).toLocaleDateString()}
                                </div>
                            </CardHeader>

                            <CardContent className="flex flex-col flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                                    {idea.description}
                                </p>

                                {/* Visibility toggle row */}
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <button
                                        onClick={() => handleToggleVisibility(idea)}
                                        disabled={isTogglingVisibility === idea.id}
                                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 select-none
                                            ${idea.is_public
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400"
                                                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                            }`}
                                    >
                                        {isTogglingVisibility === idea.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : idea.is_public ? (
                                            <Globe className="h-3 w-3" />
                                        ) : (
                                            <Lock className="h-3 w-3" />
                                        )}
                                        {idea.is_public ? "Public" : "Private"}
                                    </button>

                                    {/* Copy link button — only shown when public */}
                                    {idea.is_public && idea.share_token && (
                                        <button
                                            onClick={() => handleCopyLink(idea)}
                                            title="Copy shareable link"
                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/5"
                                        >
                                            {copiedId === idea.id ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-3.5 w-3.5" />
                                                    <span>Copy link</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

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
