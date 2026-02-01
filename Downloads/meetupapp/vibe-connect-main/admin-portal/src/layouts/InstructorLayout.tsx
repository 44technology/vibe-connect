import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  Image,
  Video,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  Bot,
  Calendar,
  Ticket,
  DollarSign,
  QrCode,
  Shield,
  TrendingUp,
  Star,
  MapPin,
  PieChart,
  Wallet,
  BarChart3,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InstructorLayoutProps {
  children: ReactNode;
}

const navigation: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
  children?: Array<{ name: string; href: string; icon: LucideIcon }>;
}> = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Posts & Stories', href: '/content', icon: Image },
  { name: 'Live Streaming', href: '/streaming', icon: Video },
  { name: 'Classes', href: '/classes', icon: GraduationCap },
  { name: 'Vibes', href: '/vibes', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  {
    name: 'Production',
    href: '#',
    icon: Sparkles,
    children: [
      { name: 'Schedule & Capacity', href: '/production/schedule', icon: Calendar },
    ]
  },
  {
    name: 'Tickets',
    href: '#',
    icon: Ticket,
    children: [
      { name: 'QR Check-in', href: '/tickets/checkin', icon: QrCode },
      { name: 'Access Rules', href: '/tickets/access', icon: Shield },
    ]
  },
  {
    name: 'Visibility',
    href: '#',
    icon: TrendingUp,
    children: [
      { name: 'Boosts', href: '/visibility/boosts', icon: TrendingUp },
      { name: 'Trending', href: '/visibility/trending', icon: Star },
      { name: 'Nearby', href: '/visibility/nearby', icon: MapPin },
      { name: 'Ad Campaigns', href: '/visibility/influencer', icon: Star },
    ]
  },
  {
    name: 'Monetization',
    href: '#',
    icon: DollarSign,
    children: [
      { name: 'Pricing', href: '/monetization/pricing', icon: DollarSign },
      { name: 'Revenue Split', href: '/monetization/revenue', icon: PieChart },
      { name: 'Payouts', href: '/monetization/payouts', icon: Wallet },
      { name: 'Analytics', href: '/monetization/analytics', icon: BarChart3 },
    ]
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Ulikme</h1>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isActive = hasChildren 
                ? item.children?.some(child => location.pathname === child.href)
                : location.pathname === item.href;
              
              if (hasChildren) {
                return (
                  <div key={item.name} className="mb-2">
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground uppercase tracking-wider`}>
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                              isChildActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Instructor: <span className="font-medium text-foreground">{user?.name}</span>
            </span>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
