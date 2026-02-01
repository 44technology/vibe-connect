import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { GraduationCap, Video, BookOpen, Users, TrendingUp, DollarSign, Crown, Lock, Sparkles } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function DashboardPage() {
  const stats = [
    { title: 'Active Classes', value: '8', icon: GraduationCap, change: '+2 this month' },
    { title: 'Total Students', value: '156', icon: Users, change: '+12 this week' },
    { title: 'Materials Uploaded', value: '42', icon: BookOpen, change: '+5 this month' },
    { title: 'Total Earnings', value: '$12,450', icon: DollarSign, change: '+$1,200 this month' },
  ];

  const popularClasses = [
    { id: 1, title: 'Diction Class', enrollments: 34, isPremium: false, isExclusive: false },
    { id: 2, title: 'AutoCAD Basics', enrollments: 28, isPremium: true, isExclusive: false },
    { id: 3, title: 'E-commerce Masterclass', enrollments: 45, isPremium: true, isExclusive: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your classes and content</p>
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
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Your scheduled classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Diction Class</p>
                  <p className="text-sm text-muted-foreground">Today at 18:00</p>
                </div>
                <span className="text-sm font-semibold text-primary">12 students</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AutoCAD Basics</p>
                  <p className="text-sm text-muted-foreground">Tomorrow at 14:00</p>
                </div>
                <span className="text-sm font-semibold text-primary">8 students</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New material uploaded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">5 new enrollments</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Classes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Popular Classes
              </CardTitle>
              <CardDescription>Your most popular classes this week</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{cls.title}</p>
                      {cls.isPremium && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {cls.isExclusive && (
                        <Badge variant="outline" className="border-primary text-primary">
                          <Lock className="w-3 h-3 mr-1" />
                          Exclusive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span>{cls.enrollments} enrolled last week</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                  Popular
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Fee Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Ulikme Platform</p>
              <p className="text-sm text-muted-foreground">3% platform fee applies to all paid classes. Low friction, high volume, scalable.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
