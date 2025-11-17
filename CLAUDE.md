# Instructions for Claude Code

## Autonomous Development Mode

**IMPORTANT**: Continue building this project autonomously through ALL phases that can be completed without user interaction. Do NOT stop between phases unless user input is required.

## What to Build (In Order)

### ✅ Phase 1: Foundation (COMPLETED)
- Next.js, Prisma, Database, Docker, Git setup

### 🔄 Phase 2: Authentication & UI (IN PROGRESS)
Build these autonomously:
- **2A**: Authentication system (login, password setup, JWT, middleware)
- **2B**: Install shadcn/ui components
- **2C**: Main layout with bottom navigation, dark mode toggle

### 🔄 Phase 3: Core Inventory Features
Build these autonomously:
- Items list page with search/filter
- Stock adjustment modal (+ / - buttons)
- Item CRUD operations (add, edit, delete)
- Image upload with optimization
- API routes for all operations

### 🔄 Phase 4: Advanced Features
Build these autonomously:
- Batch tracking for expiry dates
- Low stock detection logic
- Low stock alerts page
- Transaction logs page with filters
- Discord webhook integration

### 🔄 Phase 5: Admin & Analytics
Build these autonomously:
- Admin dashboard
- Supplier management
- Category/Storage location management
- Analytics screens (stock movement, expiry overview, usage stats)
- System settings page

### 🔄 Phase 6: Data Migration
Build these autonomously:
- Airtable import script
- Data completion interface (one-by-one workflow)
- Data validation and cleanup

### ⏸️ STOP HERE - Phase 7: Testing & Deployment (Requires User)
These require user interaction:
- Mobile device testing
- User acceptance testing
- Production deployment
- Performance benchmarking
- Bug fixes based on user feedback

## Key Principles

1. **Mobile-First**: Every component must be optimized for mobile
2. **Dark Mode**: All components must support dark mode
3. **Performance**: Target <150ms for stock updates, <200ms for page loads
4. **Type Safety**: Use TypeScript strictly, no `any` types
5. **Error Handling**: Comprehensive error handling on all API routes
6. **Optimistic UI**: Update UI immediately, rollback on error
7. **Accessibility**: WCAG 2.1 AA compliance, 48x48px touch targets

## Technical Stack Reference

- **Frontend**: Next.js 14 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: Zustand for global state
- **Forms**: React Hook Form + Zod validation
- **Database**: Prisma + PostgreSQL
- **Auth**: JWT tokens, bcrypt hashing
- **Images**: sharp for optimization

## File Structure Conventions

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login)
│   │   └── login/
│   ├── (dashboard)/      # Protected pages
│   │   ├── items/
│   │   ├── low-stock/
│   │   ├── logs/
│   │   └── settings/
│   └── api/              # API routes
│       └── auth/
├── components/
│   ├── ui/               # shadcn components
│   ├── items/            # Item-specific components
│   ├── layout/           # Layout components (nav, header)
│   └── shared/           # Shared components
├── lib/
│   ├── auth.ts           # Auth utilities
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
├── types/                # TypeScript types
└── stores/               # Zustand stores
```

## Component Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Components**: PascalCase (e.g., `ItemCard.tsx`, `StockAdjustmentModal.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`, `generateDisplayName.ts`)
- **API Routes**: `route.ts` (Next.js convention)

## API Route Structure

All API routes should follow this pattern:

```typescript
// src/app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Validation schema
const itemSchema = z.object({
  brand: z.string().optional(),
  baseName: z.string().min(1),
  // ... other fields
})

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    // 3. Query database
    const items = await prisma.item.findMany({
      where: search ? {
        displayName: { contains: search, mode: 'insensitive' }
      } : undefined,
      include: {
        category: true,
        supplier: true,
        storageLocation: true,
      },
      orderBy: { displayName: 'asc' }
    })

    // 4. Return response
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only check
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = itemSchema.parse(body)

    // Generate display name
    const displayName = [
      validatedData.brand,
      validatedData.baseName,
      validatedData.size,
      validatedData.qtyWeight
    ].filter(Boolean).join(' ')

    const item = await prisma.item.create({
      data: {
        ...validatedData,
        displayName,
        createdBy: user.id,
        updatedBy: user.id,
      },
      include: {
        category: true,
        supplier: true,
        storageLocation: true,
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
```

## Discord Webhook Format

```typescript
interface DiscordEmbed {
  title: string
  description: string
  color: number // Decimal color (e.g., 15844367 for orange)
  fields: {
    name: string
    value: string
    inline?: boolean
  }[]
  footer?: {
    text: string
  }
  timestamp?: string
}

async function sendDiscordAlert(embed: DiscordEmbed) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  })
}
```

## Database Helpers

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Testing After Each Phase

After completing each phase:
1. **Run `npm run dev`** to test locally
2. **Test API routes** using browser or curl
3. **Check for TypeScript errors**: `npm run lint`
4. **Look for applicable skills** in the skills list that could improve the code
5. **Apply skills** that don't require human intervention
6. **Document any issues** in comments or NEXT_STEPS.md

## Progress Tracking

Update NEXT_STEPS.md with progress after each major milestone.

## When to Stop

STOP and ask for user input when:
- Deployment to Railway (needs user to configure)
- Testing on actual mobile devices
- User acceptance testing
- Any design decisions (colors, layouts, UX flows)
- Bug fixes that require user reproduction
- Performance issues that need user environment

## Current Status

Last completed: Phase 1 - Foundation Setup
Next task: Phase 2A - Authentication System

Continue building autonomously until Phase 7!
