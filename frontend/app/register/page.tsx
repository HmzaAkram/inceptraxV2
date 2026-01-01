"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, Check, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password
        }),
      })
      login(data.token, data.user)
      toast.success("Account created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to register")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Features Checklist */}
      <div className="hidden lg:flex w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <span>Inceptrax</span>
          </Link>
          <h2 className="text-4xl font-bold mb-8 leading-tight">
            Start building with <br /> data, not guesses.
          </h2>

          <ul className="space-y-6">
            {[
              "Unlimited idea validation analysis",
              "Deep-dive market research reports",
              "Competitor intelligence tracking",
              "AI-generated user personas",
              "Step-by-step MVP blueprints",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-lg opacity-90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-sm opacity-60">© 2026 Inceptrax Inc. All rights reserved.</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-12 relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Jane"
                  required
                  className="h-11 rounded-xl"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  required
                  className="h-11 rounded-xl"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                className="h-11 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                required
                className="h-11 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-base font-semibold mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed">
            By clicking "Create Account", you agree to our{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-center text-sm text-muted-foreground pt-4 border-t">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
