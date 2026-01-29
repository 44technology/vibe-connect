import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage platform settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input placeholder="Ulikme" defaultValue="Ulikme" />
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input type="email" placeholder="admin@ulikme.com" defaultValue="admin@ulikme.com" />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input type="email" placeholder="support@ulikme.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
