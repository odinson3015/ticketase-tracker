# Project context: Tracker (ReachOut Bangladesh / Ticketase)

## What this is
A team task tracker + business pipeline for a small team (2-10 people) at ReachOut
Bangladesh working on the Ticketase event ticketing platform. Used to assign daily
tasks, track progress, log potential business partners/leads, and view basic analytics.

## Owner
Fardine Ehsan (GitHub: odinson3015). Business Development Intern, not a developer.
He works on Windows with PowerShell. Explain steps simply and one at a time, give exact
commands to copy, and say what success looks like after each step.

## Stack
- Next.js 15 (App Router) + TypeScript, React 18
- Prisma 6 + PostgreSQL (Prisma Postgres, connected through Vercel)
- NextAuth v4, email/password (credentials provider, JWT sessions)
- Tailwind CSS 3, Recharts 2, date-fns

## Deployment
- Hosted on Vercel, auto-deploys on every push to `main` on GitHub
  (repo: odinson3015/ticketase-tracker).
- The build script runs `prisma generate && prisma db push --skip-generate &&
  tsx prisma/seed.ts && next build`, so schema changes are applied to the live
  database automatically on deploy. No local database or .env is needed.
- Vercel env vars: DATABASE_URL (from Prisma Postgres integration), NEXTAUTH_SECRET,
  TEAM_INVITE_CODE. NEXTAUTH_URL is intentionally not set (Vercel infers it).
- Share the permanent production domain (from Vercel > Domains), not per-deployment URLs.

## Features
- Register (requires TEAM_INVITE_CODE) and login.
- Board (/board): kanban columns To Do / In Progress / Done; tasks have title,
  description, assignee, priority (Low/Medium/High), due date, linked project/event,
  linked business, and a notes/comments thread. "+ New project" button creates projects
  (e.g. "HCD 2026"). Filter by project.
- Businesses (/businesses): pipeline table with stages Prospecting / Contacted /
  Negotiating / Won / Lost, contact info, deal value in BDT, owner, notes, linked project.
- Analytics (/analytics): total tasks, completion rate, overdue count, due this week,
  tasks by status, open tasks per person, list of overdue tasks.

## Code layout
- prisma/schema.prisma: User, Project, Task, Comment, Business models
- prisma/seed.ts: creates a default "General" project (idempotent)
- src/app/actions/: server actions (auth, tasks, businesses, projects)
- src/app/(dashboard)/: board, businesses, analytics pages (auth-protected via middleware)
- src/components/: TaskBoard, TaskCard, TaskModal, BusinessTable, BusinessModal,
  AnalyticsCharts, Navbar
- src/lib/: prisma client, NextAuth config, label/color maps

## Design
Custom palette in tailwind.config.ts: warm off-white background (#FAF8F4), indigo
primary (#3B3FA1), amber accent (#E8963C). Fonts: Sora (headings), IBM Plex Sans (body).
Keep new UI consistent with these.

## Known limitations / possible next steps
- No roles or permissions: every signed-in user can see and edit everything.
- Status changes use arrow buttons, not drag and drop.
- No way to rename/delete projects from the UI yet.
- Destructive schema changes (dropping or renaming columns) will make `prisma db push`
  fail the build on purpose; handle those carefully rather than forcing data loss.

## History so far (from the original claude.ai chat, Sept 2026)
- Requirements chosen: tool for ReachOut/Ticketase work, small team, "build it for me"
  (owner guides requirements, Claude writes code). Tasks track assignee, due date,
  priority, status, linked project/event, notes thread, and potential businesses.
  Analytics priority: completion rate and overdue tasks.
- Chose the Vercel-only route (no local database). Code pushed to GitHub as
  odinson3015/ticketase-tracker; Vercel project created with Prisma Postgres
  (Singapore region), deploy succeeded, owner registered and reached the Task board.
- The team invite code is set in Vercel env vars (TEAM_INVITE_CODE); don't hardcode it.
- Vercel shows "Needs Attention" on the Prisma env vars (likely a nudge to mark them
  Sensitive); harmless.
- Local copy of the project lives at C:\Users\HP\Downloads\ticketase-tracker\ticketase-tracker.

## Workflow for changes
Make the change, run `npm run build` locally if possible to check it compiles, then
commit and `git push`. Vercel deploys automatically in about 2 minutes.
