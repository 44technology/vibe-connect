import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';

export default function MonetizationAnalyticsPage() {
  const analytics = {
    revenue: {
      total: 1250,
      thisMonth: 500,
      growth: 15.5,
    },
    enrollments: {
      total: 145,
      thisMonth: 45,
      growth: 8.2,
    },
    views: {
      total: 3250,
      thisMonth: 980,
      growth: 22.3,
    },
  };

  const topClasses = [
    { name: 'Diction Class', revenue: 600, enrollments: 45, views: 1250 },
    { name: 'AutoCAD Basics', revenue: 450, enrollments: 32, views: 980 },
    { name: 'Yoga Workshop', revenue: 200, enrollments: 28, views: 1020 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track your performance and revenue</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${analytics.revenue.total}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                +{analytics.revenue.growth}%
              </Badge>
              <span className="text-sm text-muted-foreground">This month: ${analytics.revenue.thisMonth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.enrollments.total}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                +{analytics.enrollments.growth}%
              </Badge>
              <span className="text-sm text-muted-foreground">This month: {analytics.enrollments.thisMonth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.views.total.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                +{analytics.views.growth}%
              </Badge>
              <span className="text-sm text-muted-foreground">This month: {analytics.views.thisMonth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Performing Classes
          </CardTitle>
          <CardDescription>Your best performing content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClasses.map((cls, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cls.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>${cls.revenue} revenue</span>
                      <span>{cls.enrollments} enrollments</span>
                      <span>{cls.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <Badge variant="secondary">#{idx + 1}</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(cls.revenue / topClasses[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
