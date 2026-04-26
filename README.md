# Support Tickets Dashboard

A full-stack helpdesk application built as a portfolio project, demonstrating modern Next.js patterns and production-ready architecture.

## Live Demo

> _Deploy instructions below_

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Agent | agent1@example.com | agent123 |
| Customer | customer1@example.com | customer123 |

## Features

- **Authentication** — Email/password login with Auth.js v5 and JWT sessions
- **Role-based access control** — Customer, Agent, Admin roles with middleware protection
- **Ticket management** — Create, view, filter, sort, search and paginate tickets
- **Ticket actions** — Status changes, priority updates, agent assignment (with audit trail)
- **Comments** — Public replies and internal notes (agents only)
- **Activity log** — Full audit trail for every ticket change
- **Dashboard** — KPI stats, priority breakdown, recent tickets
- **Admin panel** — User management with role assignment
- **Loading states** — Suspense-based skeleton screens throughout
- **Empty states** — Contextual empty states for all data views
- **Responsive design** — Works on mobile, tablet and desktop

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js v5 |
| Validation | Zod |
| Forms | React Hook Form |
| Testing | Vitest + React Testing Library |
| E2E Testing | Playwright |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login/register pages
│   └── (dashboard)/        # Protected application pages
├── server/
│   ├── repositories/       # Database access layer (Prisma)
│   ├── services/           # Business logic layer
│   └── actions/            # Next.js Server Actions
├── features/               # Feature-based UI components
├── components/             # Shared UI primitives
├── lib/
│   ├── auth/               # Auth.js config and helpers
│   └── validations/        # Zod schemas (shared client/server)
└── types/                  # TypeScript type definitions
```

**Key architectural decisions:**
- **Repository → Service → Server Component** pattern for clear separation of concerns
- **URL as source of truth** for all filter, search and pagination state
- **Server Components by default**, Client Components only for interactivity
- **Suspense streaming** with skeleton loading states for every async boundary
- **Defense in depth** — middleware + layout-level auth checks
- **Zod schemas shared** between client-side form validation and server-side action validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/support-tickets-dashboard.git
cd support-tickets-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Setup

Edit `.env`:

```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tickets_dev?schema=public"
```

### Database Setup

```bash
# Option A: Docker
docker run --name tickets-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tickets_dev \
  -p 5432:5432 -d postgres:16

# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

## Testing

```bash
# Unit and component tests
npm run test:run

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires dev server running)
npm run test:e2e

# E2E interactive UI
npm run test:e2e:ui
```

## Data Model

```
User ──── Ticket (createdBy)
User ──── Ticket (assignedTo)
Ticket ── Comment
Ticket ── ActivityLog
Ticket ── Category
```

**Enums:**
- `UserRole`: CUSTOMER | AGENT | ADMIN
- `TicketStatus`: OPEN | IN_PROGRESS | WAITING_FOR_CUSTOMER | RESOLVED | CLOSED
- `TicketPriority`: LOW | MEDIUM | HIGH | URGENT
- `CommentVisibility`: PUBLIC | INTERNAL

## Deployment

### Vercel + Neon (recommended)

1. Create a [Neon](https://neon.tech) PostgreSQL database
2. Import repository to [Vercel](https://vercel.com)
3. Set environment variables:
   - `DATABASE_URL` — from Neon dashboard
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `AUTH_URL` — your Vercel deployment URL
4. Deploy — Vercel runs `prisma migrate deploy` automatically if you add it to build command:

```json
// package.json
"build": "prisma migrate deploy && next build"
```

5. After first deploy, seed production data:
```bash
npx prisma db seed
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run unit tests (watch) |
| `npm run test:run` | Run unit tests once |
| `npm run test:e2e` | Run Playwright e2e tests |

## License

MIT