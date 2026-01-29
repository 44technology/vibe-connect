import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your venue settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venue Information</CardTitle>
          <CardDescription>Update your venue details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Venue Name</Label>
            <Input placeholder="Enter venue name" defaultValue="Sample Restaurant" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="venue@ulikme.com" defaultValue="venue@ulikme.com" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input placeholder="Enter address" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
