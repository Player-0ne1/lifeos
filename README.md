# THE SYSTEM · LifeOS

> Sovereign Polymath Protocol — single-user personal accountability OS

Built with Next.js 16 · Notion · Claude API · Vercel

---

## Overview

A production web application that enforces personal excellence through daily quest completion, financial penalties, and stat-based character progression. All data lives in Notion. Claude generates daily directives. Vercel deploys it.

**One player. Seven stats. ₹5,000 per week on the line.**

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.6 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | Notion (12 databases via @notionhq/client v5) |
| AI | Anthropic Claude claude-opus-4-7 (prompt caching) |
| Deploy | Vercel |
| Fonts | Newsreader + JetBrains Mono |

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd lifeos
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Notion
NOTION_TOKEN=secret_...

# Notion Database IDs (from your Notion workspace URLs)
NOTION_DB_PLAYER_PROFILE=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_CHARACTER_SHEET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_QUEST_LOG=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_QUEST_LIBRARY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_STAT_HISTORY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_CHECKIN_LOG=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_WEEKLY_LEDGER=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PENALTY_LOG=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PASSIVE_LIBRARY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ARC_TRACKER=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_SKILL_REGISTRY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_FINANCIAL_LOG=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to find Notion database IDs:** Open the database in Notion → Share → Copy link. The ID is the 32-character hex string in the URL, before the `?v=` parameter.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/directive`.

First visit with no data will show the 8-step onboarding flow.

---

## Notion Database Schema

Your 12 Notion databases need these properties:

### Player Profile
| Property | Type |
|----------|------|
| Name | Title |
| Level | Number |
| Total XP | Number |
| XP to Next | Number |
| Day | Number |
| Streak | Number |
| Best Streak | Number |

### Character Sheet (one row per stat)
| Property | Type |
|----------|------|
| Stat | Title (CRAFT/BUILDER/CAPITAL/BODY/MIND/SIGNAL/ART) |
| Score | Number |
| Last Active | Date |
| Decay Days | Number |

### Quest Log
| Property | Type |
|----------|------|
| Title | Title |
| Stat | Select |
| XP | Number |
| Points | Number |
| Difficulty | Select (Easy/Medium/Hard) |
| Status | Select (open/complete/failed/abandoned) |
| Day Assigned | Number |
| Proof Type | Select |
| Proof Standard | Rich Text |
| Proof Text | Rich Text |
| Proof URL | URL |
| Is Arc | Checkbox |
| Arc Name | Rich Text |
| Is Bonus | Checkbox |
| Deadline | Date |
| Brief | Rich Text |

### Quest Library (templates)
| Property | Type |
|----------|------|
| Title | Title |
| Stat | Select |
| XP Value | Number |
| Difficulty | Select |
| Proof Standard | Rich Text |
| Brief | Rich Text |
| Time Estimate | Rich Text |
| Energy Level | Select (Low/Medium/High) |

### Stat History Log
| Property | Type |
|----------|------|
| Stat | Title |
| Score | Number |
| Date | Date |
| Delta | Number |
| Reason | Rich Text |

### Daily Check-in Log
| Property | Type |
|----------|------|
| Date | Title |
| Energy | Number (1-5) |
| Constraints | Rich Text |
| Mind Note | Rich Text |
| Directive Text | Rich Text |
| Quest IDs | Rich Text |
| Close Energy | Number |
| Day Note | Rich Text |
| Status | Select (pending/active/complete/failed) |

### Weekly Ledger
| Property | Type |
|----------|------|
| Week Num | Title |
| Week Range | Rich Text |
| Quests Completed | Number |
| Quests Total | Number |
| Completion Pct | Number |
| Penalty Amount | Number |
| XP Earned | Number |
| Status | Select (open/closed) |

### Penalty Log
| Property | Type |
|----------|------|
| Week Num | Title |
| Amount | Number |
| Reason | Rich Text |
| Paid Date | Date |
| UPI Ref | Rich Text |
| Is Paid | Checkbox |

### Passive Library
| Property | Type |
|----------|------|
| Title | Title |
| Stat | Select |
| Completion Count | Number |
| Status | Select (active/building/broken) |
| Streak Days | Number |
| Lapsed Days | Number |
| Daily XP | Number |

### Arc Quest Tracker
| Property | Type |
|----------|------|
| Title | Title |
| Stat | Select |
| Phase | Select |
| Target Date | Date |
| Completed Quests | Number |
| Total Quests | Number |
| Weekly Updates | Rich Text |
| Status | Select (active/complete/paused) |
| Pace | Select (on-track/behind/ahead) |
| Budget | Number |
| Budget Spent | Number |

### Skill Registry
| Property | Type |
|----------|------|
| Name | Title |
| Stat | Select |
| Tier | Number (1-4) |
| Score Threshold | Number |
| Status | Select (locked/active/unlocked) |
| Description | Rich Text |
| Deliverable | Rich Text |

### Financial Log
| Property | Type |
|----------|------|
| Date | Title |
| Type | Select (income/expense) |
| Amount | Number |
| Category | Select |
| Note | Rich Text |

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/lifeos.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: Next.js (auto-detected)
4. Add all environment variables from `.env.local`
5. Deploy

### 3. Enable Vercel Password Protection (optional)

Settings → Security → Password Protection. Single-user app — no auth system needed.

---

## Architecture

```
app/
  (app)/              ← Authenticated shell (AppChrome layout)
    directive/        ← Daily directive + quest management
    character/        ← Stats, skills, passives, Three Pillars
      [stat]/         ← Per-stat detail + history
    quests/           ← Quest log, arc tracker, library
    ledger/           ← Weekly ledger, penalties, financial log
    settings/         ← Theme, voice, density, config display
  onboarding/         ← 8-step setup flow
  api/
    directive/        ← POST: streams Claude directive
    proof/            ← POST: Claude proof scoring

lib/
  notion/             ← 12 database query files + types
  claude/             ← Directive generation, proof scoring, skill deliverables
  theme.ts            ← 3 themes, 3 voice modes, 2 density modes
  utils.ts            ← IST timezone, penalty calc, formatting

components/
  providers/          ← AppProvider (theme, voice, density, overlay, dayState)
  nav/                ← AppChrome, sidebar, tab bar
  primitives/         ← Design system components
  flows/              ← MorningFlow, EveningFlow, ProofFlow, SundayRitual
  directive/          ← DirectiveTabClient
  character/          ← CharacterTabClient, StatDetailClient
  quests/             ← Quest screen clients
  ledger/             ← Ledger screen clients

actions/              ← Server Actions for all mutations
```

---

## Day State Machine

```
onboarding
  → pre-checkin       (no check-in for today)
  → [MorningFlow]
  → mid-day           (check-in submitted, quests active)
  → [ProofFlow]       (per quest)
  → evening           (all quests resolved or 22:00 IST)
  → [EveningFlow]
  → all-complete / failed
```

---

## Claude API Usage

| Call | Model | ~Tokens | Caching |
|------|-------|---------|---------|
| Directive generation | claude-opus-4-7 | ~800 + cache | System + quest library cached |
| Proof scoring | claude-opus-4-7 | ~300 | None |
| Skill deliverables | claude-opus-4-7 | ~500 | None |

---

## Seven Stats

| Stat | Domain |
|------|--------|
| CRAFT | Writing, content, creative output |
| BUILDER | Engineering, shipping, systems |
| CAPITAL | Finance, income, investment |
| BODY | Health, fitness, sleep |
| MIND | Learning, reading, cognition |
| SIGNAL | Network, brand, influence |
| ART | Aesthetics, taste, expression |

Scores 0–100. Decay after 7 days of inactivity.

---

## Enforcement

- **Clean week** (≥ 90% completion): ₹0
- **Half penalty** (75–89%): ₹2,500
- **Full penalty** (< 75%): ₹5,000
- Recipient: Dad · Referee: Mom · Enforcement: 22:00 IST daily
- Penalty transferred via UPI, confirmed by referee checkbox in Sunday Ritual

---

*Single-user. No analytics. No telemetry. All data in your Notion.*
