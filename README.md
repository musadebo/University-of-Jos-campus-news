# University of Jos — Campus Events

A premium futuristic campus platform for discovering events, news, announcements, registrations, notifications, attendance, and event management at the University of Jos.

## Development

You need Node.js — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/musadebo/University-of-Jos-campus-news.git
cd University-of-Jos-campus-news
npm i
npm run dev
```

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [Supabase](https://supabase.com) — auth, database, storage, realtime
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [GSAP + Lenis](https://gsap.com) — scroll animations
- [React Hook Form + Zod](https://react-hook-form.com) — forms & validation

## Features

- Browse, search, and filter campus events
- Register and cancel event registrations (capacity enforced)
- Campus news and announcements
- Real-time notifications via Supabase Realtime
- Attendance tracking and check-in
- Student dashboard
- Organizer dashboard — create, manage, and publish events
- Admin panel — users, content, events
- Google Sign-In and email/password authentication
- Row Level Security on all tables

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
