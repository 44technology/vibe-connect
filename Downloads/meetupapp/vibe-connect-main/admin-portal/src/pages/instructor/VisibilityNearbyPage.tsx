import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { MapPin, Navigation, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function VisibilityNearbyPage() {
  const [radius, setRadius] = useState(10);
  const [location, setLocation] = useState('New York, NY');
  const [enabled, setEnabled] = useState(true);

  const nearbyContent = [
    { id: 1, title: 'Diction Class', distance: 2.5, address: '123 Main St, New York' },
    { id: 2, title: 'AutoCAD Basics', distance: 5.2, address: '456 Oak Ave, Brooklyn' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nearby Visibility</h1>
        <p className="text-muted-foreground mt-2">Control how your content appears in nearby searches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription>Configure nearby search parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
            />
          </div>
          <div className="space-y-2">
            <Label>Search Radius: {radius} km</Label>
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
          <Button onClick={() => toast.success('Settings saved!')} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Content
          </CardTitle>
          <CardDescription>Content visible in nearby searches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nearbyContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="secondary" className="gap-1">
                      <Navigation className="w-3 h-3" />
                      {item.distance} km away
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.address}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
