import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LogsPage() {
  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transaction Logs</h1>
        <p className="text-muted-foreground">
          View inventory transaction history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Transaction history and audit logs will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="mt-2 ml-6 list-disc text-sm text-muted-foreground space-y-1">
            <li>Stock adjustments (add/remove/set)</li>
            <li>Filter by item, user, or date range</li>
            <li>Export transaction data</li>
            <li>30-day rolling log retention</li>
            <li>Detailed change tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
