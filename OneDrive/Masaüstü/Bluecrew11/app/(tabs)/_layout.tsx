import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Building2, Users, UserCheck, User, FileText, Clock, CheckCircle, UserCog, Database, Receipt, Briefcase, Shield, DollarSign, TrendingUp, Package, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TopNavigationBar from '@/components/TopNavigationBar';
import { PermissionService } from '@/services/permissionService';

export default function TabLayout() {
  const { userRole } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isWebDesktop, setIsWebDesktop] = useState(false);
  const [pageAccess, setPageAccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if device is mobile (native or mobile web)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      setIsWebDesktop(false);
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check screen width
      const isMobileWidth = window.innerWidth <= 768;
      
      // Check user agent for mobile devices
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      const mobile = isMobileWidth || isMobileUA;
      setIsMobile(mobile);
      setIsWebDesktop(!mobile);
      
      // Listen for resize events
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const mobileWidth = window.innerWidth <= 768;
          const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            window.navigator.userAgent || ''
          );
          const mobile = mobileWidth || mobileUA;
          setIsMobile(mobile);
          setIsWebDesktop(!mobile);
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
      
      const pages = [
        'projects', 'team', 'hr', 'payroll', 'commission', 'leads', 'clients', 
        'sales-report', 'time-clock', 'project-approval', 'proposals', 'invoices', 
        'tracking', 'expenses', 'reports', 'permissions', 'settings'
      ];
      
      const access: Record<string, boolean> = {};
      for (const page of pages) {
        const hasAccess = await PermissionService.hasPageAccess(page, userRole as any);
        access[page] = hasAccess;
      }
      
      setPageAccess(access);
    };
    
    loadPageAccess();
  }, [userRole]);
  
  return (
    <View style={{ flex: 1 }}>
      {isWebDesktop && <TopNavigationBar />}
      <View style={isWebDesktop ? { flex: 1, paddingTop: 65 } : { flex: 1 }}>
        <Tabs
        screenOptions={{
          headerShown: false,
          // Hide tab bar completely on web (we use TopNavigationBar instead)
          // Only show on native mobile (iOS/Android)
          tabBarStyle: Platform.OS === 'web' ? { 
            display: 'none',
            height: 0,
            overflow: 'hidden',
          } : {
            backgroundColor: '#ffffff',
            borderTopColor: '#236ecf20',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 0,
            zIndex: 999,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarActiveTintColor: '#236ecf',
          tabBarInactiveTintColor: '#6b7280',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            minHeight: 50,
          },
        }}>
      {/* 1) Projects - Admin, PM, Sales can view (Client cannot see Projects menu) */}
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
          href: pageAccess['projects'] !== false ? ((userRole === 'admin' || userRole === 'pm' || userRole === 'sales') ? undefined : null) : null,
        }}
      />
      {/* 2) Team */}
      <Tabs.Screen
        name="team"
        options={{
          title: 'Team',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
          href: pageAccess['team'] !== false ? (userRole === 'client' ? null : undefined) : null,
        }}
      />
      {/* 3) HR (admin) */}
      <Tabs.Screen
        name="hr"
        options={{
          title: 'HR',
          tabBarIcon: ({ size, color }) => (
            <UserCog size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
      {/* 3.1) Payroll (admin) */}
      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          tabBarIcon: ({ size, color }) => (
            <DollarSign size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
      {/* 3.2) Commission (admin) */}
      <Tabs.Screen
        name="commission"
        options={{
          title: 'Commission',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
      {/* 4) Leads (admin & sales) */}
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: (userRole === 'admin' || userRole === 'sales') ? undefined : null,
        }}
      />
      {/* 5) Clients (admin) */}
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ size, color }) => (
            <UserCheck size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
      {/* 6) Sales (admin, sales only - client sees Proposals and Invoices directly) */}
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: ({ size, color }) => (
            <Briefcase size={size} color={color} />
          ),
          href: (userRole === 'admin' || (userRole === 'sales' && pageAccess['sales-report'] !== false)) ? undefined : null,
        }}
      />
      {/* 7) Time Clock */}
      <Tabs.Screen
        name="time-clock"
        options={{
          title: 'Time Clock',
          tabBarIcon: ({ size, color }) => (
            <Clock size={size} color={color} />
          ),
          href: (userRole === 'client' || pageAccess['time-clock'] === false) ? null : undefined,
        }}
      />
      {/* 8) Approval (admin only) */}
      <Tabs.Screen
        name="project-approval"
        options={{
          title: 'Approval',
          tabBarIcon: ({ size, color }) => (
            <CheckCircle size={size} color={color} />
          ),
          href: userRole === 'admin' ? 'project-approval' : null, // Sadece admin görebilir
        }}
      />
      {/* 7) Proposals - Client sees as "Sales" */}
      <Tabs.Screen
        name="proposals"
        options={{
          title: userRole === 'client' ? 'Sales' : 'Proposals',
          tabBarIcon: ({ size, color }) => (
            userRole === 'client' ? <Briefcase size={size} color={color} /> : <FileText size={size} color={color} />
          ),
          href: pageAccess['proposals'] !== false ? ((userRole === 'admin' || userRole === 'sales' || userRole === 'client') ? undefined : null) : null,
        }}
      />
      {/* 8) Invoices - Admin, Sales, and Client can view */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ size, color }) => (
            <Receipt size={size} color={color} />
          ),
          href: pageAccess['invoices'] !== false ? ((userRole === 'admin' || userRole === 'sales' || userRole === 'client') ? undefined : null) : null,
        }}
      />
      {/* 8.1) Tracking (admin, pm) - moved up for visibility */}
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
          href: (userRole === 'admin' || userRole === 'pm') ? undefined : null,
        }}
      />
      {/* 8) Expenses (admin) */}
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ size, color }) => (
            <CreditCard size={size} color={color} />
          ),
          href: (userRole === 'admin') ? undefined : null,
        }}
      />
      {/* 9) Reports (admin only, not client) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
          href: (userRole === 'admin') ? undefined : null,
        }}
      />
      {/* 10) Permissions (admin only) */}
      <Tabs.Screen
        name="permissions"
        options={{
          title: 'Permissions',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
      {/* 10) Settings - All users can access */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: undefined, // Tüm kullanıcılar settings'e erişebilir
        }}
      />
      {/* 9) Test Firebase - Hidden from tab bar */}
      <Tabs.Screen
        name="test-firebase"
        options={{
          title: 'Test Firebase',
          tabBarIcon: ({ size, color }) => (
            <Database size={size} color={color} />
          ),
          href: null, // Hide from tab bar - development only
        }}
      />
      {/* Hidden tabs - not shown in tab bar */}
      <Tabs.Screen
        name="schedule"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="completed-projects"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="change-order"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="material-request"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          href: null, // Hide from tab bar (nested routes)
          // Disable web navigation display
          title: '',
        }}
      />
    </Tabs>
      </View>
    </View>
  );
}