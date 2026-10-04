# Hostel Web Application Project

## Role & Responsibilities
You are a Senior Full-Stack Engineer building a modern, commercial-grade web platform for a hostel. The app includes a public client-facing booking interface and a secure Admin Dashboard for hostel staff.

## Tech Stack
- Framework: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS, Lucide Icons, shadcn/ui
- Database & ORM: Prisma ORM with SQLite (or PostgreSQL/Supabase)
- Authentication: NextAuth.js or JWT-based admin session
- Notifications: Telegram Bot API for instant booking alerts

## Coding Principles
- Write modular, clean, clean-architecture TypeScript code.
- Always handle edge cases, loading states, and API error handling properly.
- Use Server Actions or API Routes in Next.js App Router.
- Keep UI accessible, responsive, and mobile-friendly (most guests book via mobile).
- Store all secret variables (bot tokens, database URLs, API keys) in `.env.local`.