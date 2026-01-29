import { Users, Building2, GraduationCap, Calendar, AlertCircle, Image, MessageCircle, MessageSquare, Megaphone, Sparkles, Percent, Camera, BookOpen, Video, Ticket, QrCode, TrendingUp, Star, MapPin, DollarSign, PieChart, Wallet, BarChart3, Bot, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  // Mock data - will be replaced with actual API calls
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Venues',
      value: '342',
      change: '+8.2%',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Instructors',
      value: '156',
      change: '+5.1%',
      icon: GraduationCap,
      color: 'text-purple-600',
    },
    {
      title: 'Active Events',
      value: '1,234',
      change: '+23.4%',
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring admin review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">12 Venues</p>
                    <p className="text-sm text-muted-foreground">Awaiting approval</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/venues">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">8 Instructors</p>
                    <p className="text-sm text-muted-foreground">Pending verification</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/instructors">Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">New user registered:</span> John Doe
                  </p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">New venue created:</span> Coffee House
                  </p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">New class created:</span> Yoga Basics
                  </p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Access - Venue Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Venue Management
          </CardTitle>
          <CardDescription>Manage venue content, campaigns, and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/venue/content" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Image className="w-5 h-5 text-primary" />
                  <span className="font-medium">Content</span>
                </div>
                <p className="text-sm text-muted-foreground">Posts, Stories, Reels</p>
              </div>
            </Link>
            <Link to="/venue/qa" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Q&A</span>
                </div>
                <p className="text-sm text-muted-foreground">Answer questions</p>
              </div>
            </Link>
            <Link to="/venue/chat" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium">Chat</span>
                </div>
                <p className="text-sm text-muted-foreground">User conversations</p>
              </div>
            </Link>
            <Link to="/venue/campaigns" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <span className="font-medium">Campaigns</span>
                </div>
                <p className="text-sm text-muted-foreground">Marketing campaigns</p>
              </div>
            </Link>
            <Link to="/venue/vibes" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-medium">Vibes</span>
                </div>
                <p className="text-sm text-muted-foreground">Event management</p>
              </div>
            </Link>
            <Link to="/venue/discounts" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="w-5 h-5 text-primary" />
                  <span className="font-medium">Discounts</span>
                </div>
                <p className="text-sm text-muted-foreground">Promotional offers</p>
              </div>
            </Link>
            <Link to="/venue/ads" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="font-medium">Ads</span>
                </div>
                <p className="text-sm text-muted-foreground">Advertisement management</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Admin Quick Access - Instructor Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Instructor Management
          </CardTitle>
          <CardDescription>Manage instructor classes, content, and streaming</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/instructor/content" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Image className="w-5 h-5 text-primary" />
                  <span className="font-medium">Content</span>
                </div>
                <p className="text-sm text-muted-foreground">Posts & Stories</p>
              </div>
            </Link>
            <Link to="/instructor/classes" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-medium">Classes</span>
                </div>
                <p className="text-sm text-muted-foreground">Create & manage classes</p>
              </div>
            </Link>
            <Link to="/instructor/streaming" className="group">
              <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="font-medium">Streaming</span>
                </div>
                <p className="text-sm text-muted-foreground">Live streaming setup</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Admin Quick Access - Production, Tickets, Visibility, Monetization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Production & Tickets
            </CardTitle>
            <CardDescription>Create events and manage ticket systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/production/create" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Create Class / Event / Vibe</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/production/ai-assistant" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Content Assistant</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/tickets/pricing" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Ticket Pricing</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/tickets/checkin" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">QR Check-in</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Visibility & Monetization
            </CardTitle>
            <CardDescription>Boost visibility and manage revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/visibility/boosts" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Boosts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/monetization/revenue" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <PieChart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Revenue Split</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/monetization/payouts" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Payouts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/monetization/analytics" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
