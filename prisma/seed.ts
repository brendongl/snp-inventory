import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_USERS = [
  { email: 'brendonganle@gmail.com', fullName: 'Brendon Ganle', role: 'ADMIN' as const },
  { email: 'nguyenphuocthostudy@gmail.com', fullName: 'Nguyen Phuoc Tho', role: 'ADMIN' as const },
  { email: 'hieunguyen3141592@gmail.com', fullName: 'Hieu Nguyen', role: 'STAFF' as const },
  { email: 'bush9999gold@gmail.com', fullName: 'Bush', role: 'STAFF' as const },
  { email: 'hoangphongvt2211@gmail.com', fullName: 'Hoang Phong', role: 'STAFF' as const },
  { email: 'macaronie.mac@gmail.com', fullName: 'Macaronie Mac', role: 'STAFF' as const },
  { email: 'hyle03112004@gmail.com', fullName: 'Hyle', role: 'STAFF' as const },
  { email: 'sonlomo3.0@gmail.com', fullName: 'Son Lomo', role: 'STAFF' as const },
  { email: 'hoangquangphilong@gmail.com', fullName: 'Hoang Quang Phi Long', role: 'STAFF' as const },
  { email: 'freddyvu14@gmail.com', fullName: 'Freddy Vu', role: 'STAFF' as const },
  { email: 'nguyenphong1111vt@gmail.com', fullName: 'Nguyen Phong', role: 'STAFF' as const },
  { email: 'aalis.anan99@gmail.com', fullName: 'Aalis Anan', role: 'STAFF' as const },
]

const INITIAL_CATEGORIES = [
  { name: 'Beverages', color: '#60A5FA' },
  { name: 'Snacks', color: '#34D399' },
  { name: 'Food', color: '#FBBF24' },
  { name: 'Bar Stock', color: '#A78BFA' },
  { name: 'Cleaning Supplies', color: '#FB923C' },
  { name: 'Sauces', color: '#F87171' },
  { name: 'Liquor/Alcohol', color: '#FCA5A5' },
  { name: 'Other', color: '#9CA3AF' },
]

const INITIAL_STORAGE_LOCATIONS = [
  'Alcohol',
  'Snack',
  'Bar',
  'Kitchen Storage',
  'Kitchen Shelf',
  'FFood, G2',
  'G2, Topping',
  'Wine',
  'Pack',
]

const INITIAL_SETTINGS = [
  {
    key: 'discord_webhook_url',
    value: process.env.DISCORD_WEBHOOK_URL || '',
    description: 'Discord webhook URL for alerts',
  },
  {
    key: 'expiry_warning_1_month',
    value: 'true',
    description: 'Enable 1-month expiry warnings',
  },
  {
    key: 'expiry_warning_1_week',
    value: 'true',
    description: 'Enable 1-week expiry warnings',
  },
  {
    key: 'alert_cooldown_hours',
    value: '24',
    description: 'Hours between automatic low stock alerts',
  },
  {
    key: 'log_retention_days',
    value: '30',
    description: 'Number of days to retain transaction logs',
  },
]

async function main() {
  console.log('🌱 Starting database seed...\n')

  // 1. Create initial users
  console.log('👥 Creating users...')
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        passwordHash: null, // Will be set on first login
        isActive: true,
      },
    })
  }
  console.log(`✅ Created ${INITIAL_USERS.length} users\n`)

  // 2. Create categories
  console.log('🏷️ Creating categories...')
  for (const category of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
  console.log(`✅ Created ${INITIAL_CATEGORIES.length} categories\n`)

  // 3. Create storage locations
  console.log('📍 Creating storage locations...')
  for (const location of INITIAL_STORAGE_LOCATIONS) {
    await prisma.storageLocation.upsert({
      where: { name: location },
      update: {},
      create: { name: location },
    })
  }
  console.log(`✅ Created ${INITIAL_STORAGE_LOCATIONS.length} storage locations\n`)

  // 4. Create system settings
  console.log('⚙️ Creating system settings...')
  for (const setting of INITIAL_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log(`✅ Created ${INITIAL_SETTINGS.length} system settings\n`)

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
