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
  TEAM_INVITE_CODE, and for email: RESEND_API_KEY, EMAIL_FROM, APP_URL.
  NEXTAUTH_URL is intentionally not set (Vercel infers it).
- Share the permanent production domain (from Vercel > Domains), not per-deployment URLs.

## Features
- Register (requires TEAM_INVITE_CODE) and login. Signing in lands on /dashboard.
- Dashboard (/dashboard): stat row, team progress bars per member (plus an
  "Unassigned" row), the signed-in user's open tasks by due date, and tasks due in
  the next 7 days. All computed server-side with Prisma.
- Board (/board): Board/Table view toggle (choice saved in localStorage). Kanban
  columns To Do / In Progress / Done; tasks have title, description, assignee,
  priority (Low/Medium/High), due date, linked project/event, linked business, and a
  notes/comments thread. Filter by project, or use the sidebar Projects list
  (/board?project=<id>). Clicking a task opens a right-hand side panel.
- Businesses (/businesses): pipeline table with stages Prospecting / Contacted /
  Negotiating / Won / Lost, contact info, deal value in BDT, owner, notes, linked project.
- Analytics (/analytics): total tasks, completion rate, overdue count, due this week,
  tasks by status, open tasks per person, list of overdue tasks.
- Settings (/settings): account details and an "Email me notifications" switch.
- Dark mode: sun/moon toggle at the bottom of the sidebar.

## Email notifications
- All sending lives in src/lib/email.ts, using the official `resend` package.
- Two notifications, both triggered from src/app/actions/tasks.ts:
  1. Task assigned — on createTask (when an assignee is set) and on updateTask
     (only when assigneeId actually changed). Emails the new assignee with who
     assigned it, title, description, project, priority, due date, and a button
     to the board.
  2. Task completed — on updateTaskStatus when status moves to DONE from something
     else. Emails the task's creator with who completed it, title, and a board link.
- Nobody is ever emailed about their own action (assignee === actor, or
  creator === actor short-circuits before sending).
- Recipients come from User.email; User.emailNotifications (Boolean, default true)
  opts a person out. Changed via src/app/actions/settings.ts.
- Env: RESEND_API_KEY, EMAIL_FROM (e.g. "Ticketase Tracker <tracker@notify.ticketase.com>",
  must be a domain verified in Resend), APP_URL (live site, used for email links;
  falls back to VERCEL_URL). With RESEND_API_KEY missing, emails are simply off.
- Sending never breaks a save: every exported function catches its own errors and
  just console.errors. Keep it that way when adding new notifications.

## Code layout
- prisma/schema.prisma: User, Project, Task, Comment, Business models
- prisma/seed.ts: creates a default "General" project (idempotent)
- src/app/actions/: server actions (auth, tasks, businesses, projects, settings)
- src/app/(dashboard)/: dashboard, board, businesses, analytics, settings pages
  (auth-protected via middleware; all force-dynamic)
- src/components/: Sidebar, TaskBoard, TaskCard, TaskTable, TaskPanel, SidePanel,
  BusinessTable, BusinessPanel, AnalyticsCharts, ThemeProvider, ThemeToggle,
  EmailNotificationToggle, icons
- src/lib/: prisma client, NextAuth config, label/tag maps, email

## Design
Notion-inspired: calm, minimal, content-first. Left sidebar (collapses behind a menu
button under md), white/near-white surfaces, 1px borders instead of shadows, 4px radius,
generous whitespace, soft grey hover states. Inter via next/font throughout. Indigo
(#3B3FA1) only as a small accent: active links, primary buttons, progress bars.
Status/priority/stage render as soft tinted pill tags.

Colours are CSS variables defined once in src/app/globals.css for light and again
under `.dark`, mapped to Tailwind names in tailwind.config.ts (bg, surface, subtle,
hover, chip, line, ink/-muted/-faint, primary/-hover/-fg/-ink/-light, accent, success,
danger). So `bg-surface`, `text-ink` etc. work in both themes with no `dark:` variants.
Add new colours as variables in both blocks rather than hardcoding hex.

Dark mode is Tailwind class-based (`darkMode: "class"`). An inline script in the root
layout (themeInitScript in ThemeProvider.tsx) sets the `dark` class before first paint.
Anything that differs between themes must be driven by CSS, not React state, or it
causes a hydration mismatch.

## Known limitations / possible next steps
- No roles or permissions: every signed-in user can see and edit everything.
- Status changes use arrow buttons, not drag and drop.
- No way to rename/delete projects from the UI yet ("+" in the sidebar creates them).
- No email on comments/notes, due-date reminders, or business pipeline changes.
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
