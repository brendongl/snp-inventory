# Sip N Play Inventory Management System - Project Plan

**Version**: 1.0
**Date**: November 17, 2025
**Status**: Planning Complete - Ready for Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Requirements Summary](#requirements-summary)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [UI/UX Design](#uiux-design)
6. [Features Breakdown](#features-breakdown)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Cost Estimates](#cost-estimates)
9. [Data Migration Strategy](#data-migration-strategy)
10. [Getting Started](#getting-started)

---

## Project Overview

### Problem Statement
Moving from Google AppScript inventory system to a custom, modular solution that enables:
- Automated low stock alerts with smart batching per vendor
- Discord webhook notifications
- Integration with snp-site project and Vikunja task manager
- Future n8n + Zalo ordering automation
- Fast performance (100-200ms stock adjustments and page loads)

### Current System Issues
- Stock calculated from transaction logs (not scalable - 8,925 records over 6 months)
- No expiry date tracking
- No multi-batch support for items with different expiry dates
- Limited automation capabilities

### Success Criteria
- ✅ Stock adjustments within 100-200ms
- ✅ Real-time updates across users (no caching issues)
- ✅ Mobile-first UX for staff usage
- ✅ Smart vendor-based alerts (min order criteria)
- ✅ Expiry date tracking with FIFO batch management
- ✅ Data completion interface for staff
- ✅ Admin dashboard for settings
- ✅ Daily Airtable export via cron

---

## Requirements Summary

### User Management
- **Users**: 10-20 staff members
- **Roles**: Admin and Regular Staff
- **Authentication**: Email/password using snp-site PostgreSQL database

### Inventory Features

#### Item Fields (Enhanced)
- **Name Components**: Brand, Base Name, Size, Qty/Weight
- **Auto-generated Display Name**: `(Brand) (Name) (Size) (Qty/Weight)`
  - Example: "Skittles Sour Candy Mini 15g"
- **Core Fields**: Description, Supplier, Image, Category, Storage Location
- **Inventory**: Current Stock, Reorder Qty, Cost
- **Special Flags**: Has Expiry (boolean), Critical Item (boolean)

#### Expiry Date Batching
- **Only for items with `has_expiry = true`**
- Multiple batches per item with different expiry dates
- Batch tracking includes:
  - Batch ID (auto-generated)
  - Quantity in batch
  - Expiry date
  - Date received
- FIFO (First In, First Out) logic for stock removal
- Alerts at 1 month and 1 week before expiry

#### Smart Batching for Low Stock Alerts
Vendor-specific minimum order criteria:
- **Type 1 - Quantity**: Min total quantity (e.g., "24 cans")
- **Type 2 - Item Count**: Min number of items (e.g., "2 items")
- **Type 3 - Price**: Min order value (e.g., "2,000,000 VND")

Auto-send Discord alert when criteria met (no alert sent in last 24 hours)

### User Interface

#### Main Tabs (Bottom Navigation - Mobile First)
1. **Items** - Main inventory list with quick stock adjustment
2. **Low Stock** - Grouped by supplier with alert status
3. **Logs** - Transaction history (30-day rolling deletion)
4. **Settings** - Admin dashboard (admin only)

#### Key Interactions
- Tap [+]/[-] to adjust stock
- Pull-to-refresh for data updates
- Swipe gestures for quick actions
- Large touch targets (48x48px minimum)
- Bottom sheet modals for forms
- Number steppers for quantity input

### Performance Requirements
- Stock updates: < 150ms
- Page loads: < 200ms
- No WebSockets needed (regular HTTP sufficient)
- Optimistic UI updates for immediate feedback

---

## Technical Architecture

### Technology Stack (Simplified)

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Image Processing**: sharp (server-side)

**Backend**
- **Framework**: Fastify (faster than Express)
- **Language**: TypeScript
- **ORM**: Prisma (type-safe queries)
- **Validation**: Zod
- **Auth**: JWT + bcrypt

**Database**
- **Primary**: PostgreSQL 15+ (included in Railway Hobby plan)
- **Caching**: PostgreSQL query result caching (no Redis needed)

**Deployment**
- **Platform**: Railway (Hobby Plan - $5/month)
- **Services**:
  - Web service (Next.js + API)
  - PostgreSQL database
  - Volume storage (images)
- **Cron Jobs**: Railway Cron or node-cron

**External Integrations**
- Discord Webhooks (low stock + expiry alerts)
- Airtable API (daily export)
- Future: n8n workflows, Vikunja API

### Why Simplified Stack?

**No Redis Because:**
- Only ~100 items
- ~1,500-2,000 transactions/month
- PostgreSQL with proper indexing = sub-50ms queries
- Adds unnecessary complexity
- Saves ~$2-3/month

**Performance Strategy**
1. **Database Optimization**
   - Indexed foreign keys
   - Indexed frequently queried columns (item name, supplier, category)
   - Proper use of `SELECT` statements (only fetch needed fields)
   - Connection pooling via Prisma

2. **API Optimization**
   - Direct stock updates (not calculated from logs)
   - Background jobs for non-critical operations
   - Efficient queries with Prisma

3. **Frontend Optimization**
   - Server components for initial load
   - Optimistic UI updates
   - Image lazy loading
   - Route prefetching
   - Mobile-first bundle optimization

---

## Database Schema

### Entity Relationship Overview

```
users ──┐
        │
        ├──> items ──┐
        │            ├──> item_batches
        │            ├──> transactions
        │            └──> low_stock_alert_items
        │
        ├──> suppliers ──> low_stock_alerts
        ├──> categories
        └──> storage_locations
```

### Table Definitions

#### `users`
```sql
id                UUID PRIMARY KEY
email             VARCHAR(255) UNIQUE NOT NULL
password_hash     VARCHAR(255) NOT NULL
full_name         VARCHAR(255)
role              ENUM('admin', 'staff') NOT NULL
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

#### `suppliers`
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) NOT NULL
business_name     VARCHAR(255)
contact_name      VARCHAR(255)
phone             VARCHAR(50)
email             VARCHAR(255)
website           VARCHAR(255)
address           TEXT
notes             TEXT
supplier_type     ENUM('distributor', 'retailer', 'online', 'wholesale', 'producer', 'other')
is_active         BOOLEAN DEFAULT true
min_order_type    ENUM('quantity', 'items', 'price')
min_order_value   DECIMAL(10,2)
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Smart Batching Fields:**
- `min_order_type`: Type of minimum order (quantity/items/price)
- `min_order_value`: Threshold value (24 for "24 cans", 2 for "2 items", 2000000 for "2M VND")

#### `storage_locations`
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) UNIQUE NOT NULL
description       TEXT
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMP DEFAULT NOW()
```

**Examples**: "Alcohol", "Snack", "Bar", "Kitchen Storage", "FFood G2", "Wine"

#### `categories`
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) UNIQUE NOT NULL
color             VARCHAR(7)  -- Hex color for UI
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMP DEFAULT NOW()
```

**Examples**: "Beverages", "Snacks", "Food", "Bar Stock", "Cleaning Supplies", "Sauces", "Liquor/Alcohol"

#### `items`
```sql
id                  UUID PRIMARY KEY
brand               VARCHAR(255)
base_name           VARCHAR(255) NOT NULL
size                VARCHAR(100)
qty_weight          VARCHAR(100)
display_name        VARCHAR(500) GENERATED ALWAYS AS (
                      TRIM(CONCAT_WS(' ', brand, base_name, size, qty_weight))
                    ) STORED
description         TEXT
image_url           VARCHAR(500)
has_expiry          BOOLEAN DEFAULT false
is_critical         BOOLEAN DEFAULT false
is_complete         BOOLEAN DEFAULT true  -- For data migration
storage_location_id UUID REFERENCES storage_locations(id)
category_id         UUID REFERENCES categories(id)
supplier_id         UUID REFERENCES suppliers(id)
cost                DECIMAL(10,2)  -- In VND
reorder_qty         INTEGER NOT NULL DEFAULT 10
current_stock       INTEGER NOT NULL DEFAULT 0  -- DIRECT FIELD (not calculated!)
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
created_by          UUID REFERENCES users(id)
updated_by          UUID REFERENCES users(id)
completed_by        UUID REFERENCES users(id)  -- Who completed missing data
completed_at        TIMESTAMP
```

**Key Points:**
- `display_name` is auto-generated from components
- `current_stock` is a direct field (NOT calculated from transactions)
- Updated with each transaction for performance

#### `item_batches`
```sql
id                UUID PRIMARY KEY
item_id           UUID REFERENCES items(id) ON DELETE CASCADE
batch_code        VARCHAR(100) GENERATED  -- Auto: "ITEM-{date}"
quantity          INTEGER NOT NULL
expiry_date       DATE  -- Only if item.has_expiry = true
date_received     DATE NOT NULL
is_depleted       BOOLEAN DEFAULT false  -- Auto-set when quantity = 0
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Only created for items with `has_expiry = true`**

#### `transactions`
```sql
id                UUID PRIMARY KEY
item_id           UUID REFERENCES items(id)
batch_id          UUID REFERENCES item_batches(id)  -- NULL if no expiry
user_id           UUID REFERENCES users(id) NOT NULL
transaction_type  ENUM('stock_in', 'stock_out') NOT NULL
amount            INTEGER NOT NULL  -- Positive for in, negative for out
stock_after       INTEGER NOT NULL  -- Snapshot of current_stock after transaction
notes             TEXT
created_at        TIMESTAMP DEFAULT NOW()
```

**Important:**
- 30-day rolling deletion (cron job)
- `stock_after` is a snapshot for audit purposes
- `batch_id` only populated for items with expiry dates

#### `low_stock_alerts`
```sql
id                  UUID PRIMARY KEY
supplier_id         UUID REFERENCES suppliers(id)
alert_sent_at       TIMESTAMP DEFAULT NOW()
items_count         INTEGER
total_value         DECIMAL(10,2)  -- Total cost of order
is_resolved         BOOLEAN DEFAULT false
discord_message_id  VARCHAR(255)
created_at          TIMESTAMP DEFAULT NOW()
```

#### `low_stock_alert_items`
```sql
id                UUID PRIMARY KEY
alert_id          UUID REFERENCES low_stock_alerts(id) ON DELETE CASCADE
item_id           UUID REFERENCES items(id)
current_stock     INTEGER
reorder_qty       INTEGER
quantity_needed   INTEGER
```

#### `system_settings`
```sql
id              UUID PRIMARY KEY
key             VARCHAR(255) UNIQUE NOT NULL
value           TEXT
description     TEXT
updated_at      TIMESTAMP DEFAULT NOW()
updated_by      UUID REFERENCES users(id)
```

**Example Settings:**
- `discord_webhook_url`: Discord webhook URL for alerts
- `expiry_warning_1_month`: Boolean to enable 1-month expiry warnings
- `expiry_warning_1_week`: Boolean to enable 1-week expiry warnings
- `airtable_export_base_id`: Target Airtable base ID for daily export
- `alert_cooldown_hours`: Hours between auto-alerts (default: 24)

### Database Indexes

**Critical Indexes for Performance:**
```sql
-- Items
CREATE INDEX idx_items_supplier ON items(supplier_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_location ON items(storage_location_id);
CREATE INDEX idx_items_display_name ON items(display_name);
CREATE INDEX idx_items_low_stock ON items(current_stock) WHERE current_stock <= reorder_qty;

-- Transactions
CREATE INDEX idx_transactions_item ON transactions(item_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Batches
CREATE INDEX idx_batches_item ON item_batches(item_id);
CREATE INDEX idx_batches_expiry ON item_batches(expiry_date) WHERE NOT is_depleted;
```

---

## UI/UX Design

### Design Principles

**Mobile-First Approach:**
- 100% optimized for mobile (primary use case)
- Minimum touch target: 48x48px
- Thumb-zone optimization (primary actions in bottom 1/3)
- Large, readable text (minimum 16px)
- High contrast for outdoor visibility
- Pull-to-refresh pattern
- Bottom navigation for easy reach

**Visual Design:**
- Flat, minimal design (no shadows, gradients, glass effects)
- Clean typography hierarchy
- Generous white space
- Fast, responsive interactions
- Accessibility compliant (WCAG 2.1 AA)

### Screen Layouts

#### 1. Bottom Navigation
```
┌─────────────────────────────────┐
│        CONTENT AREA             │
├─────────────────────────────────┤
│  📦      🔻     📊      ⚙️      │
│ Items   Low    Logs  Settings   │
└─────────────────────────────────┘
```

#### 2. Items Tab (Main Screen)
- Search bar at top
- Grid/list of items with:
  - Item image (thumbnail)
  - Display name
  - Current stock (with low stock warning)
  - Storage location
  - Quick [+]/[-] buttons
- Pull-to-refresh
- Infinite scroll or pagination

**Quick Stock Adjustment:**
- Tap [+] or [-] opens bottom sheet modal
- Large number stepper
- Manual input option
- For items with expiry: batch selection dropdown
- Confirm button (large, bottom)

#### 3. Low Stock Tab
- Grouped by supplier
- Shows supplier min order criteria
- Status badge: ✅ Ready to order / ⏳ Not yet
- List of low stock items under each supplier
- Manual "Send Alert" button per supplier
- Shows last alert sent time

#### 4. Logs Tab
- Filter by date range, item, user, type
- Transaction cards showing:
  - Item name
  - Amount (+/- number)
  - Stock after transaction
  - User who made change
  - Timestamp
- Color coding: Green for stock_in, Red for stock_out
- Search functionality

#### 5. Settings Tab (Admin Only)
- 🏢 Manage Suppliers
- 📍 Manage Storage Locations
- 🏷️ Manage Categories
- 📊 Analytics
- 🔔 Alert Settings
- 👥 User Management
- 📤 Export to Airtable
- 🔐 Account Settings

**Analytics Sub-screen:**
- Stock not moved in X days
- Items expiring soon (color-coded: red < 7 days, yellow < 30 days)
- Most/least used items
- Stock value by category
- Critical items status

#### 6. Item Management (Admin)
- List of all items
- [+ Add New Item] button (prominent)
- Search and filter
- Each item shows edit/delete actions

**Add/Edit Item Form:**
- Brand (text input)
- Base Name (text input)
- Size (text input)
- Qty/Weight (text input)
- **Preview Display Name** (auto-generated, read-only)
- Description (textarea, optional)
- Image upload (camera or gallery, auto-optimized)
- Category (dropdown)
- Supplier (dropdown)
- Storage Location (dropdown)
- Cost in VND (number input)
- Reorder Qty (number input)
- Has Expiry Date (checkbox)
- Critical Item (checkbox)
- Save/Cancel buttons

#### 7. Data Completion Interface

**One-by-one Workflow:**
- Progress indicator (e.g., "23/98 items completed")
- Current item from Airtable shown
- Pre-filled fields where data exists
- Highlight missing required fields
- [Skip] and [Save & Next] buttons
- Track who completed each item

**Table View (Optional):**
- List of incomplete items
- Show what's missing per item
- Tap to edit
- Batch completion tracking

---

## Features Breakdown

### 1. Authentication & User Management

**Login Flow:**
- Email/password login
- JWT token stored in httpOnly cookie
- Token refresh mechanism
- Session expiry (24 hours)

**User Roles:**
- **Admin**: Full access to all features
- **Staff**: Can adjust stock, view logs, view low stock (no settings access)

**Integration with snp-site:**
- Share same PostgreSQL users table
- Same authentication mechanism
- Single sign-on (same credentials work on both systems)

### 2. Inventory Management

**Stock Adjustment Flow:**
1. User taps [+] or [-] on item
2. Modal opens with:
   - Current stock displayed
   - Radio: Add Stock / Remove Stock
   - Amount stepper or manual input
   - If `has_expiry = true`: Batch selector
3. User confirms
4. **Optimistic UI**: Stock updates immediately in UI
5. **Background**:
   - Transaction created
   - `current_stock` updated
   - If batch: batch quantity updated
   - Redis cache updated (if using)
6. If error: Rollback UI, show error toast

**Search & Filter:**
- Search by display name
- Filter by category, supplier, storage location
- Filter low stock only
- Filter critical items only
- Sort by name, stock level, last updated

### 3. Expiry Date & Batch Management

**Creating a Batch:**
- Only available when `item.has_expiry = true`
- When adding stock to item with expiry:
  - Option: "Add to existing batch" or "Create new batch"
  - If new: Prompt for expiry date
  - Auto-generate batch code: `{item_id}-{date_received}`

**FIFO Logic:**
- When removing stock, system suggests batch with closest expiry date
- User can override and select different batch
- When batch `quantity = 0`, mark `is_depleted = true`

**Expiry Alerts (Cron Job - Daily at 8 AM):**
```typescript
// Pseudo-code
function checkExpiryAlerts() {
  const today = new Date();

  // 1 week warning
  const batchesExpiring7Days = getBatchesExpiringBetween(today, addDays(today, 7));
  if (batchesExpiring7Days.length > 0) {
    sendDiscordAlert(batchesExpiring7Days, '⚠️ Expiring in 1 week');
  }

  // 1 month warning
  const batchesExpiring30Days = getBatchesExpiringBetween(addDays(today, 7), addDays(today, 30));
  if (batchesExpiring30Days.length > 0) {
    sendDiscordAlert(batchesExpiring30Days, '🔔 Expiring in 1 month');
  }
}
```

### 4. Smart Low Stock Alerts

**Detection Logic (Runs on every stock update):**
```typescript
function checkLowStockAlerts() {
  // Get all suppliers with low stock items
  const suppliersWithLowStock = getSuppliersWithLowStockItems();

  for (const supplier of suppliersWithLowStock) {
    const lowStockItems = getLowStockItemsForSupplier(supplier.id);

    // Check if min order criteria met
    let criteriaMet = false;
    let currentValue = 0;

    switch (supplier.min_order_type) {
      case 'quantity':
        currentValue = sum(lowStockItems.map(item => item.reorder_qty - item.current_stock));
        criteriaMet = currentValue >= supplier.min_order_value;
        break;

      case 'items':
        currentValue = lowStockItems.length;
        criteriaMet = currentValue >= supplier.min_order_value;
        break;

      case 'price':
        currentValue = sum(lowStockItems.map(item => {
          const qtyNeeded = item.reorder_qty - item.current_stock;
          return item.cost * qtyNeeded;
        }));
        criteriaMet = currentValue >= supplier.min_order_value;
        break;
    }

    // Auto-send if criteria met and no alert in last 24 hours
    if (criteriaMet && !hasRecentAlert(supplier.id, 24)) {
      sendDiscordAlert(supplier, lowStockItems, currentValue);
      logAlert(supplier.id, lowStockItems);
    }
  }
}
```

**Discord Webhook Format:**
```json
{
  "embeds": [{
    "title": "🔔 Low Stock Alert - Shopee",
    "description": "5 items ready to order",
    "color": 15844367,
    "fields": [
      {
        "name": "Order Criteria",
        "value": "✅ Min 10 items (Currently: 5 items low)",
        "inline": false
      },
      {
        "name": "Items Needed",
        "value": "• Skittles Sour Mini 15g - Need 7 (Stock: 3/10)\n• Haribo Goldbears 80g - Need 13 (Stock: 2/15)\n• Heinz BBQ Sauce 623g - Need 4 (Stock: 1/5)",
        "inline": false
      },
      {
        "name": "Estimated Cost",
        "value": "235,000 VND",
        "inline": true
      },
      {
        "name": "Critical Items",
        "value": "⚠️ 2 critical items included",
        "inline": true
      }
    ],
    "footer": {
      "text": "Sip N Play Inventory • " + new Date().toLocaleString()
    }
  }]
}
```

### 5. Analytics Dashboard

**Stock Movement Analysis:**
- Items not moved in X days (configurable, default 30)
- Shows: Item name, last transaction date, current stock
- Action: Mark for review or discount

**Expiry Overview:**
- All items with upcoming expiry dates
- Color-coded by urgency:
  - 🔴 Red: < 7 days
  - 🟡 Yellow: 7-30 days
  - 🟢 Green: > 30 days

**Usage Statistics:**
- Most used items (by transaction count)
- Least used items
- Stock value by category
- Critical items status report

**Stock Value:**
- Total inventory value (sum of `current_stock * cost`)
- Value by category
- Value by supplier

### 6. Transaction Logging

**Log Entry:**
- Item name
- Amount (+/- number)
- Stock before → Stock after
- User who made change
- Timestamp
- Batch info (if applicable)

**30-Day Rolling Deletion (Cron Job - Daily at Midnight):**
```typescript
function deleteOldTransactions() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  await prisma.transaction.deleteMany({
    where: {
      created_at: {
        lt: thirtyDaysAgo
      }
    }
  });
}
```

### 7. Data Migration & Completion

**Import from Airtable:**
1. Fetch all items, suppliers, transactions from Airtable MCP
2. Transform data to new schema
3. Mark items with missing data as `is_complete = false`
4. Import into PostgreSQL

**Data Completion Interface:**
- Shows incomplete items
- One-by-one workflow with progress
- Pre-fills existing data
- Highlights missing required fields
- Tracks who completed each item
- Option to skip items

**Validation:**
- Required fields: `base_name`, `supplier_id`, `reorder_qty`
- Optional fields can be NULL
- Mark `is_complete = true` when all required fields filled

### 8. Daily Airtable Export

**Cron Job (Daily at 11:59 PM):**
```typescript
async function exportToAirtable() {
  // Create new Airtable base or update existing
  const items = await prisma.item.findMany({
    include: {
      supplier: true,
      category: true,
      storage_location: true,
    }
  });

  for (const item of items) {
    await airtable.create_or_update_record({
      baseId: process.env.AIRTABLE_EXPORT_BASE_ID,
      tableId: 'Items',
      fields: {
        'Display Name': item.display_name,
        'Brand': item.brand,
        'Base Name': item.base_name,
        'Size': item.size,
        'Qty/Weight': item.qty_weight,
        'Current Stock': item.current_stock,
        'Supplier': item.supplier.name,
        'Category': item.category.name,
        'Storage Location': item.storage_location.name,
        'Cost': item.cost,
        'Reorder Qty': item.reorder_qty,
        'Has Expiry': item.has_expiry,
        'Is Critical': item.is_critical,
        'Last Updated': item.updated_at.toISOString(),
      }
    });
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation Setup (Week 1-2)
**Deliverables:**
- [ ] Railway project setup (PostgreSQL)
- [ ] Next.js 14 project initialized with TypeScript
- [ ] Fastify API setup with Prisma ORM
- [ ] Database schema implemented and migrated
- [ ] Tailwind CSS + shadcn/ui configured
- [ ] Authentication system (JWT + bcrypt)
- [ ] Basic mobile-responsive layout structure

**Key Files:**
- `prisma/schema.prisma` - Database schema
- `src/app/api/` - API routes (Next.js App Router)
- `src/lib/auth.ts` - Authentication utilities
- `src/components/ui/` - shadcn components

### Phase 2: Core Inventory Features (Week 3-4)
**Deliverables:**
- [ ] Item CRUD operations
- [ ] Stock adjustment interface (mobile-optimized)
- [ ] Image upload with optimization (sharp)
- [ ] Search and filter functionality
- [ ] Transaction logging
- [ ] Optimistic UI updates
- [ ] Error handling and validation

**Key Components:**
- `ItemsList.tsx` - Main items display
- `StockAdjustmentModal.tsx` - Stock +/- interface
- `ItemForm.tsx` - Add/edit item form
- `ImageUpload.tsx` - Optimized image upload

### Phase 3: User & Admin Features (Week 5)
**Deliverables:**
- [ ] User management (CRUD)
- [ ] Role-based access control
- [ ] Supplier management
- [ ] Storage location management
- [ ] Category management
- [ ] Admin settings dashboard

**Key Components:**
- `AdminDashboard.tsx`
- `UserManagement.tsx`
- `SupplierForm.tsx`
- `SettingsPanel.tsx`

### Phase 4: Expiry & Batch Tracking (Week 6)
**Deliverables:**
- [ ] Batch creation for items with expiry
- [ ] Batch selection in stock adjustment
- [ ] FIFO logic implementation
- [ ] Expiry alerts (cron job)
- [ ] Batch management interface

**Key Components:**
- `BatchSelector.tsx`
- `BatchManagement.tsx`
- `ExpiryAlerts.tsx` (cron job)

### Phase 5: Smart Low Stock Alerts (Week 7)
**Deliverables:**
- [ ] Low stock detection logic
- [ ] Smart batching per supplier
- [ ] Discord webhook integration
- [ ] Alert history tracking
- [ ] Manual alert trigger
- [ ] Low Stock tab UI

**Key Components:**
- `LowStockTab.tsx`
- `AlertService.ts`
- `DiscordWebhook.ts`
- `checkLowStockAlerts` (cron job)

### Phase 6: Logs & Analytics (Week 8)
**Deliverables:**
- [ ] Transaction logs UI
- [ ] 30-day rolling deletion (cron job)
- [ ] Analytics dashboard
- [ ] Stock movement analysis
- [ ] Expiry overview
- [ ] Usage statistics
- [ ] Stock value calculations

**Key Components:**
- `TransactionLogs.tsx`
- `Analytics.tsx`
- `StockMovementReport.tsx`
- `deleteOldTransactions` (cron job)

### Phase 7: Data Migration (Week 9)
**Deliverables:**
- [ ] Airtable import script
- [ ] Data transformation logic
- [ ] Data completion interface (one-by-one)
- [ ] Table view (optional)
- [ ] Validation and error handling
- [ ] Staff onboarding guide

**Key Scripts:**
- `scripts/import-from-airtable.ts`
- `DataCompletionWorkflow.tsx`
- `DataCompletionTable.tsx`

### Phase 8: Integration & Deployment (Week 10)
**Deliverables:**
- [ ] Daily Airtable export (cron job)
- [ ] All cron jobs configured (Railway Cron)
- [ ] Performance optimization
- [ ] Mobile UX testing
- [ ] Bug fixes and polish
- [ ] Documentation
- [ ] Production deployment to Railway

**Final Testing:**
- [ ] End-to-end testing
- [ ] Mobile device testing (iOS + Android)
- [ ] Performance benchmarks
- [ ] Security audit
- [ ] User acceptance testing

### Future Enhancements (Post-MVP)
- [ ] Brooch pin AI photo recognition
- [ ] n8n Zalo ordering integration
- [ ] snp-site critical item alerts on clock-in
- [ ] Advanced forecasting
- [ ] Barcode scanning
- [ ] Bulk stock adjustments
- [ ] Export reports (PDF/Excel)

---

## Cost Estimates

### Railway Hobby Plan: $5/month base

**Estimated Usage (Inventory System):**
- **Memory**: ~$2.00-3.00 (smaller than snp-site)
- **CPU**: ~$0.05 (light usage)
- **Egress**: ~$0.15-0.25 (images + API calls)
- **Volume**: ~$0.20-0.30 (optimized images + database)
- **PostgreSQL**: Included ✅
- **Total**: ~$2.50-3.50/month

**Based on Scale:**
- ~100 items
- ~1,500-2,000 transactions/month
- 10-20 concurrent users
- ~10MB image storage (optimized)

**Comparison to snp-site:**
- snp-site: ~$8/month
- snp-inventory: ~$3/month (smaller scale)
- **Combined**: ~$11/month (well within Hobby plan limits)

---

## Data Migration Strategy

### Current Airtable Data

**Items Table**: ~100 items
- Some have Brand/Size/Qty/Weight filled
- Many missing data (Description, Cost, Reorder Qty, etc.)
- All have 0 current stock (starting fresh)

**Suppliers Table**: 19 suppliers
- Complete supplier info available

**Transactions Table**: Only 1 transaction
- Not migrating transaction history
- Starting fresh

### Migration Steps

**Step 1: Export Data**
```typescript
// Use Airtable MCP to fetch all data
const items = await airtable.list_records(baseId, 'Items', { maxRecords: 500 });
const suppliers = await airtable.list_records(baseId, 'Suppliers', { maxRecords: 100 });
```

**Step 2: Transform & Import**
```typescript
// Transform Airtable data to new schema
function transformItem(airtableItem) {
  const hasAllRequiredData = !!(
    airtableItem.Brand &&
    airtableItem.Size &&
    airtableItem['Qty/Weight'] &&
    airtableItem.Cost &&
    airtableItem['Reorder Qty']
  );

  return {
    brand: airtableItem.Brand || null,
    base_name: airtableItem.Name,
    size: airtableItem.Size || null,
    qty_weight: airtableItem['Qty/Weight'] || null,
    description: airtableItem.Description || null,
    has_expiry: airtableItem['Has Expiry?'] || false,
    is_critical: false, // User sets later
    is_complete: hasAllRequiredData,
    cost: airtableItem.Cost || null,
    reorder_qty: airtableItem['Reorder Qty'] || 10,
    current_stock: 0, // Start fresh
    // Map supplier, category, location by name
  };
}
```

**Step 3: Data Completion**
- Filter items where `is_complete = false`
- Present in data completion interface
- Staff fills missing data
- Mark `is_complete = true`, track `completed_by` and `completed_at`

**Step 4: Verification**
- Validate all required fields filled
- Check for duplicates
- Verify supplier/category/location relationships

### Daily Export Back to Airtable

**Purpose**: Backup and integration with other systems

**Schedule**: Daily at 11:59 PM (Railway Cron)

**Target**: New Airtable base "Sip N Play Inventory Export"

**Data Exported:**
- All items with current stock
- Suppliers
- Categories
- Storage locations
- Summary statistics

---

## Getting Started

### Prerequisites Needed

1. **Railway Account**
   - Existing account with Hobby plan
   - Access to create new project

2. **Credentials & Integrations**
   - snp-site PostgreSQL connection string
   - Discord webhook URL for alerts
   - Airtable API token (already have via MCP)
   - Target Airtable base ID for export

3. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   DISCORD_WEBHOOK_URL=...
   AIRTABLE_API_TOKEN=...
   AIRTABLE_EXPORT_BASE_ID=...
   NEXT_PUBLIC_APP_URL=...
   ```

4. **Design Decisions**
   - Color scheme preference
   - Logo/branding assets (if any)
   - Any specific UI preferences

### Next Steps

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup guide.

---

## Questions & Support

**Project Manager**: Brendon
**Development Partner**: Claude Code
**Documentation Date**: November 17, 2025

For questions or changes to requirements, update this document and relevant schema/code files.

---

**End of Project Plan**
