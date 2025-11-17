# Sip N Play Inventory Management System

A modern, mobile-first inventory management system built for Sip N Play cafe, featuring real-time stock tracking, smart low-stock alerts, expiry date management, and Discord integrations.

## 🚀 Features

### Core Features (MVP)
- ✅ **Mobile-First Design** - Optimized for handheld devices with large touch targets
- ✅ **Real-time Stock Management** - Sub-200ms stock updates with optimistic UI
- ✅ **Batch Tracking** - FIFO system for items with expiry dates
- ✅ **Smart Low Stock Alerts** - Vendor-specific minimum order criteria
- ✅ **Discord Notifications** - Automated alerts for low stock and expiring items
- ✅ **User Management** - Admin and staff roles with secure authentication
- ✅ **Transaction Logging** - 30-day rolling audit trail
- ✅ **Analytics Dashboard** - Stock movement, expiry overview, usage statistics
- ✅ **Dark Mode** - Built-in dark mode support

### Future Enhancements
- 🔮 AI-powered brooch pin recognition
- 🔮 n8n + Zalo automated ordering
- 🔮 snp-site integration for critical item alerts
- 🔮 Barcode scanning
- 🔮 Advanced forecasting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Deployment**: Railway / Docker (self-hosted)
- **Integrations**: Discord Webhooks, Airtable

## 📋 Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15+
- npm or pnpm
- Git

## 🏃 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/brendongl/snp-inventory.git
cd snp-inventory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `DISCORD_WEBHOOK_URL` - Discord webhook for alerts
- `NEXT_PUBLIC_APP_URL` - Your app URL

### 4. Run database migrations

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up -d
```

### Build Docker image manually

```bash
docker build -t snp-inventory .
docker run -p 3000:3000 --env-file .env snp-inventory
```

## 🚂 Railway Deployment

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database
3. Connect your GitHub repository
4. Add environment variables from `.env.example`
5. Deploy!

Railway will automatically:
- Install dependencies
- Run Prisma migrations
- Build the Next.js app
- Start the production server

## 📊 Database Schema

The system uses PostgreSQL with the following key tables:

- **users** - Staff and admin accounts
- **items** - Inventory items with all metadata
- **item_batches** - Batch tracking for items with expiry dates
- **transactions** - Stock in/out audit log
- **suppliers** - Vendor information with min order criteria
- **categories** & **storage_locations** - Organization
- **low_stock_alerts** - Alert history and tracking
- **system_settings** - App configuration

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for complete schema documentation.

## 👥 User Management

### Default Users

The system is seeded with 12 users (2 admins, 10 staff). On first login, users will be prompted to create a password.

**Admins:**
- brendonganle@gmail.com
- nguyenphuocthostudy@gmail.com

### First Login Flow

1. User enters email
2. System checks if `passwordHash` is NULL
3. If NULL, prompt to create password
4. Hash password and save
5. Issue JWT token and redirect to dashboard

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

## 📱 Mobile UX

The app is built with mobile-first principles:

- **Touch Targets**: Minimum 48x48px
- **Thumb Zones**: Primary actions in bottom 1/3
- **Bottom Navigation**: Easy one-handed navigation
- **Pull-to-Refresh**: Native mobile pattern
- **Optimistic UI**: Instant visual feedback

## 🎨 Design System

- **Colors**: HSL-based theme with CSS custom properties
- **Dark Mode**: Built-in with system preference detection
- **Typography**: Inter font family
- **Components**: shadcn/ui component library
- **Layout**: Mobile-first responsive grid

## 🔒 Security

- **Authentication**: JWT tokens with httpOnly cookies
- **Password Hashing**: bcrypt with salt rounds
- **Environment Variables**: Sensitive data in `.env` (not committed)
- **CORS**: Configured for production domain
- **SQL Injection**: Prevented by Prisma parameterized queries

## 📈 Performance

Target metrics:
- **Stock Updates**: < 150ms
- **Page Loads**: < 200ms
- **Image Optimization**: WebP/AVIF with sharp
- **Bundle Size**: Optimized with Next.js code splitting

## 🔄 Data Migration

Import from Airtable:

```bash
# TODO: Create migration script
npm run migrate:airtable
```

## 📝 Contributing

This is a private project for Sip N Play. For questions or issues, contact Brendon.

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Deployed on [Railway](https://railway.app/)

---

**Version**: 1.0.0
**Last Updated**: November 17, 2025
**Development Partner**: Claude Code by Anthropic
