# Technology Stack

Overview of the technologies used in Content Playground and the rationale behind each choice.

---

## Frontend

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Next.js** (App Router) | React framework | Server-side rendering, API routes, built-in optimization |
| **TypeScript** | Type safety | Catch errors early, better IDE support, maintainability |
| **Tailwind CSS v4** | Styling | Utility-first, responsive design, minimal CSS |
| **Radix UI** | Component primitives | Accessible, unstyled, composable foundations |
| **shadcn/ui** | Component library | Built on Radix, pre-styled, copy-paste components |

### Why This Stack?

- **Next.js**: Industry standard for React apps, excellent DX, built-in performance optimizations
- **TypeScript**: Reduces bugs, improves code quality, essential for team collaboration
- **Tailwind CSS**: Fast development, consistent design system, small bundle size
- **Radix UI + shadcn/ui**: Accessible by default, highly composable, easy to customize

---

## Backend & Database

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Supabase** | Database & Auth | PostgreSQL-based, built-in auth, RLS, real-time |
| **PostgreSQL** | Relational database | Powerful, reliable, excellent for structured data |
| **Row-Level Security (RLS)** | Authorization | Enforce access control at database level |
| **Direct SQL** | Query language | No ORM overhead, full control, better performance |

### Why This Stack?

- **Supabase**: Open-source Firebase alternative, PostgreSQL reliability, excellent DX
- **PostgreSQL**: Industry standard, powerful features, excellent for editorial workflows
- **RLS**: Secure by default, enforces access control at source
- **Direct SQL**: Simpler than ORM, easier to optimize, better for complex queries

---

## AI Orchestration

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Letta Cloud** | AI agent orchestration | Memory management, tool integration, conversation context |
| **Custom Tools** | Database integration | Direct Supabase access, audit logging, RLS enforcement |

### Why This Stack?

- **Letta**: Specialized for agentic AI, manages conversation memory, integrates with external tools
- **Custom Tools**: Full control over AI-database interaction, ensures RLS compliance, enables audit trails

---

## Monorepo & Build

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Turborepo** | Monorepo orchestration | Fast builds, caching, task parallelization |
| **pnpm** | Package manager | Efficient disk usage, faster installs, monorepo support |
| **ESLint** | Code linting | Catch errors, enforce style, improve code quality |
| **Prettier** | Code formatting | Consistent formatting, no debates |

### Why This Stack?

- **Turborepo**: Optimized for monorepos, excellent caching, fast CI/CD
- **pnpm**: More efficient than npm/yarn, better monorepo support
- **ESLint + Prettier**: Industry standard, excellent tooling, team alignment

---

## Authentication

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Supabase Auth** | User authentication | Built-in email/password, OAuth, JWT tokens |
| **JWT Tokens** | Session management | Stateless, scalable, industry standard |
| **HTTP-only Cookies** | Token storage | Secure, prevents XSS attacks |

### Why This Stack?

- **Supabase Auth**: Integrated with database, handles email verification, OAuth ready
- **JWT**: Stateless, works well with distributed systems
- **HTTP-only Cookies**: Best practice for token security

---

## Development Tools

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Git** | Version control | Industry standard, excellent collaboration |
| **GitHub** | Repository hosting | Excellent integration with Vercel, CI/CD ready |
| **Vercel** | Frontend deployment | Optimized for Next.js, excellent DX, auto-scaling |
| **Docker** | Local development | Consistent environments, easy Supabase setup |

### Why This Stack?

- **Git + GitHub**: Standard workflow, excellent tooling
- **Vercel**: Purpose-built for Next.js, zero-config deployment
- **Docker**: Eliminates "works on my machine" issues

---

## Folder Structure

```
/apps/frontend              # Next.js application
├── src/
│   ├── app/               # App router pages & layouts
│   ├── components/        # Feature components
│   ├── lib/               # Utilities & helpers
│   └── middleware.ts      # Auth middleware
├── public/                # Static assets
└── next.config.ts         # Next.js config

/packages/ui               # Design system (@refugies/ui)
├── src/
│   ├── primitives/        # Button, Input, Card, etc.
│   ├── forms/             # Form components
│   ├── feedback/          # Alert, Toast, etc.
│   ├── layout/            # Container, Grid, etc.
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # Global CSS
│   └── themes/            # Theme definitions
└── package.json

/packages/shared           # Shared types & utilities
├── src/
│   ├── types/             # TypeScript types
│   ├── constants/         # Constants
│   └── utils/             # Shared utilities
└── package.json

/documentation             # Project documentation
├── guides/                # How-to guides
├── architecture/          # System design
├── api/                   # API reference
├── workflows/             # Feature workflows
├── troubleshooting/       # Common issues
├── reference/             # Quick references
└── roadmaps/              # Project roadmaps

/specs                     # Feature specifications
├── 001-editorial-workflow/
├── 002-turborepo-scaffolding/
└── 003-supabase-auth/

/migrations                # Database migrations
└── *.sql                  # Migration files

/supabase                  # Supabase configuration
├── config.toml            # Local dev config
└── seed.sql               # Seed data
```

---

## Key Architectural Decisions

### 1. Monorepo (Turborepo + pnpm)

**Decision**: Use Turborepo for monorepo management

**Rationale**:
- Single source of truth for shared code
- Efficient builds with caching
- Easy to share types between frontend and backend
- Scales as project grows

### 2. Design System First

**Decision**: Centralize UI components in `/packages/ui`

**Rationale**:
- Consistency across applications
- Reusable components reduce duplication
- Single source of truth for styling
- Easy to maintain and update

### 3. Direct SQL (No ORM)

**Decision**: Use raw SQL queries instead of ORM

**Rationale**:
- Full control over queries
- Better performance for complex queries
- Easier to optimize
- Simpler for RLS policies

### 4. Row-Level Security

**Decision**: Enforce authorization at database level

**Rationale**:
- Secure by default
- Works across all applications
- Prevents accidental data leaks
- Audit trail built-in

### 5. Letta for AI Orchestration

**Decision**: Use Letta Cloud for AI agent management

**Rationale**:
- Specialized for agentic AI
- Manages conversation memory
- Integrates with custom tools
- Handles complex workflows

---

## Performance Considerations

### Frontend

- **Code Splitting**: Next.js automatically splits code by route
- **Image Optimization**: Next.js Image component optimizes images
- **CSS**: Tailwind purges unused CSS in production
- **Caching**: Vercel CDN caches static assets

### Database

- **Indexes**: Add indexes on frequently queried columns
- **RLS Policies**: Optimize policies to reduce query overhead
- **Connection Pooling**: Supabase handles connection pooling
- **Query Optimization**: Monitor slow queries in logs

### AI

- **Caching**: Cache AI responses when possible
- **Batching**: Process multiple items in single agent call
- **Rate Limiting**: Implement rate limiting for API calls

---

## Security Considerations

### Frontend

- **HTTPS**: All traffic encrypted
- **CSP**: Content Security Policy headers
- **XSS Protection**: React escapes content by default
- **CSRF**: Token-based protection

### Backend

- **RLS**: Database-level access control
- **JWT**: Secure token-based authentication
- **CORS**: Restrict cross-origin requests
- **Rate Limiting**: Prevent abuse

### Database

- **Encryption**: Data encrypted at rest and in transit
- **Backups**: Automatic daily backups
- **Audit Logging**: Track all changes
- **Access Control**: RLS policies enforce access

---

## Scalability

### Horizontal Scaling

- **Frontend**: Vercel handles auto-scaling
- **Database**: Supabase scales vertically, can upgrade plan
- **AI**: Letta Cloud handles scaling

### Vertical Scaling

- Upgrade Supabase plan for more resources
- Upgrade Vercel plan for more compute
- Optimize queries and code

---

## Cost Optimization

- **Supabase**: Free tier for development, pay-as-you-go for production
- **Vercel**: Free tier for hobby projects, pro plan for production
- **Letta**: Pay-as-you-go based on API calls
- **pnpm**: Reduces disk usage and install time

---

## Future Considerations

### Potential Additions

- **Caching Layer**: Redis for session/data caching
- **Search**: Elasticsearch or Meilisearch for full-text search
- **Analytics**: PostHog or Mixpanel for user analytics
- **Monitoring**: Sentry for error tracking
- **Testing**: Playwright for E2E tests, Vitest for unit tests

### Migration Path

- Current stack is flexible and can accommodate additions
- No vendor lock-in (PostgreSQL, React, Node.js are standard)
- Can migrate components independently

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Letta Documentation](https://docs.letta.com)
