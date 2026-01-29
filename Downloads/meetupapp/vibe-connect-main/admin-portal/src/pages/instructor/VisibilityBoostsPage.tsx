import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, Zap, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function VisibilityBoostsPage() {
  const [boosts, setBoosts] = useState([
    { id: 1, title: 'Diction Class', type: 'trending', duration: 7, cost: 50, active: true },
    { id: 2, title: 'AutoCAD Basics', type: 'nearby', duration: 3, cost: 25, active: false },
  ]);

  const boostTypes = [
    { value: 'trending', label: 'Trending Boost', description: 'Show in trending section', icon: TrendingUp },
    { value: 'nearby', label: 'Nearby Boost', description: 'Prioritize in nearby searches', icon: Zap },
    { value: 'homepage', label: 'Homepage Boost', description: 'Feature on homepage', icon: Zap },
  ];

  const handleBoost = (id: number, type: string) => {
    setBoosts(boosts.map(b => 
      b.id === id 
        ? { ...b, type, active: true }
        : b
    ));
    toast.success('Boost activated!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Boosts</h1>
        <p className="text-muted-foreground mt-2">Increase visibility for your content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {boostTypes.map((boostType) => (
          <Card key={boostType.value}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <boostType.icon className="w-5 h-5" />
                {boostType.label}
              </CardTitle>
              <CardDescription>{boostType.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <Badge>7 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <span className="font-bold">$50</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Select Boost
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Boosts</CardTitle>
          <CardDescription>Currently active boosts for your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {boosts.map((boost) => (
              <div
                key={boost.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{boost.title}</p>
                    <Badge variant={boost.active ? 'default' : 'secondary'}>
                      {boost.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {boost.duration} days
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${boost.cost}
                    </span>
                  </div>
                </div>
                {!boost.active && (
                  <Button size="sm" onClick={() => handleBoost(boost.id, boost.type)}>
                    Activate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
