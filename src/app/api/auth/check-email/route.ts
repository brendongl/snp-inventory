import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { needsPasswordSetup } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const checkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = checkEmailSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        email: true,
        isActive: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please contact an administrator.' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact an administrator.' },
        { status: 403 }
      )
    }

    const needsSetup = await needsPasswordSetup(email)

    return NextResponse.json({
      exists: true,
      needsPasswordSetup: needsSetup,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}
