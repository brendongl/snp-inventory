import { z } from 'zod'

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const setupPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================================================
// ITEM VALIDATIONS
// ============================================================================

export const itemSchema = z.object({
  brand: z.string().optional().nullable(),
  baseName: z.string().min(1, 'Item name is required'),
  size: z.string().optional().nullable(),
  qtyWeight: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  hasExpiry: z.boolean().default(false),
  isCritical: z.boolean().default(false),
  storageLocationId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  reorderQty: z.number().int().nonnegative().default(10),
  currentStock: z.number().int().nonnegative().default(0),
})

export const updateItemSchema = itemSchema.partial()

// ============================================================================
// STOCK ADJUSTMENT VALIDATIONS
// ============================================================================

export const stockAdjustmentSchema = z.object({
  itemId: z.string().uuid(),
  amount: z.number().int(), // Positive for stock_in, negative for stock_out
  batchId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// ============================================================================
// BATCH VALIDATIONS
// ============================================================================

export const itemBatchSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  expiryDate: z.string().optional().nullable(), // ISO date string
  dateReceived: z.string(), // ISO date string
})

export const updateBatchSchema = z.object({
  quantity: z.number().int().nonnegative(),
  expiryDate: z.string().optional().nullable(),
})

// ============================================================================
// SUPPLIER VALIDATIONS
// ============================================================================

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  businessName: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  supplierType: z.enum(['DISTRIBUTOR', 'RETAILER', 'ONLINE', 'WHOLESALE', 'PRODUCER', 'OTHER']).optional().nullable(),
  isActive: z.boolean().default(true),
  minOrderType: z.enum(['QUANTITY', 'ITEMS', 'PRICE']).optional().nullable(),
  minOrderValue: z.number().nonnegative().optional().nullable(),
})

export const updateSupplierSchema = supplierSchema.partial()

// ============================================================================
// CATEGORY & STORAGE LOCATION VALIDATIONS
// ============================================================================

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional().nullable(),
  isActive: z.boolean().default(true),
})

export const storageLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

// ============================================================================
// SYSTEM SETTINGS VALIDATIONS
// ============================================================================

export const systemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional().nullable(),
})

// ============================================================================
// QUERY PARAMETER VALIDATIONS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export const searchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  storageLocationId: z.string().uuid().optional(),
  lowStockOnly: z.boolean().optional(),
  criticalOnly: z.boolean().optional(),
})

export const dateRangeSchema = z.object({
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>
export type ItemInput = z.infer<typeof itemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type ItemBatchInput = z.infer<typeof itemBatchSchema>
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type StorageLocationInput = z.infer<typeof storageLocationSchema>
export type SystemSettingInput = z.infer<typeof systemSettingSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
