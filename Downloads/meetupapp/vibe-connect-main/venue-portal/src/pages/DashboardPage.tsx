import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Megaphone, Sparkles, Percent, Upload, Image, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Active Campaigns', value: '12', icon: Megaphone, change: '+3 this month' },
    { title: 'Vibes Created', value: '28', icon: Sparkles, change: '+5 this week' },
    { title: 'Active Discounts', value: '8', icon: Percent, change: '2 expiring soon' },
    { title: 'Ads Running', value: '5', icon: Upload, change: '2 pending approval' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your venue activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New Menu Item Post</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Weekend Special Story</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Post Views</span>
                <span className="font-semibold">1.2K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Story Views</span>
                <span className="font-semibold">856</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Campaign Clicks</span>
                <span className="font-semibold">342</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total Engagement</span>
                <span className="font-bold text-primary">2.4K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
