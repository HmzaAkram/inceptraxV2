# INCEPTERX V2 — Frontend UX & Motion Upgrade Guide
### For: Antigravity AI | Task: Premium SaaS UI Polish (NOT a rebuild)

---

> **CRITICAL RULE BEFORE STARTING:**
> Read the entire codebase first. Understand every existing component, layout, color, and spacing pattern. Do NOT redesign from scratch. Improve and refine what exists. Every change must feel like a natural evolution of the current UI — not a replacement.

---

## STEP 1 — ANALYZE FIRST (MANDATORY)

Before writing a single line of code, read and understand:

- All layout files and page structures
- Every component in `/components`
- All Tailwind classes and custom CSS currently in use
- The current color system (dark theme: `#0A0A14`, `#111827`, `#6366F1`)
- Current spacing patterns and typography sizes
- Existing animation or transition code (Framer Motion, CSS)
- Current mobile breakpoint behavior

Do NOT skip this step. Changes made without understanding the existing system will break consistency.

---

## STEP 2 — DESIGN SYSTEM (KEEP EXISTING, REFINE ONLY)

The current design system must be preserved. Only sharpen and make it more consistent.

### Color Tokens (existing — do not change these)

```
Background:    #0A0A14  (page bg)
Card:          #111827  (card bg)
Accent:        #6366F1  (indigo — primary)
Accent Alt:    #8B5CF6  (purple — secondary)
Text Primary:  #F1F5F9
Text Muted:    #94A3B8
Border:        #1E2A3A
Success:       #10B981
Warning:       #F59E0B
Danger:        #EF4444
```

### Spacing System — 8px Grid (enforce consistently)

```
4px   — micro gaps (icon to text)
8px   — tight spacing (inside cards)
16px  — standard padding
24px  — section internal spacing
32px  — between major sections
48px  — page-level vertical spacing
64px  — large section breaks
```

Audit every component. Fix any spacing that does not follow this grid.

### Typography Scale (enforce consistently)

```
Page title:        text-2xl (24px) font-semibold
Section header:    text-xl  (20px) font-medium
Card title:        text-base (16px) font-medium
Body text:         text-sm  (14px) font-normal
Caption / label:   text-xs  (12px) font-normal
Micro label:       10px, uppercase, tracking-wider
```

---

## STEP 3 — ANIMATION & MOTION

### Install these two libraries (if not already present)

```bash
npm install lenis gsap
```

### Animation Philosophy

> Reduce animation intensity by 40% compared to what feels natural.
> Performance comes first. Every animation must be GPU-friendly.
> If an animation causes layout shift or repaints — remove it.

### Allowed animation properties (GPU-friendly only)

```
transform: translateY, translateX, scale
opacity
filter: blur (sparingly)
```

### NEVER animate these (cause repaints = lag)

```
width, height, top, left, margin, padding
background-color (use opacity instead)
border-width
box-shadow (use opacity of a pseudo-element instead)
```

---

### Lenis — Smooth Scroll Setup

Create file: `lib/lenis.ts`

```typescript
import Lenis from "lenis"

let lenis: Lenis | null = null

export function initLenis() {
  lenis = new Lenis({
    duration: 1.1,           // Slightly slow = premium feel
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,    // Slightly reduced = smooth not floaty
    touchMultiplier: 1.5,
  })

  function raf(time: number) {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return lenis
}

export function getLenis() {
  return lenis
}
```

Initialize in root layout `app/layout.tsx`:

```typescript
"use client"
import { useEffect } from "react"
import { initLenis } from "@/lib/lenis"

export default function RootLayout({ children }) {
  useEffect(() => {
    const lenis = initLenis()
    return () => lenis.destroy()
  }, [])

  return <html><body>{children}</body></html>
}
```

---

### GSAP — Setup & Rules

Create file: `lib/gsap.ts`

```typescript
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register only what you use
gsap.registerPlugin(ScrollTrigger)

// Default easing — use everywhere for consistency
export const ease = "power2.out"

// Default durations
export const DURATION = {
  fast: 0.18,    // Micro-interactions (hover, click)
  normal: 0.28,  // Component transitions
  slow: 0.45,    // Page-level reveals
}

export { gsap, ScrollTrigger }
```

---

### Animation Presets (use these — do not invent new ones)

#### 1. Scroll Reveal — for cards, sections, content blocks

```typescript
// hooks/useScrollReveal.ts
import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger, ease, DURATION } from "@/lib/gsap"

export function useScrollReveal(stagger = 0.08) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const items = ref.current.querySelectorAll("[data-reveal]")
    if (!items.length) return

    gsap.fromTo(items,
      { opacity: 0, y: 18 },          // Start: invisible, 18px down
      {
        opacity: 1, y: 0,
        duration: DURATION.slow,
        ease,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",           // Trigger early — feels responsive
          once: true,                 // Only animate once — not on re-scroll
        }
      }
    )

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return ref
}
```

Usage — add `data-reveal` to any element you want to animate in:

```tsx
const ref = useScrollReveal()
<div ref={ref}>
  <div data-reveal className="...">Card 1</div>
  <div data-reveal className="...">Card 2</div>
  <div data-reveal className="...">Card 3</div>
</div>
```

#### 2. Page Transition — fade in on mount

```typescript
// hooks/usePageTransition.ts
import { useEffect, useRef } from "react"
import { gsap, ease, DURATION } from "@/lib/gsap"

export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: DURATION.normal, ease }
    )
  }, [])

  return ref
}
```

Usage — wrap each page's main content:

```tsx
const ref = usePageTransition()
<main ref={ref} className="...">
  {/* page content */}
</main>
```

---

## STEP 4 — COMPONENT IMPROVEMENTS

Apply these to every matching component. Do not create new components — improve the existing ones.

---

### Buttons

**Rules:**
- Primary: filled indigo, white text
- Ghost: transparent, border, muted text
- Danger: red fill
- All: consistent height (36px default, 40px large)
- Loading state: spinner replaces text, button disabled

**CSS (add to your globals or Tailwind config):**

```css
.btn-primary {
  @apply bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm;
  @apply transition-all duration-150;
  @apply hover:bg-indigo-500 hover:scale-[1.02];
  @apply active:scale-[0.98] active:bg-indigo-700;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50;
}

.btn-ghost {
  @apply bg-transparent text-slate-300 font-medium px-4 py-2 rounded-lg text-sm border border-[#1E2A3A];
  @apply transition-all duration-150;
  @apply hover:bg-white/5 hover:border-indigo-500/40 hover:text-white;
  @apply active:scale-[0.98];
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-danger {
  @apply bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm;
  @apply transition-all duration-150;
  @apply hover:bg-red-500 hover:scale-[1.02];
  @apply active:scale-[0.98];
}
```

**Button loading state component:**

```tsx
// components/ui/button.tsx — update existing
interface ButtonProps {
  loading?: boolean
  children: React.ReactNode
  // ... rest of existing props
}

export function Button({ loading, children, disabled, ...props }) {
  return (
    <button
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Loading...</span>
        </span>
      ) : children}
    </button>
  )
}
```

---

### Cards

```css
.card {
  @apply bg-[#111827] border border-[#1E2A3A] rounded-xl p-6;
  @apply transition-all duration-200;
}

.card-hover {
  @apply card;
  @apply hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5;
  @apply hover:-translate-y-0.5;   /* subtle lift — only 2px */
}
```

**No more than 2px translateY on card hover. Anything more feels cheap.**

---

### Inputs & Form Fields

```css
.input {
  @apply w-full bg-[#0A0A14] border border-[#1E2A3A] rounded-lg px-4 py-2.5 text-sm text-white;
  @apply placeholder:text-slate-500;
  @apply transition-all duration-150;
  @apply focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20;
}

.input-error {
  @apply input border-red-500 focus:border-red-500 focus:ring-red-500/20;
}

.input-label {
  @apply block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider;
}
```

**Inline validation rules:**
- Show error text below field (never above)
- Error text: `text-xs text-red-400 mt-1`
- Do NOT clear form on error
- Do NOT show all errors at once — show on blur per field

---

### Skeleton Loaders

Replace all spinners on content-heavy sections with skeletons:

```tsx
// components/ui/skeleton.tsx
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-[#1E2A3A] rounded animate-pulse ${className}`}
    />
  )
}

// Usage — idea card skeleton
export function IdeaCardSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

// Usage — analysis stage skeleton
export function StageSkeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="card p-6 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  )
}
```

---

### Navbar

```tsx
// Scroll behavior — shrink + blur on scroll
// Add to navbar component

"use client"
import { useEffect, useState } from "react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 h-14
      transition-all duration-300
      ${scrolled
        ? "bg-[#0A0A14]/90 backdrop-blur-md border-b border-[#1E2A3A] shadow-lg shadow-black/20"
        : "bg-transparent border-b border-transparent"
      }
    `}>
      {/* existing navbar content */}
    </nav>
  )
}
```

**Auth state in navbar — fix this:**

```tsx
const { user, isAuthenticated } = useAuth()

// In navbar JSX — replace Sign In / Get Started with:
{isAuthenticated ? (
  <div className="flex items-center gap-3">
    <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-indigo-500 transition-colors">
      {user?.name?.[0]?.toUpperCase()}
    </div>
  </div>
) : (
  <div className="flex items-center gap-2">
    <button className="btn-ghost text-xs px-3 py-1.5">Sign In</button>
    <button className="btn-primary text-xs px-3 py-1.5">Get Started</button>
  </div>
)}
```

---

## STEP 5 — LANDING PAGE

Improve the existing landing page. Do not rebuild it. Apply the following section improvements.

---

### Hero Section

```tsx
// Improvements only — keep existing structure
// Add these specific changes:

// 1. Headline — make it sharper
<h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
  Validate your startup idea{" "}
  <span className="text-indigo-400">before you build</span>
</h1>

// 2. Subheadline
<p className="text-lg text-slate-400 max-w-xl leading-relaxed">
  AI-powered analysis across 8 stages — market research, competitors, 
  monetization, MVP planning, and more. In minutes, not months.
</p>

// 3. CTA buttons
<div className="flex items-center gap-3 flex-wrap">
  <button className="btn-primary px-6 py-3 text-base">
    Analyze Your Idea Free →
  </button>
  <button className="btn-ghost px-6 py-3 text-base">
    See Example Report
  </button>
</div>

// 4. Social proof line below CTA
<p className="text-xs text-slate-500 mt-3">
  No credit card required · Takes 3 minutes · 
  <span className="text-slate-400"> 2,400+ ideas validated</span>
</p>

// 5. Scroll reveal on hero — add data-reveal to each element
// and use useScrollReveal hook (defined above)
```

---

### Features Section

```tsx
const features = [
  {
    icon: "🔍",
    title: "Idea Validation",
    desc: "Score your idea across 6 dimensions with real market data."
  },
  {
    icon: "📊",
    title: "Market Research",
    desc: "Live TAM, SAM, SOM data with CAGR and trend analysis."
  },
  {
    icon: "🆚",
    title: "Competitor Analysis",
    desc: "Real competitor names, weaknesses, and market gaps."
  },
  {
    icon: "💰",
    title: "Monetization Strategy",
    desc: "Revenue models, pricing tiers, and LTV:CAC benchmarks."
  },
  {
    icon: "🛠️",
    title: "MVP Planning",
    desc: "Feature roadmap, tech stack, and budget breakdown."
  },
  {
    icon: "🚀",
    title: "Go-To-Market",
    desc: "Launch channels, 90-day plan, and acquisition targets."
  },
]

// Render as 2x3 grid on desktop, 1 column on mobile
// Each card: card-hover class, icon in colored circle, title, desc
// Add data-reveal to each card for scroll animation
```

---

### How It Works Section

```tsx
const steps = [
  { num: "01", title: "Describe your idea", desc: "Type your startup concept in plain language. No forms, no complexity." },
  { num: "02", title: "AI analyzes in real-time", desc: "8 sequential AI stages run with live web research for accurate data." },
  { num: "03", title: "Get your full report", desc: "Scores, insights, investor pitches, and a 90-day action plan." },
]

// Horizontal steps on desktop, vertical on mobile
// Each step: large muted number, title, description
// Subtle connecting line between steps on desktop
// data-reveal on each step
```

---

### Social Proof Section

```tsx
const stats = [
  { value: "2,400+", label: "Ideas validated" },
  { value: "87%", label: "Avg accuracy score" },
  { value: "8", label: "Analysis stages" },
  { value: "3 min", label: "Average analysis time" },
]

// 4 stat cards in a row
// Large bold value in accent color
// Muted label below
// Subtle card borders
```

---

### CTA Section

```tsx
// Bottom of page CTA — simple and clean
<section className="py-24 text-center">
  <h2 className="text-3xl font-bold text-white mb-4">
    Ready to validate your idea?
  </h2>
  <p className="text-slate-400 mb-8 max-w-md mx-auto">
    Stop guessing. Start building the right thing.
  </p>
  <button className="btn-primary px-8 py-3.5 text-base">
    Start Free Analysis →
  </button>
</section>
```

---

### Footer

```tsx
// Keep existing footer structure
// Improvements:
// - Add border-top: border-[#1E2A3A]
// - 4 columns: Product | Company | Resources | Legal
// - Links: text-sm text-slate-500 hover:text-white transition-colors
// - "Powered by Incepterx" with subtle logo
// - Copyright line at very bottom
```

---

## STEP 6 — PAGE-SPECIFIC IMPROVEMENTS

---

### Dashboard

```
Improvements:
- Search bar filters idea cards in real-time (client-side, no API)
- Filter by: title text, industry, status
- Empty state when no ideas: centered illustration + "Analyze your first idea →" CTA
- Idea cards: add public/private badge (lock icon = private, globe = public)
- Idea cards: show overall score badge colored by value
- "New Analysis" button: always visible, top right, primary style
- Loading state: show 3 IdeaCardSkeleton components while fetching
```

---

### Analysis Flow (Stages 1–8)

```
Improvements:
- Progress bar: always visible at top, shows current stage name
- Stage name label beside progress bar: "Stage 4 of 8 — Competitor Analysis"
- Each stage card: entrance animation using data-reveal (stagger 80ms)
- Score badges: use colored circle — green ≥75, amber 50–74, red <50
- "Next Stage" button: fixed position bottom center on mobile
- AI commentary section: quote-style card with indigo left border
```

---

### Final Report (Big Reveal)

```
This is the most important UX moment in the product.

Implement exactly:

1. Loader screen (2 seconds): 
   "Compiling your startup blueprint..."
   Animated dots: . .. ... looping

2. Score counter animation:
   - Counts from 0 to final score over 1.5 seconds
   - Easing: easeOut
   - Color changes at 50 and 75 threshold
   - Use GSAP for this:

   gsap.to({ val: 0 }, {
     val: finalScore,
     duration: 1.5,
     ease: "power2.out",
     onUpdate: function() {
       setDisplayScore(Math.round(this.targets()[0].val))
     }
   })

3. Confetti on score ≥ 80:
   npm install canvas-confetti
   
   import confetti from "canvas-confetti"
   confetti({
     particleCount: 80,         // Reduced — not overwhelming
     spread: 60,
     origin: { y: 0.6 },
     colors: ["#6366F1", "#8B5CF6", "#10B981"]
   })

4. Stage cards stagger in one by one:
   80ms delay between each card appearance
   opacity 0 → 1, y: 12 → 0

5. Verdict text:
   Score ≥ 75: "Ready to Launch 🚀" (green)
   Score 50–74: "Needs Refinement ⚡" (amber)
   Score < 50: "Back to Drawing Board 🔄" (red)
```

---

### Settings Page

```
Reorganize into 4 sections with clear visual dividers:

SECTION 1 — Profile
  Avatar initial circle, name, email
  Edit name button

SECTION 2 — Security
  Change password form
  Show password strength meter on new password input

SECTION 3 — Notifications
  Toggle switches for:
  - Email notifications on analysis complete
  - Co-founder messages
  - Platform updates

SECTION 4 — Danger Zone
  Red-bordered card, slightly separated from rest
  "Delete Account" button
  On click: modal asks user to type "DELETE" to confirm
  Never use browser confirm() — always use custom modal

Replace ALL alert() calls with toast notifications:
  Success: toast.success("Saved", { description: "Changes applied." })
  Error:   toast.error("Failed", { description: "Please try again." })
```

---

### AI Layers Improvement Chat

```
Question progress bar:
- Thin bar at top of panel
- Animates width: 0% → 16% → 33% → 50% → 66% → 83% → 100%
- CSS transition: width 500ms ease-out
- Color: indigo accent

Each question entrance:
- Animate in: opacity 0 → 1, y: 12 → 0
- Duration: 300ms ease-out
- Do NOT show next question until previous answer submitted

After final answer — processing state:
- Hide question UI
- Show: spinner + "Re-analyzing your idea with new context..."
- Show stage-by-stage progress as each completes:
  "✓ Updating validation..."
  "✓ Updating market research..."
  "✓ Updating competitor analysis..."
- When complete: show score diff card:
  "Your score improved: 72 → 86 ↑14 points"
  Color: green, with confetti (reduced — 40 particles)
```

---

## STEP 7 — TOAST NOTIFICATION SYSTEM

Install: `npm install sonner`

Setup in root layout:

```tsx
import { Toaster } from "sonner"

// Add inside <body>:
<Toaster
  position="bottom-right"
  theme="dark"
  toastOptions={{
    style: {
      background: "#111827",
      border: "1px solid #1E2A3A",
      color: "#F1F5F9",
      borderRadius: "10px",
      fontSize: "13px",
    },
  }}
/>
```

Usage everywhere (replace all alert() and confirm()):

```typescript
import { toast } from "sonner"

toast.success("Saved successfully")
toast.error("Something went wrong — please try again")
toast.loading("Generating your presentation...")
toast.dismiss()
```

---

## STEP 8 — MOBILE RESPONSIVENESS

Apply these rules to every page:

```
Navigation:
- Desktop: left sidebar
- Mobile (< 768px): hide sidebar, show bottom navigation bar
- Bottom nav: 5 icons max (Dashboard, Ideas, Explore, Chat, Settings)

Layout:
- All grids: responsive columns
  Desktop: grid-cols-3 or grid-cols-2
  Mobile: grid-cols-1
- Cards: full width on mobile
- Padding: px-4 on mobile, px-6 on desktop

Analysis stages:
- Stage cards: full width on mobile
- Score badges: inline not absolute-positioned
- "Next Stage" button: fixed bottom-center on mobile, z-50

Chat:
- Mobile: full screen, conversation list is first screen
- Back button returns to conversation list
- Message input: fixed to bottom of screen

Tables:
- On mobile: horizontal scroll (overflow-x: auto)
- Never shrink text below 12px
```

---

## STEP 9 — PERFORMANCE RULES

```
1. Use CSS transitions for hover states — NOT GSAP
   GSAP only for:
   - Scroll-triggered reveals
   - Score counter animation
   - Page entrance

2. Add will-change only right before animation, remove after:
   element.style.willChange = "transform, opacity"
   // After animation:
   element.style.willChange = "auto"

3. Lazy load heavy components:
   const CoFounderFinder = dynamic(() => import("./CoFounderFinder"), { 
     loading: () => <StageSkeleton /> 
   })

4. Images: always use next/image with proper sizing

5. GSAP ScrollTrigger cleanup:
   return () => ScrollTrigger.getAll().forEach(t => t.kill())
   // Must be in every useEffect cleanup

6. Lenis and GSAP ScrollTrigger sync:
   lenis.on("scroll", ScrollTrigger.update)
   gsap.ticker.add((time) => lenis.raf(time * 1000))
   gsap.ticker.lagSmoothing(0)
```

---

## STEP 10 — VERIFICATION CHECKLIST

Run through every item before marking complete.

### Functionality
- [ ] Navbar shows user name + avatar when logged in
- [ ] All buttons have loading states
- [ ] All forms show inline validation (not alerts)
- [ ] Skeletons show while data loads
- [ ] Toast notifications replace all browser alerts
- [ ] Settings page has 4 sections, saves correctly
- [ ] Delete account requires typing "DELETE"
- [ ] Final report shows score counter animation
- [ ] Confetti fires on score ≥ 80
- [ ] AI Layers shows animated progress bar per question

### Performance
- [ ] No layout shifts during animations
- [ ] Lenis scroll feels smooth on desktop and mobile
- [ ] GSAP ScrollTrigger cleans up on unmount
- [ ] No console errors or warnings
- [ ] No animation lag on lower-end devices

### Responsiveness
- [ ] All pages work at 375px (iPhone SE)
- [ ] Bottom navigation appears on mobile
- [ ] Cards stack to single column on mobile
- [ ] Chat is full-screen on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Text never shrinks below 12px
- [ ] CTA buttons are full-width on mobile

### Design Consistency
- [ ] All cards use the same border color (#1E2A3A)
- [ ] All buttons follow the btn-primary / btn-ghost / btn-danger system
- [ ] All inputs have consistent focus states
- [ ] Spacing follows 8px grid throughout
- [ ] Score badges consistently colored (green/amber/red)
- [ ] No random colors outside the defined palette

---

## FINAL NOTE TO DEVELOPER

The goal is to make Incepterx feel like it belongs next to
Stripe, Linear, and Notion — not because it copies them,
but because it has the same attention to detail.

That means:
- Every spacing decision is intentional
- Every animation serves a purpose
- Every empty state has guidance
- Every error has a path forward
- Every loading state maintains layout

Do not over-animate. Reduce intensity by 40% from what feels natural.
A subtle 150ms fade is more premium than a 600ms bounce.
Fast and reliable beats flashy and slow every time.
```

---

*Incepterx V2 — Frontend Upgrade Guide | Version 1.0*