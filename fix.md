INCEPTERX V2 — BUG REPORT & IMPLEMENTATION GUIDE
Priority: Critical (Competition Deadline)
Read every section fully before starting. Fix in the exact order listed.

═══════════════════════════════════════════════
SECTION 1 — CRITICAL BUGS (Fix First)
═══════════════════════════════════════════════

BUG 1 — AI QUOTA / FALLBACK NOT WORKING
─────────────────────────────────────────
Problem:
Gemini 2.0 Flash is hitting free tier quota limits and throwing 429 errors.
The fallback to Groq is not triggering. Users see a raw error message.

Error shown:
"Failed to start improvement session: 429 You exceeded your current quota..."

Fix:
1. Update gemini_service.py — the fallback chain must catch 429 errors:

def call_with_fallback(prompt, stage):
    try:
        return call_gemini(prompt, stage)
    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "quota" in error_str or "rate" in error_str:
            try:
                return call_groq(prompt, stage)
            except Exception as groq_error:
                return call_openrouter(prompt, stage)
        raise e

2. Update model names in gemini_service.py to latest available:
   Primary:  gemini-2.0-flash-exp
   Fallback 1: gemini-1.5-flash (separate quota pool)
   Fallback 2: Groq → llama-3.3-70b-versatile
   Fallback 3: OpenRouter → free models

3. Never show raw API error to user. Always show:
   "Analysis is taking longer than usual, please wait..."
   Then retry silently in background.

4. Add GROQ_API_KEY and OPENROUTER_API_KEY to .env
   Get Groq key free: console.groq.com
   Get OpenRouter key free: openrouter.ai

─────────────────────────────────────────
BUG 2 — MVP BLUEPRINT SHOWING N/A
─────────────────────────────────────────
Problem:
MVP Planning stage shows "N/A" for all feature names.
Feature | AI | Priority | N/A | High  (repeated 3 times)

Root cause: Either mvp_planning_prompt.txt is not returning
feature names in JSON, or frontend is reading wrong field.

Fix:
1. Open backend/prompts/mvp_planning_prompt.txt
   Verify the prompt explicitly asks for this JSON structure:
   {
     "features": [
       {
         "name": "Feature name here",
         "is_ai_powered": true,
         "priority": "High",
         "description": "What it does"
       }
     ]
   }

2. Add console.log in frontend MVP component to print
   raw stage result JSON before rendering.

3. If JSON has feature names but frontend shows N/A —
   fix the field mapping: result.name not result.feature_name

4. Test by submitting one idea and checking the raw
   StageResult record in the database for mvp_planning stage.
   Verify "name" field exists and is not null.

─────────────────────────────────────────
BUG 3 — COMPETITOR ANALYSIS WRONG INDUSTRY
─────────────────────────────────────────
Problem:
Competitors returned are Four Sigmatic (mushroom coffee),
Host Defense (health supplements), Tracxpoint (grocery carts).
These have zero relation to an AI eCommerce personalization engine.

Root cause: SerpAPI queries in market_service.py are generic,
not using the idea's title or industry.

Fix in market_service.py — replace competitor search queries with:

def get_competitor_data(industry: str, idea_title: str) -> dict:
    queries = [
        f"{idea_title} competitors 2025",
        f"AI {industry} software competitors 2025",
        f"best {industry} personalization tools startups",
        f"{idea_title} alternative tools"
    ]
    # Run all 4 queries, combine results, pass to Gemini

Expected result for NeuroCart:
Dynamic Yield, Nosto, Bloomreach, Barilliance, LimeSpot

─────────────────────────────────────────
BUG 4 — MARKET TAM IS WRONG ($1.4 TRILLION)
─────────────────────────────────────────
Problem:
TAM shows $1.4 trillion — this is the entire global eCommerce
market, not the AI personalization software niche.
Judges will immediately reject this as bad research.

Fix in market_service.py — change market size query to:

def get_market_research(industry: str, idea_title: str) -> dict:
    queries = [
        f"{idea_title} software market size 2025",
        f"AI {industry} personalization market size CAGR",
        f"{industry} personalization tools market growth 2025"
    ]
    # NOT: f"{industry} market size" — too broad

Correct answer for NeuroCart: ~$8–12B TAM, ~15% CAGR

─────────────────────────────────────────
BUG 5 — ANALYSIS NOT FOUND AFTER 20 MINUTES
─────────────────────────────────────────
Problem:
"Analysis not found — We couldn't retrieve the validation
report for this idea" showing for MVP Planning and other stages.
Data disappears after time or logout.

Root cause: Stage results may be stored in memory/session
instead of database, OR the idea_id lookup is failing.

Fix:
1. Verify every stage result is saved to StageResult table
   immediately after Gemini returns — not held in memory.

2. In idea_analysis_service.py after each stage call:
   stage_result = StageResult(
       idea_id=idea_id,
       stage_name=stage_name,
       result_json=result_data,
       score=result_data.get("score")
   )
   db.session.add(stage_result)
   db.session.commit()  # Commit after EVERY stage, not at end

3. Frontend GET /api/ideas/<id>/stage/<stage_name> must
   read from database — not from a cached response object.

4. Results must persist forever until user explicitly deletes.
   No TTL, no session expiry on analysis data.

═══════════════════════════════════════════════
SECTION 2 — DATABASE MIGRATION (PostgreSQL)
═══════════════════════════════════════════════

MIGRATE FROM SQLITE TO POSTGRESQL
──────────────────────────────────
Reason: SQLite will break under multiple concurrent users
after deployment. PostgreSQL is required for production.

Steps:

1. Install dependencies:
   pip install psycopg2-binary sqlalchemy alembic

2. Update config.py:
   # Remove:
   SQLALCHEMY_DATABASE_URI = "sqlite:///inceptrax.db"
   
   # Add:
   SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
   # DATABASE_URL format: postgresql://user:password@host:port/dbname

3. Update .env:
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/inceptrax

4. Initialize Alembic for migrations:
   alembic init migrations
   
   In migrations/env.py set:
   from app.models.user_model import db
   target_metadata = db.metadata

5. Run first migration:
   alembic revision --autogenerate -m "initial_postgres_schema"
   alembic upgrade head

6. All models stay exactly the same — SQLAlchemy handles
   the dialect difference automatically.

7. For deployment (Railway/Render/Supabase):
   They provide DATABASE_URL automatically.
   Just set it as environment variable.

IMPORTANT: Export SQLite data before switching:
   python -c "
   import sqlite3, json
   conn = sqlite3.connect('inceptrax.db')
   # Export each table to JSON for re-import
   "

═══════════════════════════════════════════════
SECTION 3 — FEATURE FIXES
═══════════════════════════════════════════════

FIX 1 — NAVBAR SHOWING SIGN IN WHEN LOGGED IN
───────────────────────────────────────────────
Problem: User is logged in but navbar still shows
"Sign In" and "Get Started" buttons.

Fix in navbar.tsx:
- Read auth state from auth-provider context
- If user is authenticated, show: profile avatar + user name
- If not authenticated, show: Sign In + Get Started

const { user, isAuthenticated } = useAuth()

// In JSX:
{isAuthenticated ? (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium">{user.name}</span>
    <Avatar>
      <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  </div>
) : (
  <div className="flex gap-2">
    <Button variant="ghost">Sign In</Button>
    <Button>Get Started</Button>
  </div>
)}

FIX 2 — GO-TO-MARKET "FINISH ANALYSIS" BUTTON
───────────────────────────────────────────────
Problem: GTM page shows "Finish Analysis" button but
3 more pages exist: Investor Pitches, Research Hub,
Competitor Watch.

Fix: Change button label and behavior on GTM page:
- Label: "Next: Investor Pitches →"
- Action: Navigate to investor pitches page
- Only show "Finish Analysis" on the LAST page
  which is Competitor Watch

FIX 3 — EXPLORE MORE LINKS GOING TO EXAMPLE.COM
──────────────────────────────────────────────────
Problem: Dashboard "Explore More" button opens
https://example.com/resources in new tab.

Fix: Replace all placeholder example.com links with
real curated URLs based on the idea's industry.
Generate these dynamically in the Research Hub
resources generation, or hardcode useful defaults:

Default fallbacks by category:
- Market Research: https://statista.com
- Startup Tools: https://producthunt.com
- Investor Search: https://crunchbase.com
- Communities: https://reddit.com/r/startups
- Learning: https://ycombinator.com/library

FIX 4 — BONUS TOOLS PAGES NOT WORKING (4 pages)
──────────────────────────────────────────────────
Problem: All 4 bonus tool pages are broken:
- /dashboard/idea/[id]/founder-match
- /dashboard/idea/[id]/stress-test
- /dashboard/idea/[id]/one-liner
- /dashboard/idea/[id]/improve

Fix checklist:
1. Verify all 4 backend routes exist and return 200:
   POST /api/ideas/<id>/founder-match
   POST /api/ideas/<id>/stress-test
   POST /api/ideas/<id>/one-liner
   POST /api/ideas/<id>/layers/improve/start

2. Test each route with Postman/curl before fixing frontend

3. Check frontend fetch URLs match backend route exactly
   (trailing slash, method type, auth header present)

4. Add error boundaries on each page — if API fails,
   show "Try again" button not blank page

FIX 5 — AI LAYERS PROGRESS BAR AND ANIMATION
──────────────────────────────────────────────
Problem: The 6-question progress bar appears instantly
with no animation. After all questions done, loading
bar stays visible with no real-time feedback.

Fix in improve/page.tsx:

Progress bar — animate each step:
// Use CSS transition on width change
<div 
  className="h-1 bg-indigo-500 transition-all duration-500 ease-out"
  style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
/>

Question appearance — fade in each question:
// Wrap each question in motion.div
<motion.div
  key={questionIndex}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {currentQuestion}
</motion.div>

After final question — show real processing state:
const [analysisState, setAnalysisState] = useState(
  "idle" | "processing" | "complete"
)

When processing:
- Hide progress bar
- Show: animated spinner + "Re-analyzing your idea with new context..."
- Show stage-by-stage progress: "Updating market research... ✓"
- When complete: show score diff "Score: 72 → 86 ↑"

FIX 6 — PUBLIC IDEAS PAGE (NEW PAGE)
──────────────────────────────────────
Problem: No dedicated page for publicly shared ideas.
Users need to discover other founders' public ideas
and message them directly.

Create new page: /ideas/explore

Backend:
GET /api/public/ideas
- Returns all ideas where is_public = True
- Paginated: 12 per page
- Include: idea title, one-liner, industry, overall_score,
  founder first name, founder avatar initial, created_at
- Exclude: founder email, private notes, user_id

GET /api/public/ideas?industry=fintech&sort=score
- Filter by industry
- Sort by: score / newest / most_viewed

Frontend card shows:
- Idea title + one-liner
- Industry badge
- Overall score (colored circle)
- Founder name + avatar
- "View Full Analysis" button → /share/[share_token]
- "Message Founder" button → /chat?user=[founder_id]

Add link to this page in navbar as "Explore Ideas"

FIX 7 — PUBLIC/PRIVATE TOGGLE ON IDEA CARDS
──────────────────────────────────────────────
Problem: My Ideas page cards have no working
public/private toggle visible.

Fix in idea cards:
- Add small toggle switch: "🔒 Private" / "🌐 Public"
- On toggle: call POST /api/ideas/<id>/publish or /unpublish
- When made public: show share link modal with copy button
- When public: idea appears in /ideas/explore page
- When public: show "Visible in Explore" green badge on card

FIX 8 — CHAT: FULL PAGE INSTEAD OF SIDEBAR
─────────────────────────────────────────────
Problem: Chat currently shows as sidebar only.
Should be a full dedicated chat page.

Fix: 
- Create /chat page with full layout:
  Left panel (300px): conversation list
  Right panel (flex-1): active conversation messages
- On mobile: conversation list is full screen,
  tap conversation to open message view (back button to return)
- "Message Founder" from explore page opens /chat?with=[user_id]
  and auto-creates or opens existing chat room

FIX 9 — PUBLIC SHARE PAGE MISSING TABS
────────────────────────────────────────
Problem: Public idea view at /share/[token] shows 7 tabs
but Research Hub and Competitor Watch are missing.

Fix: Add both tabs to public share page.
- Research Hub tab: show read-only version (no refresh button)
- Competitor Watch tab: show competitor list read-only
  (no "Enable Monitoring" for public viewers)
- Both tabs load from existing StageResult data —
  no new API calls needed

FIX 10 — REAL-TIME NOTIFICATIONS
───────────────────────────────────
Problem: No real-time notification system exists.

Implement using Flask-SocketIO (already in requirements):

Notification triggers:
- Someone messages you in chat → bell icon +1
- Someone views your public idea → optional
- AI analysis stage completes → progress update
- AI Layers re-analysis complete → "Your score improved!"
- Co-founder connection request received → bell +1

Frontend:
- Bell icon in navbar with unread count badge
- Notification dropdown: list of recent notifications
- Click notification → navigate to relevant page
- Mark all read button

Backend:
class Notification(db.Model):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50))  # chat/analysis/cofounder/layers
    message = Column(String(200))
    link = Column(String(200))  # Where to navigate on click
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

SocketIO emit on each trigger:
socketio.emit(f"notification_{user_id}", {
    "message": "...",
    "type": "...",
    "link": "..."
})

FIX 11 — CO-FOUNDER "MAKE ME DISCOVERABLE" BUTTON
────────────────────────────────────────────────────
Problem: Button exists but does not actually update
the database or change discovery status.

Fix in cofounder_routes.py:
POST /api/cofounder/profile/discoverable
- Toggle is_discoverable on CoFounderProfile
- If profile doesn't exist, create it first
- Return new status

In frontend settings/cofounder page:
- Button calls this endpoint on click
- Optimistically update UI state
- Show success toast: "You are now discoverable to founders"
- If turning off: "You are no longer visible to others"

FIX 12 — SETTINGS PAGE UX + POPUP ALERTS
──────────────────────────────────────────
Problem: Settings page UX is poor. Alerts are plain
browser alerts instead of styled popups.

Fix — replace all alert() calls with toast component:

// Install if not present: sonner or react-hot-toast
import { toast } from "sonner"

// Replace:
alert("Settings saved!")
// With:
toast.success("Settings saved", {
  description: "Your changes have been applied.",
  duration: 3000,
})

toast.error("Failed to save", {
  description: "Please try again.",
})

Settings page layout fix:
- Organize into clear sections with dividers:
  Profile / Security / Notifications / Danger Zone
- Each section has a title, description, and its own save button
- Danger Zone (delete account) at the very bottom,
  red border, requires typing "DELETE" to confirm

FIX 13 — CONTACT FORM EMAIL WITH RESEND
─────────────────────────────────────────
Problem: Contact form submissions are not emailed
to the company. Need branded email template.

Backend fix (contact_routes.py):

import resend
resend.api_key = os.environ.get("RESEND_API_KEY")

def send_contact_email(name, email, subject, message):
    resend.Emails.send({
        "from": "Incepterx <noreply@yourdomain.com>",
        "to": ["your-company-email@gmail.com"],
        "reply_to": email,
        "subject": f"[Incepterx Support] {subject}",
        "html": f"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;
                    background:#0A0A14;color:#F1F5F9;padding:32px;border-radius:12px">
          <h2 style="color:#6366F1;margin-bottom:24px">New Contact Form Submission</h2>
          <p><strong>From:</strong> {name} ({email})</p>
          <p><strong>Subject:</strong> {subject}</p>
          <hr style="border-color:#1E2A3A;margin:20px 0"/>
          <p style="white-space:pre-wrap">{message}</p>
          <hr style="border-color:#1E2A3A;margin:20px 0"/>
          <p style="color:#94A3B8;font-size:12px">
            Sent via Incepterx Contact Form
          </p>
        </div>
        """
    })

Add RESEND_API_KEY to .env
Get key free at resend.com (3,000 emails/month free)

═══════════════════════════════════════════════
SECTION 4 — UX / FRONTEND POLISH
(Apply AFTER all bugs are fixed)
═══════════════════════════════════════════════

You are an elite senior UI/UX engineer and frontend developer.
Your goal is to improve the existing frontend without breaking
its structure.

First, carefully READ and ANALYZE the current frontend codebase,
including all styles, components, layout structure, and design
patterns. Understand the current dark theme, spacing system,
typography, and component hierarchy before making any changes.

DO NOT redesign from scratch. Improve and refine what exists.

DESIGN SYSTEM:
Background:   #0A0A14
Card:         #111827
Accent:       #6366F1
Text Primary: #F1F5F9
Text Muted:   #94A3B8
Border:       #1E2A3A
Success:      #10B981
Warning:      #F59E0B
Danger:       #EF4444

SPACING: Use 8px grid system throughout (8, 16, 24, 32, 48px)

TYPOGRAPHY:
- Page titles: text-2xl font-semibold
- Section headers: text-lg font-medium
- Body: text-sm text-muted
- Labels: text-xs uppercase tracking-wider

ANIMATIONS (keep minimal — competition demo must be fast):
- Page transitions: opacity 0→1, y 20→0, duration 300ms
- Card entrance: scale 0.95→1, opacity 0→1, duration 250ms
- Staggered cards: 80ms delay between each
- Button hover: scale 1.02, duration 150ms
- Progress bars: CSS transition width, duration 500ms ease-out
- NO heavy libraries, NO complex keyframes

COMPONENT RULES:
Buttons:
  - Primary: bg-indigo-600 hover:bg-indigo-500 
  - Ghost: transparent hover:bg-white/5
  - Danger: bg-red-600 hover:bg-red-500
  - All buttons: transition-all duration-150 rounded-lg px-4 py-2

Cards:
  - bg-[#111827] border border-[#1E2A3A] rounded-xl p-6
  - hover: border-[#6366F1]/40 shadow-lg shadow-indigo-500/5
  - transition-all duration-200

Inputs:
  - bg-[#0A0A14] border border-[#1E2A3A] rounded-lg px-4 py-2.5
  - focus: border-indigo-500 ring-1 ring-indigo-500/20 outline-none
  - error: border-red-500

Badges:
  - text-xs font-medium px-2.5 py-0.5 rounded-full
  - Industry: bg-indigo-500/10 text-indigo-400
  - Score high: bg-emerald-500/10 text-emerald-400
  - Score low: bg-red-500/10 text-red-400

LOADING STATES:
Every async component must have a skeleton loader:

const SkeletonCard = () => (
  <div className="bg-[#111827] border border-[#1E2A3A] 
                  rounded-xl p-6 animate-pulse">
    <div className="h-4 bg-[#1E2A3A] rounded w-3/4 mb-3"/>
    <div className="h-3 bg-[#1E2A3A] rounded w-1/2 mb-2"/>
    <div className="h-3 bg-[#1E2A3A] rounded w-2/3"/>
  </div>
)

SPECIFIC PAGE FIXES:

Settings Page:
- Organize into 4 sections with clear dividers:
  Profile | Security | Notifications | Danger Zone
- Each section: title + description + form + own Save button
- Danger Zone: red border, confirm by typing DELETE

Dashboard Search:
- Search input filters idea cards in real-time as user types
- Filter by: idea title, industry, status
- No API call needed — filter existing loaded ideas client-side
- Show "No ideas match your search" empty state

Final Report Big Reveal:
- Score counts up from 0 to final value over 1.5 seconds
- Score color: green if ≥75, amber if 50-74, red if <50
- Add canvas-confetti if score ≥ 80
- Stage score cards fade in one by one with 80ms stagger
- Large text: "Ready to Launch" or "Needs Refinement"

═══════════════════════════════════════════════
SECTION 5 — ENVIRONMENT VARIABLES (.env)
═══════════════════════════════════════════════

Add these if not already present:

# AI — Primary
GEMINI_API_KEY=your_key_here

# AI — Fallbacks (get free keys)
GROQ_API_KEY=get_free_at_console.groq.com
OPENROUTER_API_KEY=get_free_at_openrouter.ai

# Research
SERPAPI_KEY=your_key_here

# Email
RESEND_API_KEY=get_free_at_resend.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/inceptrax

# Auth
JWT_SECRET_KEY=generate_with_python_secrets_token_hex_32
SECRET_KEY=different_random_64_char_string

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

═══════════════════════════════════════════════
SECTION 6 — IMPLEMENTATION ORDER
═══════════════════════════════════════════════

Fix in this exact order. Do not skip ahead.

STEP 1: Fix Gemini fallback chain (BUG 1) — 30 mins
STEP 2: Fix MVP N/A bug (BUG 2) — 30 mins  
STEP 3: Fix competitor queries (BUG 3) — 20 mins
STEP 4: Fix market TAM queries (BUG 4) — 20 mins
STEP 5: Fix analysis persistence to DB (BUG 5) — 45 mins
STEP 6: Migrate SQLite → PostgreSQL (Section 2) — 1 hour
STEP 7: Fix navbar auth state (FIX 1) — 15 mins
STEP 8: Fix GTM next button (FIX 2) — 10 mins
STEP 9: Fix example.com links (FIX 3) — 20 mins
STEP 10: Fix all 4 bonus tool pages (FIX 4) — 1 hour
STEP 11: Fix AI Layers animation (FIX 5) — 30 mins
STEP 12: Build /ideas/explore public page (FIX 6) — 2 hours
STEP 13: Public/private toggle on cards (FIX 7) — 30 mins
STEP 14: Chat full page (FIX 8) — 1 hour
STEP 15: Add Research Hub + Competitor Watch to share page (FIX 9)
STEP 16: Real-time notifications (FIX 10) — 2 hours
STEP 17: Fix discoverable button (FIX 11) — 20 mins
STEP 18: Settings UX + toast alerts (FIX 12) — 45 mins
STEP 19: Contact form + Resend email (FIX 13) — 30 mins
STEP 20: Full UX polish pass (Section 4) — 2 hours

Total estimated time: ~14 hours

After every step: test the specific feature before moving on.
Do not batch multiple steps and test at the end.

VERIFICATION CHECKLIST (run before competition):
[ ] Submit test idea → all 8 stages return correct specific data
[ ] MVP features have real names (not N/A)
[ ] Competitors are real companies in correct industry
[ ] TAM is niche-specific not entire industry
[ ] Quota error shows retry message not raw error
[ ] Navbar shows user name when logged in
[ ] GTM page shows "Next" not "Finish Analysis"
[ ] All 4 bonus tool pages load and work
[ ] Analysis data persists after logout and re-login
[ ] PostgreSQL connected and all tables migrated
[ ] Contact form sends branded email to company address
[ ] Public ideas appear in /ideas/explore page
[ ] Chat opens as full page
[ ] Real-time notifications fire on new messages
[ ] Settings saves with toast not browser alert
[ ] Final report shows animated score counter