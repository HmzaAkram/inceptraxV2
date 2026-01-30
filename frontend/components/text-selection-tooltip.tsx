"use client"

import { useEffect, useState, useRef } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoFounderChat } from "@/components/co-founder-chat"

interface TextSelectionTooltipProps {
    ideaId: number
    section: string
    sectionName: string
    onUpdate: (newData: any) => void
    children: React.ReactNode
}

export function TextSelectionTooltip({
    ideaId,
    section,
    sectionName,
    onUpdate,
    children
}: TextSelectionTooltipProps) {
    const [selection, setSelection] = useState<Selection | null>(null)
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [selectedText, setSelectedText] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleSelectionChange = () => {
            if (isChatOpen) return

            const openSelection = window.getSelection()
            if (!openSelection || openSelection.isCollapsed) {
                setSelection(null)
                setPosition(null)
                return
            }

            const range = openSelection.getRangeAt(0)
            const rect = range.getBoundingClientRect()

            // Check if selection is inside our container
            if (containerRef.current && containerRef.current.contains(openSelection.anchorNode)) {
                setSelection(openSelection)
                setSelectedText(openSelection.toString())
                setPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10 // Position above the selection
                })
            } else {
                setSelection(null)
                setPosition(null)
            }
        }

        document.addEventListener("selectionchange", handleSelectionChange)
        // Also listen for mouseup to handle end of selection dragging
        document.addEventListener("mouseup", handleSelectionChange)

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange)
            document.removeEventListener("mouseup", handleSelectionChange)
        }
    }, [isChatOpen])

    const handleRefineClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsChatOpen(true)
        // Clear selection to avoid visual clutter
        if (window.getSelection()) {
            window.getSelection()?.removeAllRanges()
        }
        setSelection(null)
        setPosition(null)
    }

    return (
        <div ref={containerRef} className="relative">
            {children}

            {position && !isChatOpen && (
                <div
                    className="fixed z-50 transform -translate-x-1/2 -translate-y-full px-2"
                    style={{
                        left: position.x,
                        top: position.y
                    }}
                >
                    <Button
                        size="sm"
                        onClick={handleRefineClick}
                        className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-full animate-in fade-in zoom-in duration-200"
                    >
                        <Sparkles className="h-3 w-3" />
                        Refine with AI
                    </Button>
                    {/* Tiny arrow pointing down */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-indigo-600 border-r-[6px] border-r-transparent mx-auto" />
                </div>
            )}

            <CoFounderChat
                ideaId={ideaId}
                section={section}
                sectionName={sectionName}
                onUpdate={onUpdate}
                isOpenExternal={isChatOpen}
                setIsOpenExternal={setIsChatOpen}
                initialContext={selectedText}
            />
        </div>
    )
}
