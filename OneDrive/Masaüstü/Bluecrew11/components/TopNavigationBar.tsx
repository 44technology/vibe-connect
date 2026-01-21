import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PermissionService } from '@/services/permissionService';
import {
  Building2,
  Users,
  UserCheck,
  User,
  FileText,
  Clock,
  CheckCircle,
  UserCog,
  Database,
  Receipt,
  ChevronDown,
  Briefcase,
  Shield,
  Package,
  Bell,
  CreditCard,
} from 'lucide-react-native';

interface MenuItem {
  name: string;
  title: string;
  icon: React.ComponentType<any>;
  href: string | null;
  role?: string;
  submenu?: MenuItem[];
}

export default function TopNavigationBar() {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [pageAccess, setPageAccess] = useState<Record<string, boolean>>({});
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && expandedMenus.size > 0) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Check if click is outside menu container
        const menuContainers = document.querySelectorAll('[data-menu-container]');
        let clickedInside = false;
        menuContainers.forEach(container => {
          if (container.contains(target)) {
            clickedInside = true;
          }
        });
        if (!clickedInside) {
          setExpandedMenus(new Set());
        }
      };
      
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        window.addEventListener('click', handleClickOutside, true);
      }, 0);
      
      return () => {
        window.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [expandedMenus]);

  // Load permissions from Firebase
  useEffect(() => {
    const loadPageAccess = async () => {
      if (!userRole) return;
      
      const pages = ['sales-report', 'proposals', 'invoices'];
      const access: Record<string, boolean> = {};
      for (const page of pages) {
        const hasAccess = await PermissionService.hasPageAccess(page, userRole as any);
        access[page] = hasAccess;
      }
      
      setPageAccess(access);
    };
    
    loadPageAccess();
  }, [userRole]);

  // Only show on web desktop
  if (Platform.OS !== 'web') {
    return null;
  }

  // Check if it's mobile web
  if (typeof window !== 'undefined') {
    const isMobileWidth = window.innerWidth <= 768;
    const userAgent = window.navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobileWidth || isMobileUA) {
      return null; // Hide on mobile web (hamburger menu will show)
    }
  }

  const menuItems: MenuItem[] = [
    {
      name: 'index',
      title: t('projects'),
      icon: Building2,
      href: '/projects',
    },
    {
      name: 'notifications',
      title: 'Notifications',
      icon: Bell,
      href: '/notifications',
    },
    {
      name: 'team',
      title: t('employees'),
      icon: Users,
      href: userRole === 'admin' ? '/team' : null,
    },
    {
      name: 'hr',
      title: 'HR',
      icon: UserCog,
      href: userRole === 'admin' ? '/hr' : null,
    },
    {
      name: 'time-clock',
      title: t('timeClock'),
      icon: Clock,
      href: (userRole === 'admin' || userRole === 'pm' || userRole === 'sales' || userRole === 'office') ? '/time-clock' : null,
    },
    {
      name: 'sales',
      title: 'Sales',
      icon: Briefcase,
      href: (userRole === 'admin' || (userRole === 'sales' && pageAccess['sales-report'] !== false)) ? '/sales-report' : null,
      submenu: (userRole === 'office' && pageAccess['proposals'] !== false && pageAccess['invoices'] !== false) ? [
        {
          name: 'proposals',
          title: 'Proposals',
          icon: FileText,
          href: '/proposals',
        },
        {
          name: 'invoices',
          title: 'Invoices',
          icon: Receipt,
          href: '/invoices',
        },
      ] : undefined,
    },
    // Client için Proposals menüsü
    {
      name: 'client-proposals',
      title: 'Proposals',
      icon: FileText,
      href: userRole === 'client' ? '/proposals' : null,
    },
    // Client için Invoices menüsü
    {
      name: 'client-invoices',
      title: 'Invoices',
      icon: Receipt,
      href: userRole === 'client' ? '/invoices' : null,
    },
    {
      name: 'project-approval',
      title: 'Approval',
      icon: CheckCircle,
      href: userRole === 'admin' ? '/project-approval' : null, // Sadece admin görebilir
    },
    {
      name: 'tracking',
      title: 'Tracking',
      icon: Package,
      href: (userRole === 'admin' || userRole === 'pm') ? '/tracking' : null,
    },
    {
      name: 'expenses',
      title: 'Expenses',
      icon: CreditCard,
      href: userRole === 'admin' ? '/expenses' : null,
    },
    {
      name: 'reports',
      title: t('reports'),
      icon: FileText,
      href: userRole === 'admin' ? '/reports' : null,
    },
    {
      name: 'permissions',
      title: 'Permissions',
      icon: Shield,
      href: userRole === 'admin' ? '/permissions' : null,
    },
    {
      name: 'settings',
      title: t('settings'),
      icon: User,
      href: '/settings',
    },
    {
      name: 'test-firebase',
      title: 'Test Firebase',
      icon: Database,
      href: null, // Hidden - development only
    },
  ];

  const visibleItems = menuItems.filter(item => {
    // Show if has href
    if (item.href !== null) return true;
    // Show if has submenu with at least one visible item
    if (item.submenu && item.submenu.length > 0) {
      const hasVisibleSubmenu = item.submenu.some(sub => sub.href !== null);
      return hasVisibleSubmenu;
    }
    return false;
  });

  const handleMenuPress = (href: string) => {
    router.push(href);
  };

  const toggleSubmenu = (menuName: string) => {
    console.log('Toggling submenu:', menuName);
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
        console.log('Closing submenu:', menuName);
      } else {
        newSet.add(menuName);
        console.log('Opening submenu:', menuName, 'New set:', Array.from(newSet));
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.has(item.name);
          const visibleSubmenu = hasSubmenu ? item.submenu!.filter(sub => sub.href !== null) : [];
          const active = item.href ? isActive(item.href) : false;
          const submenuActive = hasSubmenu && visibleSubmenu.some(sub => isActive(sub.href!));
          
          return (
            <View 
              key={item.name} 
              style={styles.navItemContainer}
              {...(Platform.OS === 'web' ? { 'data-menu-container': 'true' } as any : {})}
            >
              <TouchableOpacity
                style={[styles.navItem, (active || submenuActive) && styles.navItemActive]}
                onPress={() => {
                  console.log('Menu item pressed:', item.name, 'hasSubmenu:', hasSubmenu);
                  if (hasSubmenu) {
                    toggleSubmenu(item.name);
                  } else if (item.href) {
                    handleMenuPress(item.href);
                  }
                }}
                {...(Platform.OS === 'web' && hasSubmenu ? {
                  onMouseEnter: () => {
                    setExpandedMenus(prev => new Set(prev).add(item.name));
                  }
                } as any : {})}
              >
                <IconComponent 
                  size={18} 
                  color={(active || submenuActive) ? '#236ecf' : '#6b7280'} 
                />
                <Text style={[styles.navText, (active || submenuActive) && styles.navTextActive]}>
                  {item.title}
                </Text>
                {hasSubmenu && (
                  <ChevronDown 
                    size={16} 
                    color={(active || submenuActive) ? '#236ecf' : '#6b7280'}
                    style={[styles.chevron, isExpanded && styles.chevronExpanded]}
                  />
                )}
              </TouchableOpacity>
              
              {hasSubmenu && isExpanded && (
                <View 
                  style={styles.submenuContainer}
                  {...(Platform.OS === 'web' ? {
                    onMouseEnter: () => {
                      setExpandedMenus(prev => new Set(prev).add(item.name));
                    },
                    onMouseLeave: () => {
                      // Keep open on hover
                    }
                  } as any : {})}
                >
                  {visibleSubmenu.map((subItem) => {
                    const SubIconComponent = subItem.icon;
                    const subActive = isActive(subItem.href!);
                    return (
                      <TouchableOpacity
                        key={subItem.name}
                        style={[styles.subNavItem, subActive && styles.subNavItemActive]}
                        onPress={() => handleMenuPress(subItem.href!)}
                      >
                        <SubIconComponent 
                          size={16} 
                          color={subActive ? '#236ecf' : '#6b7280'} 
                        />
                        <Text style={[styles.subNavText, subActive && styles.subNavTextActive]}>
                          {subItem.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
    } : {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    }),
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    maxWidth: '100%',
    overflowX: 'auto',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minHeight: 40,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: '#f3f4f6',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  navTextActive: {
    color: '#236ecf',
    fontWeight: '600',
  },
  navItemContainer: {
    position: 'relative',
  },
  chevron: {
    marginLeft: 4,
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  submenuContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
    zIndex: 1000,
  },
  subNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  subNavItemActive: {
    backgroundColor: '#eff6ff',
  },
  subNavText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  subNavTextActive: {
    color: '#236ecf',
    fontWeight: '600',
  },
});

