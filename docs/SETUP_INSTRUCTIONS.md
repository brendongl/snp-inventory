# Setup Instructions - What I Need From You

This document lists everything I need from you to start building the Sip N Play Inventory Management System.

---

## ✅ Checklist: Information Needed

### 1. Railway Access

**What I need:**
- [ ] Confirmation you've created a new Railway project for "snp-inventory"
- [ ] Railway project name/ID (if you want me to reference it)

**What to do:**
1. Log into Railway: https://railway.app
2. Click "New Project"
3. Name it "snp-inventory" (or similar)
4. Create a PostgreSQL database in the project
5. Come back and confirm it's ready

---

### 2. Database Credentials

**What I need:**

**Option A**: Share snp-site PostgreSQL connection string for user authentication
- [ ] `DATABASE_URL` from snp-site (if we're sharing the users table)

**Option B**: Use separate database for snp-inventory
- [ ] Confirmation you want separate database
- [ ] I'll set up new tables entirely

**Recommended**: Start with separate database for now, integrate later

---

### 3. Discord Webhook

**What I need:**
- [ ] Discord webhook URL for low stock alerts
- [ ] Discord webhook URL for expiry alerts (or same one)

**How to get it:**
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Name it "Inventory Alerts" (or similar)
5. Choose channel for alerts
6. Copy webhook URL
7. Paste here or in `.env` file later

**Example URL:**
```
https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

### 4. Airtable Integration

**What I need:**
- [ ] Target Airtable base ID for daily export (or create new one?)
- [ ] Confirmation current MCP Airtable token has write access

**Options:**
- **Option A**: Create new Airtable base for exports (recommended)
- **Option B**: Export to existing "Sip n Play Inventory" base
- **Option C**: Skip Airtable export for now (build later)

**Recommended**: Option A - create new base "Sip N Play Inventory Export" for clean separation

---

### 5. Design Preferences

**What I need:**

#### Color Scheme
- [ ] Do you have brand colors? If yes, provide hex codes
- [ ] Or should I suggest options and you choose?

**Options I can suggest:**
1. **Professional Blue/Grey** (like modern SaaS)
2. **Warm Earth Tones** (brown/orange - cafe vibes)
3. **Fresh Green/Blue** (energetic, clean)
4. **Dark Mode** (black/grey with accent colors)
5. **Your custom choice**

**Let me know:** "Suggest options" or "Use [specific colors]"

#### Logo/Branding
- [ ] Do you have a logo for Sip N Play?
- [ ] If yes, where can I access it?
- [ ] Or should I use text-only branding?

---

### 6. Environment Setup Decisions

**What I need:**

- [ ] **Node.js version** you want to use (recommend: 20.x LTS)
- [ ] **Package manager** preference: npm, yarn, or pnpm? (recommend: pnpm)
- [ ] **Port** for local development (default: 3000 - ok?)

---

### 7. Optional: Existing Code

**What I need:**
- [ ] Are there any existing code/designs from snp-site I should reference?
- [ ] If yes, where is the snp-site project located?
- [ ] Should I look at it for UI consistency?

---

## 📋 Quick Start Checklist (Minimum to Begin)

If you want me to **start immediately** with sensible defaults, I only need:

### Bare Minimum:
1. ✅ Confirmation to proceed with **separate database** (I'll set it up)
2. ✅ **Discord webhook URL** (for testing alerts)
3. ✅ Design preference: **"Suggest color options"** or **"Use these colors: [...]"**

### I'll assume:
- Node.js 20.x LTS
- pnpm package manager
- Port 3000 for local dev
- Separate PostgreSQL database (not shared with snp-site yet)
- Create new Airtable base later for exports
- Text-only branding (no logo needed yet)

---

## 🚀 What Happens Next

Once you provide the information above:

### Phase 1: Project Setup (I'll do this)
1. Initialize Next.js 14 project with TypeScript
2. Set up Fastify API structure
3. Configure Prisma with PostgreSQL
4. Implement database schema
5. Set up Tailwind + shadcn/ui
6. Create authentication system
7. Build basic layout structure

### Phase 2: You'll Test
1. I'll push code to GitHub (or provide locally)
2. You'll deploy to Railway
3. We'll test together
4. Iterate based on feedback

---

## 📝 Template: Environment Variables

Once we start, you'll need to create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secret (I'll generate)
JWT_SECRET="random-secret-key-here"

# Discord
DISCORD_WEBHOOK_LOW_STOCK="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_EXPIRY="https://discord.com/api/webhooks/..."

# Airtable (optional for now)
AIRTABLE_API_TOKEN="patXXXXXXXXXXXXXX"
AIRTABLE_EXPORT_BASE_ID="appXXXXXXXXXXXXX"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

---

## 🎯 Decision Time

**Choose your path:**

### Path A: Start Now (Minimum Info)
Provide:
1. Discord webhook URL
2. Design preference ("suggest options" is fine)
3. Say "Start with defaults"

I'll begin immediately with sensible defaults.

### Path B: Full Setup (Complete Info)
Provide all items in the checklist above for a fully configured start.

### Path C: Staged Approach
Start with Phase 1 (core features), integrate external services later.

---

## ❓ Questions?

Reply with:
- Answers to the checklist items
- "Start with defaults" if you want me to begin ASAP
- Any questions about the plan

I'm ready when you are! 🚀

---

**Next Document**: Once you provide info, I'll create [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) with detailed technical implementation notes.
