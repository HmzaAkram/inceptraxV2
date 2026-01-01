import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and subscription preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-border">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" defaultValue="Jane" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" defaultValue="Doe" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue="jane@example.com" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input id="job-title" defaultValue="Product Designer" className="rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-xl px-8">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">Pro Monthly</span>
                  <Badge className="bg-primary text-primary-foreground border-none">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Your next billing date is June 12, 2026.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$29/mo</p>
                <Button variant="link" className="text-primary p-0 h-auto">
                  Switch to Annual (Save 20%)
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold">Payment Method</h3>
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-muted flex items-center justify-center font-bold text-[10px] uppercase">
                    Visa
                  </div>
                  <span className="text-sm font-medium">•••• •••• •••• 4242</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Update
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="ghost" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                Cancel Subscription
              </Button>
              <Button className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Upgrade to Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
