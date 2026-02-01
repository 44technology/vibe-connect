import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Image,
  Video,
  Megaphone,
  Sparkles,
  Percent,
  Upload,
  BookOpen,
  MessageCircle,
  MessageSquare,
  Ticket,
  QrCode,
  TrendingUp,
  Star,
  MapPin,
  DollarSign,
  PieChart,
  Wallet,
  BarChart3,
  Calendar,
  Bot,
  Camera,
  ArrowLeftRight,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Venues', href: '/venues', icon: Building2 },
  { name: 'Instructors', href: '/instructors', icon: GraduationCap },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Refunds', href: '/refunds', icon: ArrowLeftRight },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isActive = hasChildren 
                ? item.children?.some(child => location.pathname === child.href || location.pathname.startsWith(child.href + '/'))
                : location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
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
                        const isChildActive = location.pathname === child.href || location.pathname.startsWith(child.href + '/');
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

          {/* User section */}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
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
              Role: <span className="font-medium text-foreground capitalize">{user?.role}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
