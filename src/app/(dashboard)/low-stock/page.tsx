import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LowStockPage() {
  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
        <p className="text-muted-foreground">
          Monitor items that need reordering
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Low stock alerts and supplier-based ordering will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="mt-2 ml-6 list-disc text-sm text-muted-foreground space-y-1">
            <li>Items below reorder quantity</li>
            <li>Grouped by supplier for easy ordering</li>
            <li>Critical items highlighted</li>
            <li>Supplier minimum order thresholds</li>
            <li>Discord webhook notifications</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
