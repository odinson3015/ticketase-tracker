# Tracker — ReachOut / Ticketase team tool

A daily task tracker + business pipeline for a small team: assign tasks, move
them across To Do / In Progress / Done, log leads and partnerships, and see
completion rate and overdue tasks at a glance.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **PostgreSQL**
- **NextAuth** (email/password, credentials-based)
- **Tailwind CSS**
- **Recharts** for the analytics charts

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — any Postgres connection string. For a quick free one, create
  a database at [neon.com](https://neon.com) or [supabase.com](https://supabase.com)
  and paste its connection string here. (You'll switch this to Vercel Postgres
  once you deploy — see below.)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the result.
- `TEAM_INVITE_CODE` — pick any phrase. Anyone registering an account must
  enter this, so only share it with your team.

Then:

```bash
npm run db:push     # creates the tables from prisma/schema.prisma
npm run db:seed      # adds a default "General" project
npm run dev           # starts the app at http://localhost:3000
```

Open `http://localhost:3000`, click **Create an account**, enter the invite
code, and you're in. Repeat for each teammate (or create their accounts for
them and share the passwords).

## 2. Deploy to Vercel

1. **Push this project to GitHub** (a new, private repo is fine).
2. **Import it on [vercel.com](https://vercel.com)** — "Add New Project" →
   select the repo. Leave the build settings as default (Vercel auto-detects
   Next.js).
3. **Add a database.** In your new Vercel project, go to the **Storage** tab →
   **Create Database** → **Postgres**. Vercel provisions it and automatically
   adds connection env vars to your project.
4. **Set environment variables** (Project → Settings → Environment Variables):
   - `DATABASE_URL` — copy the value Vercel's Postgres integration added as
     `POSTGRES_PRISMA_URL` (it's pooled and formatted for Prisma).
   - `NEXTAUTH_SECRET` — same random value as local, or generate a new one.
   - `NEXTAUTH_URL` — your production URL, e.g. `https://your-project.vercel.app`.
   - `TEAM_INVITE_CODE` — your team's invite phrase.
5. **Push the schema to the production database.** Easiest way: temporarily
   put the production `DATABASE_URL` in your local `.env` and run
   `npm run db:push` from your machine. (Or use Vercel's CLI: `vercel env pull`
   to pull the values locally first.)
6. **Redeploy** (Vercel usually does this automatically after you add env
   vars — if not, trigger a redeploy from the Deployments tab).
7. Visit your live URL, register your team's accounts with the invite code,
   and start adding tasks.

## Customizing

- **Colors / fonts:** `tailwind.config.ts` and `src/app/layout.tsx` (font
  imports).
- **Invite code:** change `TEAM_INVITE_CODE` any time in Vercel's env vars —
  it only affects new registrations.
- **Adding fields:** edit `prisma/schema.prisma`, then run
  `npm run db:push` again (locally against whichever database you're
  pointed at) to apply the change.

## Notes

- Everyone who registers can see and edit all tasks and businesses — there's
  no per-role permission system yet. For a 2–10 person team this keeps things
  simple; it's a natural next thing to add if the team grows.
- The database's connection string from Vercel Postgres is pooled, which is
  what you want for a serverless app like this (avoids "too many
  connections" errors under load).
