import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PermissionService } from '@/services/permissionService';
import {
  Building2,
  Users,
  Calendar,
  Settings,
  UserCheck,
  Package,
  User,
  FileText,
  Clock,
  CheckCircle,
  UserCog,
  Menu,
  X,
  Receipt,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Shield,
  Bell,
  CreditCard,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface MenuItem {
  name: string;
  title: string;
  icon: React.ComponentType<any>;
  href: string | null;
  role?: string;
  submenu?: MenuItem[];
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [pageAccess, setPageAccess] = useState<Record<string, boolean>>({});
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Check if device is mobile (native or mobile web)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check screen width
      const isMobileWidth = window.innerWidth <= 768;
      
      // Check user agent for mobile devices
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      setIsMobile(isMobileWidth || isMobileUA);
      
      // Listen for resize events
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const mobileWidth = window.innerWidth <= 768;
          const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            window.navigator.userAgent || ''
          );
          setIsMobile(mobileWidth || mobileUA);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
      };
    }
  }, []);

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
      href: (userRole === 'admin' || userRole === 'sales') ? '/project-approval' : null,
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
      icon: Settings,
      href: '/settings',
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
    setIsOpen(false);
    router.push(href);
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  // Only render on mobile devices (including mobile web)
  if (!isMobile) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setIsOpen(true)}
      >
        <Menu size={24} color="#236ecf" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              {visibleItems.map((item, index) => {
                const IconComponent = item.icon;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedMenus.has(item.name);
                const visibleSubmenu = hasSubmenu ? item.submenu!.filter(sub => sub.href !== null) : [];
                
                return (
                  <View key={item.name}>
                    <TouchableOpacity
                      style={[
                        styles.menuItem,
                        index === visibleItems.length - 1 && !isExpanded && styles.lastMenuItem,
                      ]}
                      onPress={() => {
                        if (hasSubmenu) {
                          toggleSubmenu(item.name);
                        } else if (item.href) {
                          handleMenuPress(item.href);
                        }
                      }}
                    >
                      <View style={styles.menuItemContent}>
                        <IconComponent size={20} color="#374151" />
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </View>
                      {hasSubmenu && (
                        isExpanded ? <ChevronDown size={18} color="#6b7280" /> : <ChevronRight size={18} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                    
                    {hasSubmenu && isExpanded && visibleSubmenu.map((subItem, subIndex) => {
                      const SubIconComponent = subItem.icon;
                      return (
                        <TouchableOpacity
                          key={subItem.name}
                          style={[
                            styles.subMenuItem,
                            subIndex === visibleSubmenu.length - 1 && styles.lastSubMenuItem,
                          ]}
                          onPress={() => handleMenuPress(subItem.href!)}
                        >
                          <View style={styles.subMenuItemContent}>
                            <SubIconComponent size={18} color="#6b7280" />
                            <Text style={styles.subMenuItemText}>{subItem.title}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 58 : 50,
    right: 16,
    zIndex: 10000,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 10 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    minWidth: Platform.OS === 'web' ? 40 : 44,
    minHeight: Platform.OS === 'web' ? 40 : 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingLeft: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  lastSubMenuItem: {
    borderBottomWidth: 0,
  },
  subMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subMenuItemText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
});
