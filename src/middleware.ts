import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/check-email', '/api/auth/setup-password', '/api/auth/login']

// Routes that only admins can access
const adminRoutes = ['/settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication
  const token = request.cookies.get('token')?.value

  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const payload = verifyToken(token)

  if (!payload) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)

    // Clear invalid cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  }

  // Check admin-only routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (payload.role !== 'ADMIN') {
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL('/items', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
