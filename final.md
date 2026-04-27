# INCEPTERX V2 — Complete Product Specification & Development Guide
### Full Feature Set · Security · UX · AI Pipeline · Implementation Notes

> **For Developer:** This document is the single source of truth for Incepterx V2. Read every section before touching any code. Every feature, every route, every security rule, and every UX requirement is defined here. Build exactly this.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack — V2](#2-tech-stack--v2)
3. [Authentication & Security](#3-authentication--security)
4. [AI Engine — Accuracy Fix](#4-ai-engine--accuracy-fix)
5. [Core Feature: Idea Analysis Pipeline](#5-core-feature-idea-analysis-pipeline)
6. [Feature 1 — Investor Tab + PPT Generator](#6-feature-1--investor-tab--ppt-generator)
7. [Feature 2 — Public / Private Idea Sharing](#7-feature-2--public--private-idea-sharing)
8. [Feature 3 — AI Layers Engine](#8-feature-3--ai-layers-engine)
9. [Feature 4 — Co-Founder Finder + Chat](#9-feature-4--co-founder-finder--chat)
10. [Feature 5 — Research & Execution Hub](#10-feature-5--research--execution-hub)
11. [Bonus Features (Competition Winners)](#11-bonus-features-competition-winners)
12. [UX & Design System](#12-ux--design-system)
13. [Database Schema V2](#13-database-schema-v2)
14. [API Routes — Complete List](#14-api-routes--complete-list)
15. [Environment Variables](#15-environment-variables)
16. [Implementation Priority Order](#16-implementation-priority-order)

---

## 1. PROJECT OVERVIEW

**Incepterx** is an AI-powered startup validation and execution platform. It turns a raw idea into a structured, research-backed business plan across 8 analysis stages — then gives founders the tools to act on it: share it, pitch it, improve it, find a co-founder, and execute it.

**V2 Goal:** Fix the accuracy bug, add all 5 boss-approved features, add 3 competition-winning bonus features, lock down security, and make the UX feel premium.

**Current bugs to fix before adding anything new:**
- The user's idea text is NOT being injected into Gemini prompts — AI outputs generic/wrong analysis
- SerpAPI competitor search is not industry-specific — returns wrong results
- No context passed between stages — final report does not synthesize previous stages

---

## 2. TECH STACK — V2

| Layer | V1 | V2 (Update to this) |
|-------|-----|----------------------|
| Frontend | Next.js 16, React 19 | Keep — add Zustand for state |
| Styling | Tailwind v4, Shadcn UI | Keep — add Framer Motion for transitions |
| Backend | Python Flask | Keep — add Flask-Limiter, Flask-SocketIO |
| AI | Gemini 3 Flash Preview | Keep Gemini 3 — fix prompt injection |
| Research | SerpAPI | Keep SerpAPI — fix search queries |
| Database | SQLite | Keep for MVP — add proper indexing |
| Auth | Custom (check V1) | Replace with JWT + bcrypt (see Section 3) |
| Real-time | None | Add Flask-SocketIO for AI streaming + chat |
| PDF Export | None | Add Puppeteer (Node) or WeasyPrint (Python) |
| PPT Export | None | Add python-pptx |

---

## 3. AUTHENTICATION & SECURITY

### 3.1 Authentication Flow

**Signup:**
```
POST /api/auth/signup
Body: { name, email, password }
→ Validate email format
→ Check email not already registered (return 409 if taken)
→ Hash password with bcrypt (rounds: 12)
→ Save user to DB
→ Send welcome email (optional for MVP)
→ Return JWT access token + refresh token
```

**Login:**
```
POST /api/auth/login
Body: { email, password }
→ Find user by email
→ Compare password with bcrypt
→ If wrong: return 401 with generic message "Invalid credentials" (never say "wrong password" or "email not found" — security)
→ Return JWT access token (expires: 7 days) + refresh token (expires: 30 days)
```

**Logout:**
```
POST /api/auth/logout
→ Add token to server-side blacklist (store in DB: token_blacklist table)
→ Clear cookies on frontend
```

**Token Refresh:**
```
POST /api/auth/refresh
Header: Authorization: Bearer <refresh_token>
→ Validate refresh token
→ Return new access token
```

**Password Reset:**
```
POST /api/auth/forgot-password  → Send reset link via email
POST /api/auth/reset-password   → Validate token, update password
```

### 3.2 JWT Implementation (Python)

```python
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")  # NEVER hardcode this
ALGORITHM = "HS256"

def generate_tokens(user_id):
    access_token = jwt.encode({
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
        "type": "access"
    }, SECRET_KEY, algorithm=ALGORITHM)

    refresh_token = jwt.encode({
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30),
        "iat": datetime.utcnow(),
        "type": "refresh"
    }, SECRET_KEY, algorithm=ALGORITHM)

    return access_token, refresh_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            # Check blacklist
            if TokenBlacklist.query.filter_by(token=token).first():
                return jsonify({"error": "Token revoked"}), 401
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_user_id = payload["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated
```

### 3.3 Password Rules

- Minimum 8 characters
- Must contain at least 1 uppercase, 1 lowercase, 1 number
- Validate on both frontend AND backend
- Store ONLY bcrypt hash — never store plaintext

### 3.4 Security Rules — MANDATORY

Every single one of these must be implemented before launch:

**Rate Limiting (Flask-Limiter):**
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

# Apply per route:
@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("5 per minute")  # Prevent brute force
def login(): ...

@app.route("/api/ideas/analyze", methods=["POST"])
@limiter.limit("10 per hour")  # Prevent AI cost abuse
def analyze(): ...
```

**CORS — Lock it down:**
```python
from flask_cors import CORS
CORS(app, origins=["https://yourdomain.com", "http://localhost:3000"], supports_credentials=True)
# NEVER use CORS(app) with no origin restriction in production
```

**Input Sanitization — Every user input:**
```python
import bleach

def sanitize(text):
    # Strip all HTML tags, limit length
    cleaned = bleach.clean(text, tags=[], strip=True)
    return cleaned[:5000]  # Max 5000 chars for idea descriptions

# Apply before every DB insert and every AI prompt injection
idea_text = sanitize(request.json.get("description", ""))
```

**Security Headers (add to every response):**
```python
@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

**Environment Variables — NEVER commit these to git:**
```
JWT_SECRET_KEY=<random 64-char string>
GEMINI_API_KEY=<your key>
SERPAPI_KEY=<your key>
DATABASE_URL=<path or connection string>
```

**Additional rules:**
- All API keys in `.env` only — `.env` in `.gitignore`
- SQL queries must use SQLAlchemy ORM — never string-format raw SQL (prevents SQL injection)
- User can only access their own ideas — always filter by `user_id = current_user_id` in queries
- File uploads (if added): validate type, scan size, store outside web root

### 3.5 Frontend Auth (Next.js)

```typescript
// Store JWT in httpOnly cookie — NOT localStorage (XSS safe)
// Use Next.js middleware to protect routes

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  const protectedPaths = ['/dashboard', '/ideas', '/cofounder', '/hub']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}
```

**Auth Pages to build:**
- `/signup` — Name, email, password, confirm password. Show password strength meter.
- `/login` — Email, password. "Remember me" checkbox. "Forgot password" link.
- `/forgot-password` — Email input, send reset link.
- `/reset-password/[token]` — New password + confirm.
- All forms: show inline validation errors, not alerts. Never clear the form on error.

---

## 4. AI ENGINE — ACCURACY FIX

**This is the most critical fix. Do this before building any new features.**

### 4.1 The Root Cause

The current system loads a generic system prompt and does not inject the user's specific idea into the Gemini call. Fix this in `gemini_service.py` and `idea_analysis_service.py`.

### 4.2 The Fixed Prompt Structure

Every single Gemini API call must include the user's idea context at the top:

```python
# idea_analysis_service.py

def build_stage_prompt(stage_name: str, user_idea: dict, previous_results: dict = None) -> str:
    """
    CRITICAL: Always inject user idea into every prompt.
    previous_results passes all completed stage outputs for context.
    """

    idea_context = f"""
=== IDEA CONTEXT (ANALYZE SPECIFICALLY FOR THIS — DO NOT USE GENERIC TEMPLATES) ===
Idea Title: {user_idea['title']}
Description: {user_idea['description']}
Industry: {user_idea['industry']}
Target Market: {user_idea['target_market']}
Target Audience: {user_idea['target_audience']}
Problem Being Solved: {user_idea['problem']}
Proposed Solution: {user_idea['solution']}
Current Stage: {user_idea['stage']}
=== END IDEA CONTEXT ===

"""

    previous_context = ""
    if previous_results:
        previous_context = f"""
=== PREVIOUS STAGE RESULTS (USE THESE FOR CONSISTENCY) ===
{json.dumps(previous_results, indent=2)}
=== END PREVIOUS RESULTS ===

"""

    stage_prompt = load_stage_prompt(stage_name)  # Load from /prompts/ folder
    return idea_context + previous_context + stage_prompt
```

### 4.3 Research-Grounded Stages

For Stage 2 (Market Research) and Stage 4 (Competitors), search BEFORE calling Gemini:

```python
# market_service.py

def get_market_research(industry: str, idea_title: str) -> dict:
    """Run targeted searches and return formatted research for Gemini"""

    queries = [
        f"{industry} market size 2025",
        f"{industry} market growth rate CAGR 2024 2025",
        f"{idea_title} market trends 2025",
    ]

    results = []
    for query in queries:
        result = serpapi_search(query)
        results.append(result)

    return format_for_gemini(results)

def get_competitor_data(industry: str, idea_title: str) -> dict:
    """Search for REAL competitors in the specific industry"""

    queries = [
        f"top {industry} startups competitors 2025",
        f"best {idea_title} alternatives 2025",
        f"{industry} startup funding raised 2024",
    ]

    results = []
    for query in queries:
        result = serpapi_search(query)
        results.append(result)

    return format_for_gemini(results)
```

### 4.4 Gemini Call Settings

```python
# gemini_service.py

import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def call_gemini(prompt: str, stage: str) -> dict:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",  # Use latest available Gemini 3 model name
        generation_config={
            "temperature": 0.2,          # Low = accurate, consistent, not creative
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,   # Enough for full stage output
            "response_mime_type": "application/json",  # Force JSON output
        },
        system_instruction=load_system_prompt()  # Load LAUNCHIQ system prompt
    )

    try:
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        return {"success": True, "data": result, "stage": stage}
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract with cleanup
        cleaned = response.text.strip().lstrip("```json").rstrip("```").strip()
        result = json.loads(cleaned)
        return {"success": True, "data": result, "stage": stage}
    except Exception as e:
        return {"success": False, "error": str(e), "stage": stage}
```

### 4.5 Stage Context Chain

Each stage must receive all previous stage results:

```python
# idea_analysis_service.py

async def run_full_analysis(idea_id: int, user_idea: dict):
    results = {}

    stages = [
        ("validation", None),
        ("market_research", ["validation"]),
        ("target_audience", ["validation", "market_research"]),
        ("competitor_analysis", ["validation", "market_research"]),
        ("monetization", ["validation", "market_research", "target_audience"]),
        ("mvp_planning", ["validation", "monetization"]),
        ("gtm_strategy", ["validation", "target_audience", "monetization"]),
        ("final_report", list(results.keys())),
    ]

    for stage_name, context_stages in stages:
        # Build context from previous stages
        previous = {s: results[s] for s in (context_stages or []) if s in results}

        # Add research for specific stages
        research = None
        if stage_name == "market_research":
            research = get_market_research(user_idea["industry"], user_idea["title"])
        elif stage_name == "competitor_analysis":
            research = get_competitor_data(user_idea["industry"], user_idea["title"])

        prompt = build_stage_prompt(stage_name, user_idea, previous, research)
        result = call_gemini(prompt, stage_name)

        results[stage_name] = result["data"]

        # Save each stage to DB immediately
        save_stage_result(idea_id, stage_name, result["data"])

        # Emit real-time progress to frontend
        socketio.emit(f"analysis_progress_{idea_id}", {
            "stage": stage_name,
            "progress": calculate_progress(stage_name),
            "data": result["data"]
        })

    return results
```

---

## 5. CORE FEATURE: IDEA ANALYSIS PIPELINE

**8 stages, unchanged from V1 concept but now with proper AI injection.**

### Input Form Fields (all required):

```
- Idea Title (text, max 100 chars)
- Description (textarea, max 2000 chars)
- Industry (dropdown: Health & Fitness / EdTech / FinTech / SaaS / E-Commerce / FoodTech / PropTech / Other)
- Target Market (text, e.g. "North America", "Global", "South Asia")
- Target Audience (text, e.g. "Busy professionals aged 25–40")
- Problem Being Solved (textarea, max 500 chars)
- Proposed Solution (textarea, max 500 chars)
- Current Stage (dropdown: Idea / Early Stage / Scaling)
```

**All 8 fields must be passed into every Gemini prompt. This is the fix.**

### Progress UX:

- Progress bar always visible at top of screen during analysis
- Shows current stage name: "Analyzing competitors..."
- Shows estimated time: "~2 minutes remaining"
- Each completed stage card appears as it finishes — don't wait for all 8
- Use WebSocket (Flask-SocketIO) to stream stage completions to frontend in real-time

---

## 6. FEATURE 1 — INVESTOR TAB + PPT GENERATOR

### 6.1 What It Does

After the final analysis is complete, a new **"Investor"** tab appears in the idea dashboard. This tab has three sub-sections:

1. **Pitch Formula Generator** — AI generates 3 versions of the investor pitch
2. **Presentation Generator** — User clicks one button to generate a full PPT
3. **Investment Memo** — One-page investor summary (text format)

### 6.2 Pitch Formula Generator

Three pitch formats generated from real analysis data:

```
Format A — The Classic:
"[Product] is a [category] for [audience] that [core value prop]. 
Unlike [competitor], we [key differentiator]."

Format B — The Problem First:
"[X% of audience] struggle with [specific problem]. 
[Product] solves this by [solution]. We're targeting a $[TAM] market 
growing at [CAGR]% annually."

Format C — The Traction First:
"[Product] helps [audience] achieve [outcome] in [timeframe]. 
Our [key moat] gives us a defensible position in the [market size] [industry] market."
```

All numbers (TAM, CAGR, audience size) come directly from the analysis — not hardcoded.

**UI:**
- Three cards, each showing one pitch version
- "Copy to clipboard" button on each card
- "Regenerate" button to get new versions
- User can mark one as favorite with a star

### 6.3 PPT Generator

**Backend (python-pptx):**

```python
# ppt_service.py
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

def generate_investor_ppt(analysis_data: dict, user_name: str) -> str:
    """Generate a 10-slide investor deck from analysis data"""

    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    slide_layout = prs.slide_layouts[6]  # Blank layout

    # Color palette
    DARK = RGBColor(10, 10, 20)
    ACCENT = RGBColor(99, 102, 241)  # Indigo
    WHITE = RGBColor(255, 255, 255)
    LIGHT_GRAY = RGBColor(200, 200, 220)

    slides_data = [
        {
            "title": analysis_data["idea_title"],
            "subtitle": analysis_data["one_liner"],
            "type": "cover"
        },
        {
            "title": "The Problem",
            "content": analysis_data["validation"]["problem_analysis"],
            "type": "content"
        },
        {
            "title": "Our Solution",
            "content": analysis_data["validation"]["solution_analysis"],
            "type": "content"
        },
        {
            "title": "Market Opportunity",
            "tam": analysis_data["market_research"]["tam"],
            "sam": analysis_data["market_research"]["sam"],
            "cagr": analysis_data["market_research"]["cagr"],
            "type": "market"
        },
        {
            "title": "Target Audience",
            "content": analysis_data["target_audience"]["primary_persona"],
            "type": "content"
        },
        {
            "title": "Competitive Landscape",
            "competitors": analysis_data["competitor_analysis"]["top_competitors"],
            "gaps": analysis_data["competitor_analysis"]["market_gaps"],
            "type": "competitors"
        },
        {
            "title": "Business Model",
            "content": analysis_data["monetization"]["revenue_model"],
            "type": "content"
        },
        {
            "title": "MVP Roadmap",
            "phases": analysis_data["mvp_planning"]["phases"],
            "type": "roadmap"
        },
        {
            "title": "Go-To-Market Strategy",
            "content": analysis_data["gtm_strategy"]["launch_plan"],
            "type": "content"
        },
        {
            "title": "Why Now. Why Us.",
            "score": analysis_data["final_report"]["overall_score"],
            "recommendations": analysis_data["final_report"]["top_recommendations"],
            "type": "closing"
        }
    ]

    for slide_data in slides_data:
        slide = prs.slides.add_slide(slide_layout)
        # Add dark background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = DARK
        # Add content based on slide type (implement per type)
        build_slide(slide, slide_data, ACCENT, WHITE, LIGHT_GRAY)

    output_path = f"/tmp/incepterx_{analysis_data['idea_id']}_deck.pptx"
    prs.save(output_path)
    return output_path
```

**API Route:**
```
POST /api/ideas/<idea_id>/export/ppt
→ Requires authentication
→ Requires idea belongs to current user
→ Calls generate_investor_ppt()
→ Returns file as download
Headers: Content-Disposition: attachment; filename="IncepterxDeck.pptx"
```

**Frontend:**
- "Generate Presentation" button with loading state: "Building your deck..."
- After generation: instant download + "View Preview" button (optional)
- Show slide count: "10-slide investor deck"
- Add Incepterx branding on first and last slide

---

## 7. FEATURE 2 — PUBLIC / PRIVATE IDEA SHARING

### 7.1 What It Does

Every idea has a visibility state: **Private** (default) or **Public**. Public ideas get a unique shareable link that works without login. The owner can switch between states at any time.

### 7.2 Database Changes

```python
# Add to Idea model:
is_public = Column(Boolean, default=False, nullable=False)
share_token = Column(String(64), unique=True, nullable=True)  # UUID-based
public_views = Column(Integer, default=0)  # Track how many times viewed
```

### 7.3 Backend Routes

```python
# Make idea public — generates share token
POST /api/ideas/<idea_id>/publish
→ token_required
→ Verify user owns idea
→ Generate share_token = secrets.token_urlsafe(32)
→ Set is_public = True
→ Save share_token to DB
→ Return { share_url: "https://incepterx.com/i/<share_token>" }

# Make idea private
POST /api/ideas/<idea_id>/unpublish
→ token_required
→ Verify user owns idea
→ Set is_public = False
→ share_token remains in DB (so the same link works if re-published)
→ Return { success: true }

# View public idea (no auth required)
GET /api/public/ideas/<share_token>
→ No authentication needed
→ Find idea by share_token
→ If is_public = False: return 404 (not 403 — don't reveal it exists)
→ Increment public_views
→ Return sanitized idea data (exclude user email, private notes)
```

### 7.4 Share Link Page (Frontend)

Route: `/i/[share_token]`

This page is **publicly accessible** (no login required). It shows:
- Idea title and one-liner
- All 8 analysis stage results (read-only)
- Overall score prominently displayed
- "Analyzed by Incepterx" branding at top
- CTA at bottom: "Validate your own idea free → Sign up"
- No edit buttons, no export button (public viewers can't download)
- The owner sees a banner: "You are viewing the public version of this idea"

### 7.5 Privacy Toggle UI

In the idea dashboard, top right corner:

```
[🔒 Private] ← current state, click to change
```

On click: confirmation modal:
- "Make this idea public? Anyone with the link will be able to view your full analysis."
- [Cancel] [Make Public]

After making public:
- Shows share URL in a copyable input field
- Shows "📊 X people have viewed this" counter
- Toggle switches to [🌐 Public — click to make private]

---

## 8. FEATURE 3 — AI LAYERS ENGINE

### 8.1 What It Does

A dedicated improvement mode where the AI has a conversation with the user to progressively improve the analysis. Instead of a one-shot "submit idea → get report," the AI asks smart follow-up questions and refines the output with each answer.

This should feel like talking to a startup advisor, not filling out a form.

### 8.2 How It Works — Step by Step

```
1. User is on their idea dashboard after initial analysis
2. They click "Improve with AI" button
3. AI Layers panel opens (slide-in from right, or new page)
4. AI greets: "Let's make your analysis more accurate. I'll ask you a few important questions."
5. AI asks Question 1 (specific to the idea and its weakest scoring area)
6. User answers (free text or multiple choice options)
7. AI acknowledges and asks Question 2
8. After 5–7 questions, AI says: "I have enough to improve your analysis. Updating now..."
9. AI re-runs the relevant stages with the enriched context
10. Dashboard updates with improved scores and more specific insights
```

### 8.3 Question Generation

Questions are dynamically generated based on the initial analysis results. The AI looks at the lowest-scoring areas first:

```python
# ai_layers_service.py

def generate_first_question(analysis_data: dict, user_idea: dict) -> str:
    prompt = f"""
You are a startup advisor. The user just completed their idea analysis.

IDEA: {user_idea['title']} — {user_idea['description']}

ANALYSIS SCORES:
- Validation Score: {analysis_data['validation']['score']}/100
- Market Score: {analysis_data['market_research']['score']}/100
- Audience Score: {analysis_data['target_audience']['score']}/100
- Competitor Score: {analysis_data['competitor_analysis']['score']}/100

TASK: Generate ONE smart, specific follow-up question that will help improve the 
lowest-scoring area. The question must:
- Be specific to THIS idea (not generic)
- Be answerable in 2–4 sentences
- Help you give better, more accurate analysis
- Sound like a human advisor asking, not a form field

Return ONLY the question text. No preamble.
"""
    return call_gemini(prompt, "layers_question")

def process_answer_and_next_question(
    conversation_history: list,
    user_idea: dict,
    analysis_data: dict,
    question_number: int
) -> dict:
    """
    Takes conversation so far, processes user's last answer,
    decides whether to ask another question or trigger re-analysis.
    """
    if question_number >= 6:
        return {"action": "reanalyze", "message": "I have enough context now. Updating your analysis..."}

    prompt = f"""
You are a startup advisor having a conversation with a founder.

IDEA CONTEXT: {json.dumps(user_idea)}
CONVERSATION SO FAR: {json.dumps(conversation_history)}
QUESTION NUMBER: {question_number}

Based on the conversation, generate the next most important question 
OR if you have enough information, say DONE.

Respond with JSON:
{{ "action": "ask" | "done", "question": "..." | null }}
"""
    return call_gemini(prompt, "layers_next")
```

### 8.4 Re-Analysis After Conversation

After the conversation completes, re-run only the stages that benefit from the new information. Pass the entire conversation as additional context:

```python
def reanalyze_with_layers_context(idea_id: int, user_idea: dict, conversation: list):
    enriched_context = {
        **user_idea,
        "ai_layers_conversation": conversation,
        "additional_context": extract_key_facts(conversation)
    }
    # Re-run full pipeline with enriched context
    run_full_analysis(idea_id, enriched_context)
```

### 8.5 Frontend — AI Layers UI

- Floating panel or dedicated `/dashboard/idea/[id]/improve` page
- Chat-style interface: AI messages on left, user messages on right
- Typing indicator when AI is "thinking"
- Progress indicator: "Question 3 of 6"
- After final question: animated "Reanalyzing your idea..." loader
- After reanalysis: show diff — "Your Validation Score improved from 72 → 86"
- Show badge on idea card: "AI-Refined ✓"

---

## 9. FEATURE 4 — CO-FOUNDER FINDER + CHAT

### 9.1 What It Does

An optional community feature where founders can opt in to be discoverable by others. Users browse profiles, see what ideas people are working on, and connect via built-in chat — without leaving the platform.

### 9.2 Opt-In Flow

Users are **private by default**. To become discoverable:

```
Settings → Co-Founder Profile → Enable
Fill in:
- Skills you bring (checkboxes: Technical / Design / Marketing / Sales / Operations / Finance)
- What skills you're looking for (same checkboxes)
- Your commitment level (Full-time / Part-time / Advisor)
- One-sentence bio (max 150 chars)
- Which idea(s) to show publicly (select from their ideas)
- Location (optional)
```

### 9.3 Database Changes

```python
# New table: CoFounderProfile
class CoFounderProfile(db.Model):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_discoverable = Column(Boolean, default=False)
    skills_offered = Column(JSON)        # ["technical", "design"]
    skills_needed = Column(JSON)         # ["marketing", "sales"]
    commitment_level = Column(String(20)) # full-time / part-time / advisor
    bio = Column(String(150))
    location = Column(String(100))
    idea_ids_public = Column(JSON)       # IDs of ideas to show
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

# New table: ChatRoom
class ChatRoom(db.Model):
    id = Column(Integer, primary_key=True)
    user_1_id = Column(Integer, ForeignKey("users.id"))
    user_2_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_1_id", "user_2_id"),)

# New table: ChatMessage
class ChatMessage(db.Model):
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
```

### 9.4 API Routes

```
GET  /api/cofounder/browse
     Query params: skills, commitment, location (all optional filters)
     Returns: list of discoverable profiles (no email, no private data)

GET  /api/cofounder/profile
     Returns: current user's co-founder profile

POST /api/cofounder/profile
     Create/update co-founder profile

POST /api/cofounder/connect/<user_id>
     Send a connection request (creates chat room)
     Rate limit: 10 connection requests per day

GET  /api/chat/rooms
     Returns: all chat rooms for current user

GET  /api/chat/rooms/<room_id>/messages
     Returns: messages in a chat room (paginated, 50 at a time)

POST /api/chat/rooms/<room_id>/messages
     Send a message
     Validate: current user is member of this room
     Content: max 2000 chars, sanitized

WebSocket event: "chat_message"
     Emit to specific room when new message sent
```

### 9.5 Chat Security Rules

- Users can ONLY message people they've initiated a connection with
- Message content is sanitized (bleach) before saving
- No file uploads in chat for V2
- Add ability to block a user (sets block flag, hides from discovery, disables chat)
- Report button on every profile (stores report, admin review later)

### 9.6 Frontend — Co-Founder Finder UI

**Browse page** (`/cofounder`):
- Card grid of discoverable founders
- Each card shows: first name + last initial, skills tags, commitment badge, location, idea preview
- Filter sidebar: skill, commitment level, location
- "Connect" button → opens confirmation modal → creates chat room → redirects to chat

**Chat UI** (`/chat`):
- Left sidebar: list of conversations
- Right: chat messages
- Real-time via Socket.IO
- Unread count badge on nav icon

---

## 10. FEATURE 5 — RESEARCH & EXECUTION HUB

### 10.1 What It Does

A dedicated workspace for each idea where users go beyond the report and actually execute. It's organized into 4 tabs:

```
[Deep Research] [Execution Checklist] [Resources] [Progress Tracker]
```

### 10.2 Tab 1 — Deep Research

AI-powered research on demand. User can ask specific research questions about their idea and get grounded, real-data answers:

```
"What are the top 5 acquisition channels for fitness apps in 2025?"
"What's the average churn rate for SaaS tools targeting SMBs?"
"Who are the top investors backing health tech startups right now?"
```

The AI uses SerpAPI to search, then synthesizes a structured answer with sources.

**UI:** Simple search bar + results below. Save results as "Research Notes" attached to the idea.

### 10.3 Tab 2 — Execution Checklist

Auto-generated from the MVP Planning and GTM stages. A living checklist:

```
PRE-LAUNCH
[ ] Register business name
[ ] Set up GitHub repo
[ ] Deploy landing page
[ ] Add email capture
[ ] Set up analytics (PostHog)

MVP BUILD
[ ] User authentication
[ ] Core feature 1: [from analysis]
[ ] Core feature 2: [from analysis]
[ ] ...

LAUNCH WEEK
[ ] Submit to Product Hunt
[ ] Post on LinkedIn
[ ] Email waitlist
[ ] ...
```

User can check items off. Progress bar shows % complete. This persists in the database.

**Backend:**
```python
# Checklist items saved per idea
class ChecklistItem(db.Model):
    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"))
    category = Column(String(50))  # pre-launch / build / launch
    text = Column(String(500))
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
```

### 10.4 Tab 3 — Resources

Curated resources relevant to the specific industry and stage. These are categorized:

- **Tools:** Recommended tools for this type of startup (linked)
- **Communities:** Where the target audience hangs out (Reddit, Slack, Discord links)
- **Investors:** VC funds active in this industry (pulled from analysis)
- **Templates:** Relevant document templates (pitch deck template, financial model, etc.)
- **Learning:** Curated articles/videos for this industry

These are dynamically generated by AI based on industry and stage — not hardcoded lists.

### 10.5 Tab 4 — Progress Tracker

A simple milestone tracker for the 90-day action plan from the final report:

```
Day 1–30: Foundation    [████░░░░░░] 40%
Day 31–60: Build        [░░░░░░░░░░] 0%
Day 61–90: Launch       [░░░░░░░░░░] 0%
```

User manually marks milestones complete. AI shows a motivational message when a phase is completed.

---

## 11. BONUS FEATURES (COMPETITION WINNERS)

These 3 extra features are short to build but make a massive impression on judges.

### 11.1 Founder–Idea Match Score

Before or during analysis, ask the user 5 quick questions about themselves:

```
1. Have you worked in this industry before? (Yes / Adjacent / No)
2. Do you have a technical co-founder or are you technical yourself? (Yes / Working on it / No)
3. How much time can you dedicate? (Full-time / Part-time / Weekends only)
4. Do you have an initial budget? ($0 / <$1K / $1K–$10K / $10K+)
5. Do you have an existing network in this space? (Yes / Small / No)
```

AI scores how well the founder matches the idea (0–100) and shows:

```
Founder–Idea Match: 73/100
"Your industry background gives you a strong edge. 
Your biggest gap is technical execution — 
consider finding a technical co-founder early."
```

Show this prominently on the final report. No competitor has this feature.

### 11.2 Stress Test Mode

One button on the final report: **"Stress Test My Idea"**

AI switches to a harsh VC persona and asks the 5 hardest questions about the idea:

```
VC: "Your TAM is $18B, but what's your realistic path to even 0.1% of that 
in 36 months? Show me the math."

VC: "Zapier and n8n already do automation. Why would anyone choose you 
over an established player with 10x your resources?"

VC: "What happens if Google or Microsoft copies your core feature 
in 6 months? What's your moat?"
```

After all 5 questions, AI shows how to answer each one well. This is the most demo-worthy feature in the entire product. Judges will try it.

### 11.3 One-Line Pitch Generator ("The Pitch Formula")

This is separate from the Investor Tab pitches. It's a quick shareable snippet in the formula:

**"It's like [X] but for [Y]"**

AI generates 3 versions of this using real analysis data:

```
Version A: "It's like Calendly, but for fitness coaches"
Version B: "Think Notion, but your AI workout coach lives inside it"  
Version C: "Like Superhuman, but for your gym routine"
```

One-click copy. Share to Twitter/X button. This gets shared and drives organic traffic.

---

## 12. UX & DESIGN SYSTEM

### 12.1 Core UX Rules (Anti-Gravity Design System)

**Principle: Every interaction should feel fast, smooth, and premium.**

- Dark background: `#0A0A14` (near black with a blue tint)
- Primary accent: `#6366F1` (indigo)
- Secondary accent: `#8B5CF6` (purple)
- Success: `#10B981` (emerald)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)
- Text primary: `#F1F5F9`
- Text secondary: `#94A3B8`
- Card background: `#111827`
- Border: `#1E2A3A`

### 12.2 Animation Rules (Framer Motion)

Apply these animations consistently:

```typescript
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// Card entrance
const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
}

// Score counter animation
// Use a counting animation for all score reveals (count up from 0 to final value)
// Duration: 1.5 seconds, ease: easeOut
```

### 12.3 Key UX Improvements Over V1

**Loading states — every async action must have one:**
- AI analysis: "Analyzing competitors..." with animated dots
- PPT generation: Progress bar with "Building slide 4 of 10..."
- Never show a blank screen — always show a skeleton or loader

**Error states — every error must be informative:**
- Never show raw error messages to users
- "Something went wrong with the analysis. Your idea has been saved — try again?"
- Retry button on every error state

**Empty states — every empty list needs guidance:**
- No ideas yet: "Ready to validate your first idea? → Analyze Now"
- No co-founders yet: "Be the first to connect with founders in your space → Set up profile"

**Forms — inline validation only:**
- Show errors inline below each field as the user types
- Never use alert() or confirm() for anything — use modals
- All forms autosave state to localStorage so refresh doesn't clear the form

**Navigation:**
```
Left sidebar (desktop) / Bottom nav (mobile):
- Dashboard
- My Ideas
- Co-Founder Finder
- Research Hub
- Settings
- [Upgrade] button (if free plan)
```

**Mobile responsiveness:**
- All pages must work on 375px (iPhone SE) minimum
- Analysis result cards stack vertically on mobile
- Chat is full-screen on mobile
- Bottom navigation replaces sidebar on mobile

### 12.4 Final Report — Big Reveal Moment

This is the most important UX moment in the entire product. Make it feel like an event:

1. Loader screen: "Compiling your startup blueprint..."
2. Fade in: Large animated score counter counting from 0 to final score
3. Score color: green if ≥75, amber if 50–74, red if <50
4. Confetti animation if score ≥ 80
5. "Your startup is Ready to Launch" / "Your startup Needs Refinement" — large text
6. Each stage score card fades in one by one with 100ms delay between each
7. CTA buttons: "Download Report" / "Generate Pitch Deck" / "Stress Test"

---

## 13. DATABASE SCHEMA V2

```python
# Full V2 schema — all tables

class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    plan = Column(String(20), default="free")  # free / pro
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    ideas = relationship("Idea", backref="user", lazy=True)

class TokenBlacklist(db.Model):
    __tablename__ = "token_blacklist"
    id = Column(Integer, primary_key=True)
    token = Column(String(512), unique=True, nullable=False)
    blacklisted_at = Column(DateTime, default=datetime.utcnow)
    # Add DB index on token for fast lookup
    __table_args__ = (Index("idx_token", "token"),)

class Idea(db.Model):
    __tablename__ = "ideas"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    industry = Column(String(50), nullable=False)
    target_market = Column(String(200))
    target_audience = Column(String(200))
    problem = Column(Text)
    solution = Column(Text)
    stage = Column(String(20), default="idea")
    status = Column(String(20), default="pending")  # pending/processing/complete/failed
    overall_score = Column(Integer)
    risk_level = Column(String(20))
    is_public = Column(Boolean, default=False)
    share_token = Column(String(64), unique=True)
    public_views = Column(Integer, default=0)
    ai_layers_count = Column(Integer, default=0)  # How many AI Layers sessions run
    founder_match_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    stage_results = relationship("StageResult", backref="idea", lazy=True)
    checklist_items = relationship("ChecklistItem", backref="idea", lazy=True)

class StageResult(db.Model):
    __tablename__ = "stage_results"
    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    stage_number = Column(Integer, nullable=False)
    stage_name = Column(String(50), nullable=False)
    result_json = Column(JSON, nullable=False)
    score = Column(Integer)
    version = Column(Integer, default=1)  # Increments with AI Layers refinements
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (Index("idx_idea_stage", "idea_id", "stage_name"),)

class AILayersSession(db.Model):
    __tablename__ = "ai_layers_sessions"
    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    conversation = Column(JSON)  # [{role: "ai"|"user", content: "..."}]
    status = Column(String(20), default="active")  # active / complete
    created_at = Column(DateTime, default=datetime.utcnow)

class ChecklistItem(db.Model):
    __tablename__ = "checklist_items"
    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    category = Column(String(50))
    text = Column(String(500), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    sort_order = Column(Integer)

class CoFounderProfile(db.Model):
    __tablename__ = "cofounder_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_discoverable = Column(Boolean, default=False)
    skills_offered = Column(JSON)
    skills_needed = Column(JSON)
    commitment_level = Column(String(20))
    bio = Column(String(150))
    location = Column(String(100))
    idea_ids_public = Column(JSON)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class ChatRoom(db.Model):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True)
    user_1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_1_id", "user_2_id"),)

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (Index("idx_room_messages", "room_id", "created_at"),)

class ResearchNote(db.Model):
    __tablename__ = "research_notes"
    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query = Column(String(500))
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 14. API ROUTES — COMPLETE LIST

```
AUTH
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/<token>
GET    /api/auth/me

IDEAS
GET    /api/ideas                           # All ideas for current user
POST   /api/ideas                           # Create new idea + start analysis
GET    /api/ideas/<id>                      # Get idea + all stage results
DELETE /api/ideas/<id>                      # Delete idea
GET    /api/ideas/<id>/stage/<stage_name>   # Get single stage result
POST   /api/ideas/<id>/regenerate/<stage>   # Re-run one stage
POST   /api/ideas/<id>/publish              # Make public
POST   /api/ideas/<id>/unpublish            # Make private

PUBLIC
GET    /api/public/ideas/<share_token>      # View public idea (no auth)

EXPORT
POST   /api/ideas/<id>/export/pdf           # Download PDF report
POST   /api/ideas/<id>/export/ppt           # Download PPT deck

INVESTOR
POST   /api/ideas/<id>/investor/pitches     # Generate 3 pitch formulas
POST   /api/ideas/<id>/investor/memo        # Generate investment memo

AI LAYERS
POST   /api/ideas/<id>/layers/start         # Start AI Layers session
POST   /api/ideas/<id>/layers/<session_id>/answer  # Submit answer to AI question
GET    /api/ideas/<id>/layers/<session_id>  # Get session state + current question

STRESS TEST
POST   /api/ideas/<id>/stresstest/start     # Start stress test
POST   /api/ideas/<id>/stresstest/question/<n>  # Get answer coaching for question N

PITCH FORMULA
POST   /api/ideas/<id>/pitch-formula        # Generate "It's like X but for Y" pitches

FOUNDER MATCH
POST   /api/ideas/<id>/founder-match        # Submit founder questions, get match score

CO-FOUNDER
GET    /api/cofounder/browse
GET    /api/cofounder/profile
POST   /api/cofounder/profile
POST   /api/cofounder/connect/<user_id>

CHAT
GET    /api/chat/rooms
GET    /api/chat/rooms/<id>/messages
POST   /api/chat/rooms/<id>/messages

RESEARCH HUB
POST   /api/hub/research                    # AI-powered research query
GET    /api/hub/resources/<idea_id>         # Get curated resources for idea
GET    /api/hub/checklist/<idea_id>         # Get checklist items
PATCH  /api/hub/checklist/<item_id>         # Mark checklist item complete/incomplete

USER
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/password
DELETE /api/user/account                    # Delete account + all data
```

---

## 15. ENVIRONMENT VARIABLES

Create a `.env` file in `/backend/`. Add `.env` to `.gitignore`. Never commit this file.

```bash
# Core
FLASK_ENV=development
SECRET_KEY=<random 64-char string — generate with: python -c "import secrets; print(secrets.token_hex(32))">
JWT_SECRET_KEY=<different random 64-char string>

# AI
GEMINI_API_KEY=<your Gemini API key from aistudio.google.com>

# Research
SERPAPI_KEY=<your SerpAPI key>

# Database
DATABASE_URL=sqlite:///incepterx.db

# Email (for password reset) — use Gmail SMTP for free
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your gmail>
MAIL_PASSWORD=<app password — NOT your gmail password>
MAIL_DEFAULT_SENDER=noreply@incepterx.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 16. IMPLEMENTATION PRIORITY ORDER

Build in exactly this order. Each step must work before moving to the next.

```
PHASE 0 — FIX THE EXISTING BUGS (Day 1–2)
✅ Step 1: Fix prompt injection — inject all idea fields into every Gemini call
✅ Step 2: Fix SerpAPI queries — make them industry + idea specific
✅ Step 3: Add stage context chain — pass previous results to each stage
✅ Step 4: Test with 3 different ideas — verify accurate, specific outputs

PHASE 1 — SECURITY (Day 3)
✅ Step 5: Replace existing auth with JWT + bcrypt
✅ Step 6: Add rate limiting on auth and analysis routes
✅ Step 7: Add input sanitization on all user inputs
✅ Step 8: Lock down CORS, add security headers
✅ Step 9: Move all API keys to .env, verify nothing is hardcoded

PHASE 2 — CORE FEATURES (Day 4–7)
✅ Step 10: Feature 2 — Public/Private sharing (quickest feature, most impactful)
✅ Step 11: Feature 1 — Investor Tab + Pitch Formula Generator
✅ Step 12: Feature 1 — PPT Generator
✅ Step 13: Feature 3 — AI Layers Engine (conversation + re-analysis)
✅ Step 14: Feature 5 — Research Hub (Deep Research tab first)
✅ Step 15: Feature 5 — Execution Checklist tab
✅ Step 16: Feature 4 — Co-Founder Finder (profiles + browse)
✅ Step 17: Feature 4 — Chat (WebSocket)

PHASE 3 — BONUS COMPETITION FEATURES (Day 8–9)
✅ Step 18: Founder–Idea Match Score
✅ Step 19: Stress Test Mode
✅ Step 20: One-Line Pitch Formula ("It's like X but for Y")

PHASE 4 — UX POLISH (Day 10)
✅ Step 21: Add all loading states and error states
✅ Step 22: Add Framer Motion animations
✅ Step 23: Final Report big reveal moment (score counter + confetti)
✅ Step 24: Mobile responsiveness check on all pages
✅ Step 25: Full end-to-end test with 5 different ideas
```

---

> **Final note for developer:** The single most important thing in this entire document is Section 4 (AI Accuracy Fix). If the AI outputs the wrong idea like it did before (showing Meal Planner for a Fitness Coach), none of the other features matter. Fix the prompt injection FIRST. Everything else is built on top of a working, accurate AI engine.

*Incepterx V2 — Build less. Validate more. Execute with confidence.*