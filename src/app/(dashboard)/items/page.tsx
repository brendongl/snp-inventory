'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface Item {
  id: string
  displayName: string
  currentStock: number
  reorderQty: number
  isCritical: boolean
  hasExpiry: boolean
  category: { name: string; color: string | null } | null
  supplier: { name: string } | null
  storageLocation: { name: string } | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchItems = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
      })

      const res = await fetch(`/api/items?${params}`)
      if (!res.ok) {
        throw new Error('Failed to fetch items')
      }

      const data = await res.json()
      setItems(data.items)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Failed to load items')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchItems(1, search)
  }

  const getStockStatus = (item: Item) => {
    if (item.currentStock <= 0) return { text: 'Out of Stock', color: 'text-red-600' }
    if (item.currentStock <= item.reorderQty) return { text: 'Low Stock', color: 'text-yellow-600' }
    return { text: 'In Stock', color: 'text-green-600' }
  }

  return (
    <div className="container py-6 px-4 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">
            Manage your inventory items
          </p>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.total} {pagination.total === 1 ? 'Item' : 'Items'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No items found. {search && 'Try a different search.'}
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Reorder At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const status = getStockStatus(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/items/${item.id}`}
                              className="hover:underline"
                            >
                              {item.displayName}
                              {item.isCritical && (
                                <span className="ml-2 text-xs text-red-600">⚠ Critical</span>
                              )}
                              {item.hasExpiry && (
                                <span className="ml-2 text-xs text-blue-600">📅 Expiry</span>
                              )}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {item.category ? (
                              <span
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: item.category.color
                                    ? `${item.category.color}20`
                                    : undefined,
                                  color: item.category.color || undefined,
                                }}
                              >
                                {item.category.name}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{item.supplier?.name || '-'}</TableCell>
                          <TableCell>{item.storageLocation?.name || '-'}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.currentStock}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.reorderQty}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchItems(pagination.page - 1, search)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchItems(pagination.page + 1, search)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
