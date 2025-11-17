import { NextRequest, NextResponse } from 'next/server'
import { setupPasswordSchema } from '@/lib/validations'
import { setupPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = setupPasswordSchema.parse(body)

    const result = await setupPassword(email, password)

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid request. User may not exist or password already set.' },
        { status: 400 }
      )
    }

    const { user, token } = result

    // Create response with httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 200 }
    )

    // Set httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error setting up password:', error)
    return NextResponse.json(
      { error: 'Failed to set up password' },
      { status: 500 }
    )
  }
}
