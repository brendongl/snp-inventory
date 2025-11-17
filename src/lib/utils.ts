import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to local string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format datetime to local string
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Generate display name for items
 */
export function generateDisplayName(
  brand?: string | null,
  baseName?: string | null,
  size?: string | null,
  qtyWeight?: string | null
): string {
  return [brand, baseName, size, qtyWeight]
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Calculate days until date
 */
export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if item is low stock
 */
export function isLowStock(currentStock: number, reorderQty: number): boolean {
  return currentStock <= reorderQty
}

/**
 * Get expiry status color
 */
export function getExpiryStatusColor(daysRemaining: number): string {
  if (daysRemaining <= 7) return 'destructive' // Red
  if (daysRemaining <= 30) return 'warning' // Yellow
  return 'success' // Green
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
