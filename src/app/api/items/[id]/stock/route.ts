import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

const stockAdjustmentSchema = z.object({
  type: z.enum(['ADD', 'REMOVE', 'SET']),
  quantity: z.number().int().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  batchId: z.string().optional(),
  batchCode: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  dateReceived: z.string().datetime().optional(),
})

// POST /api/items/[id]/stock - Adjust stock quantity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, quantity, reason, batchId, batchCode, expiryDate, dateReceived } =
      stockAdjustmentSchema.parse(body)

    // Get current item
    const item = await prisma.item.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    let newQuantity = item.currentStock
    let quantityChange = 0

    // Calculate new quantity based on type
    switch (type) {
      case 'ADD':
        newQuantity += quantity
        quantityChange = quantity
        break
      case 'REMOVE':
        newQuantity -= quantity
        quantityChange = -quantity
        break
      case 'SET':
        quantityChange = quantity - item.currentStock
        newQuantity = quantity
        break
    }

    // Ensure stock doesn't go negative
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    // Perform stock adjustment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update item stock
      const updatedItem = await tx.item.update({
        where: { id },
        data: { currentStock: newQuantity },
        include: {
          category: { select: { id: true, name: true, color: true } },
          supplier: { select: { id: true, name: true } },
          storageLocation: { select: { id: true, name: true, description: true } },
        },
      })

      // Determine transaction type
      const transactionType = quantityChange >= 0 ? 'STOCK_IN' : 'STOCK_OUT'

      // Create transaction log
      const transaction = await tx.transaction.create({
        data: {
          itemId: id,
          userId: user.id,
          transactionType,
          amount: quantityChange,
          stockAfter: newQuantity,
          notes: reason,
          batchId: batchId || null,
        },
      })

      // Handle batch tracking if item has expiry
      if (item.hasExpiry && type === 'ADD') {
        // Create or update batch
        if (batchId) {
          await tx.itemBatch.update({
            where: { id: batchId },
            data: { quantity: { increment: quantity } },
          })
        } else if (batchCode && expiryDate) {
          await tx.itemBatch.create({
            data: {
              itemId: id,
              batchCode,
              quantity,
              expiryDate: new Date(expiryDate),
              dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
            },
          })
        }
      } else if (item.hasExpiry && type === 'REMOVE' && batchId) {
        // Remove from specific batch (FIFO)
        const batch = await tx.itemBatch.findUnique({
          where: { id: batchId },
        })

        if (batch) {
          const newBatchQty = batch.quantity - quantity
          if (newBatchQty > 0) {
            await tx.itemBatch.update({
              where: { id: batchId },
              data: { quantity: newBatchQty },
            })
          } else {
            // Delete batch if quantity reaches 0
            await tx.itemBatch.delete({ where: { id: batchId } })
          }
        }
      }

      return { item: updatedItem, transaction }
    })

    const duration = Date.now() - startTime

    return NextResponse.json({
      ...result,
      duration,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error adjusting stock:', error)
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    )
  }
}
