import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and preferences
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>
              Your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Password change, notification preferences, and display settings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>
              System configuration (Admin only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This section will include:
            </p>
            <ul className="mt-2 ml-6 list-disc text-sm text-muted-foreground space-y-1">
              <li>Supplier management</li>
              <li>Category management</li>
              <li>Storage location management</li>
              <li>User management</li>
              <li>Discord webhook configuration</li>
              <li>System analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
