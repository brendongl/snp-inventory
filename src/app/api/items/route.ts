import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { itemSchema } from '@/lib/validations'

// GET /api/items - List items with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const supplierId = searchParams.get('supplierId')
    const locationId = searchParams.get('locationId')
    const hasExpiry = searchParams.get('hasExpiry')
    const isCritical = searchParams.get('isCritical')
    const lowStock = searchParams.get('lowStock') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Search filter (brand or displayName)
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { baseName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Supplier filter
    if (supplierId) {
      where.supplierId = supplierId
    }

    // Location filter
    if (locationId) {
      where.storageLocationId = locationId
    }

    // Has expiry filter
    if (hasExpiry !== null && hasExpiry !== undefined) {
      where.hasExpiry = hasExpiry === 'true'
    }

    // Is critical filter
    if (isCritical !== null && isCritical !== undefined) {
      where.isCritical = isCritical === 'true'
    }

    // Low stock filter
    if (lowStock) {
      where.currentStock = { lte: prisma.item.fields.reorderQty }
    }

    // Get total count
    const total = await prisma.item.count({ where })

    // Get items
    const items = await prisma.item.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
        storageLocation: { select: { id: true, name: true, description: true } },
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: 'asc' },
          select: {
            id: true,
            batchCode: true,
            quantity: true,
            expiryDate: true,
          },
        },
      },
      orderBy: [
        { isCritical: 'desc' },
        { displayName: 'asc' },
      ],
    })

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = itemSchema.parse(body)

    // Generate display name
    const displayName = [
      data.brand,
      data.baseName,
      data.size,
      data.qtyWeight,
    ]
      .filter(Boolean)
      .join(' ')

    const item = await prisma.item.create({
      data: {
        ...data,
        displayName,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
        storageLocation: { select: { id: true, name: true, description: true } },
      },
    })

    // Log the creation
    await prisma.transaction.create({
      data: {
        itemId: item.id,
        userId: user.id,
        transactionType: 'STOCK_IN',
        amount: 0,
        stockAfter: 0,
        notes: 'Item created',
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
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
