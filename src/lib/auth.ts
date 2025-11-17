import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { User, UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'
const BCRYPT_ROUNDS = 10

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: UserRole
}

export interface JWTPayload extends AuthUser {
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie
  const token = request.cookies.get('token')?.value
  return token || null
}

/**
 * Verify authentication from request
 * Returns user if authenticated, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  })

  if (!user || !user.isActive) return null

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN'
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user || !user.isActive) return null

  // If no password hash, user needs to set up password first
  if (!user.passwordHash) return null

  const isValid = await comparePassword(password, user.passwordHash)
  if (!isValid) return null

  const token = generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })

  return { user, token }
}

/**
 * Check if user needs to set up password (first-time login)
 */
export async function needsPasswordSetup(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { passwordHash: true, isActive: true },
  })

  return !!user && user.isActive && !user.passwordHash
}

/**
 * Set up password for first-time user
 */
export async function setupPassword(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user || !user.isActive || user.passwordHash) return null

  const passwordHash = await hashPassword(password)

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  const token = generateToken({
    id: updatedUser.id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    role: updatedUser.role,
  })

  return { user: updatedUser, token }
}
