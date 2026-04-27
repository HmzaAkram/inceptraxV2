"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Send, MessageSquare, ArrowLeft, Search, Check, CheckCheck,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

interface Conversation {
  partner_id: number
  partner_name: string
  partner_initial: string
  last_message: string
  last_message_time: string | null
  last_message_is_mine: boolean
  unread_count: number
}

interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: boolean
  created_at: string
}

interface Partner {
  id: number
  name: string
  initial: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const withUserId = searchParams.get("with")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activePartner, setActivePartner] = useState<Partner | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingConvos, setIsLoadingConvos] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConvoList, setShowConvoList] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiFetch("/chat/conversations")
      setConversations(res.conversations || [])
    } catch (err) {
      console.error("Failed to load conversations:", err)
    } finally {
      setIsLoadingConvos(false)
    }
  }, [])

  // Fetch messages for a partner
  const fetchMessages = useCallback(async (partnerId: number) => {
    setIsLoadingMessages(true)
    try {
      const res = await apiFetch(`/chat/messages/${partnerId}`)
      setMessages(res.messages || [])
      setActivePartner(res.partner)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error("Failed to load messages:", err)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [scrollToBottom])

  // Initial load
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Auto-open conversation if ?with= is set
  useEffect(() => {
    if (withUserId && !isLoadingConvos) {
      const partnerId = parseInt(withUserId, 10)
      if (!isNaN(partnerId)) {
        openConversation(partnerId)
      }
    }
  }, [withUserId, isLoadingConvos])

  // Poll for new messages every 5 seconds when a conversation is open
  useEffect(() => {
    if (activePartner) {
      pollIntervalRef.current = setInterval(() => {
        fetchMessagesQuiet(activePartner.id)
        fetchConversations()
      }, 5000)
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [activePartner, fetchConversations])

  // Quiet fetch (no loading state) for polling
  const fetchMessagesQuiet = async (partnerId: number) => {
    try {
      const res = await apiFetch(`/chat/messages/${partnerId}`)
      setMessages(res.messages || [])
    } catch (err) {
      // silent
    }
  }

  const openConversation = async (partnerId: number) => {
    setShowConvoList(false)
    await fetchMessages(partnerId)
    // Refresh conversation list to update unread counts
    fetchConversations()
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !activePartner || isSending) return

    const content = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    // Optimistic UI: add message immediately
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      sender_id: user?.id || 0,
      receiver_id: activePartner.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const res = await apiFetch(`/chat/messages/${activePartner.id}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? res.message : m))
      )
      fetchConversations()
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return d.toLocaleDateString(undefined, { weekday: "short" })
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const filteredConvos = searchQuery
    ? conversations.filter((c) =>
        c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto overflow-hidden rounded-xl border bg-card">
      {/* ─── Left Panel: Conversation List ─────────────────── */}
      <div
        className={cn(
          "w-80 border-r flex flex-col shrink-0 bg-background",
          // On mobile, hide when a conversation is open
          !showConvoList && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations…"
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConvos ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Message founders from the Explore page to start chatting
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredConvos.map((convo) => (
                <button
                  key={convo.partner_id}
                  onClick={() => openConversation(convo.partner_id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-150",
                    activePartner?.id === convo.partner_id
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold shrink-0">
                    {convo.partner_initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {convo.partner_name}
                      </span>
                      {convo.last_message_time && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatTime(convo.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate pr-2">
                        {convo.last_message_is_mine && (
                          <span className="text-muted-foreground/60">You: </span>
                        )}
                        {convo.last_message || "Start a conversation"}
                      </p>
                      {convo.unread_count > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Panel: Messages ──────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          showConvoList && !activePartner && "hidden md:flex"
        )}
      >
        {activePartner ? (
          <>
            {/* Chat header */}
            <div className="h-14 border-b flex items-center gap-3 px-4 shrink-0">
              <button
                onClick={() => {
                  setShowConvoList(true)
                  setActivePartner(null)
                }}
                className="md:hidden p-1 hover:bg-muted rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                {activePartner.initial}
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  {activePartner.name}
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
                    >
                      <Skeleton className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-48" : "w-36")} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello! 👋
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === (user?.id || 0)
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isMine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                            isMine
                              ? "bg-foreground text-background rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1",
                              isMine ? "justify-end" : "justify-start"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[10px]",
                                isMine ? "text-background/50" : "text-muted-foreground"
                              )}
                            >
                              {formatTime(msg.created_at)}
                            </span>
                            {isMine && (
                              msg.is_read ? (
                                <CheckCheck className="h-3 w-3 text-background/50" />
                              ) : (
                                <Check className="h-3 w-3 text-background/50" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="border-t p-3 shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-10 rounded-full px-4"
                  maxLength={2000}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 rounded-full shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Your Messages</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Select a conversation to start messaging, or find founders on the Explore page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
