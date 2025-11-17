import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { itemSchema } from '@/lib/validations'

// GET /api/items/[id] - Get a single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
        storageLocation: { select: { id: true, name: true, description: true } },
        batches: {
          orderBy: { expiryDate: 'asc' },
          select: {
            id: true,
            batchCode: true,
            quantity: true,
            expiryDate: true,
            createdAt: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = itemSchema.partial().parse(body)

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update display name if relevant fields changed
    const displayNameFields = {
      brand: data.brand ?? existingItem.brand,
      baseName: data.baseName ?? existingItem.baseName,
      size: data.size ?? existingItem.size,
      qtyWeight: data.qtyWeight ?? existingItem.qtyWeight,
    }

    const displayName = [
      displayNameFields.brand,
      displayNameFields.baseName,
      displayNameFields.size,
      displayNameFields.qtyWeight,
    ]
      .filter(Boolean)
      .join(' ')

    const item = await prisma.item.update({
      where: { id },
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

    // Log the update
    await prisma.transaction.create({
      data: {
        itemId: item.id,
        userId: user.id,
        transactionType: 'STOCK_IN',
        amount: 0,
        stockAfter: item.currentStock,
        notes: 'Item updated',
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Delete related batches and transactions first
    await prisma.$transaction([
      prisma.itemBatch.deleteMany({ where: { itemId: id } }),
      prisma.transaction.deleteMany({ where: { itemId: id } }),
      prisma.item.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
