import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ItemsPage() {
  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
        <p className="text-muted-foreground">
          Manage your inventory items
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Items list, search, and management will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="mt-2 ml-6 list-disc text-sm text-muted-foreground space-y-1">
            <li>Search and filter items</li>
            <li>View item details and stock levels</li>
            <li>Add, edit, and delete items</li>
            <li>Adjust stock quantities</li>
            <li>Manage item images</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
