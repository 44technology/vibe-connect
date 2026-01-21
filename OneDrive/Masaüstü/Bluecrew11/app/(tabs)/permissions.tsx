import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { 
  Building2, Users, UserCheck, User, FileText, Clock, CheckCircle, 
  UserCog, Receipt, Briefcase, Settings, Package, Calendar, 
  ArrowLeft, Save, Shield
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';

type Role = 'admin' | 'pm' | 'sales' | 'office' | 'client';

type PermissionType = 'view' | 'edit' | 'none';

interface PagePermission {
  id: string;
  name: string;
  icon: any;
  href: string;
  description: string;
  roles: Role[];
  permissions?: Record<Role, PermissionType>; // New: specific permissions per role
}

const allPages: PagePermission[] = [
  {
    id: 'projects',
    name: 'Projects',
    icon: Building2,
    href: '/projects',
    description: 'View and manage projects',
    roles: ['admin', 'pm', 'client'],
  },
  {
    id: 'team',
    name: 'Team',
    icon: Users,
    href: '/team',
    description: 'Manage team members',
    roles: ['admin'],
  },
  {
    id: 'hr',
    name: 'HR',
    icon: UserCog,
    href: '/hr',
    description: 'Human resources management',
    roles: ['admin'],
  },
  {
    id: 'leads',
    name: 'Leads',
    icon: User,
    href: '/leads',
    description: 'Manage leads and prospects',
    roles: ['admin', 'sales'],
  },
  {
    id: 'clients',
    name: 'Clients',
    icon: UserCheck,
    href: '/clients',
    description: 'Manage clients',
    roles: ['admin', 'sales'],
  },
  {
    id: 'sales-report',
    name: 'Sales Report',
    icon: Briefcase,
    href: '/sales-report',
    description: 'Sales statistics and reports',
    roles: ['admin', 'sales'],
  },
  {
    id: 'time-clock',
    name: 'Time Clock',
    icon: Clock,
    href: '/time-clock',
    description: 'Time tracking and attendance',
    roles: ['admin', 'pm', 'sales', 'office'],
  },
  {
    id: 'project-approval',
    name: 'Approval',
    icon: CheckCircle,
    href: '/project-approval',
    description: 'Approve projects, materials, and change orders',
    roles: ['admin', 'sales'],
  },
  {
    id: 'proposals',
    name: 'Proposals',
    icon: FileText,
    href: '/proposals',
    description: 'Create and manage proposals',
    roles: ['admin', 'sales', 'client'],
  },
  {
    id: 'invoices',
    name: 'Invoices',
    icon: Receipt,
    href: '/invoices',
    description: 'Create and manage invoices',
    roles: ['admin', 'sales', 'client'],
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: FileText,
    href: '/reports',
    description: 'View system reports',
    roles: ['admin'],
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: Calendar,
    href: '/schedule',
    description: 'Manage project schedules',
    roles: ['admin', 'pm'],
  },
  {
    id: 'change-order',
    name: 'Change Order',
    icon: FileText,
    href: '/change-order',
    description: 'Manage change order requests',
    roles: ['admin', 'pm'],
  },
  {
    id: 'material-request',
    name: 'Material Request',
    icon: Package,
    href: '/material-request',
    description: 'Manage material requests',
    roles: ['admin', 'pm'],
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/settings',
    description: 'System settings',
    roles: ['admin', 'pm', 'sales', 'office', 'client'],
  },
];

export default function PermissionsScreen() {
  const { userRole, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, Role[]>>({});
  const [pagePermissions, setPagePermissions] = useState<Record<string, Record<Role, PermissionType>>>({});
  const [selectedRole, setSelectedRole] = useState<Role>('admin');

  // Only admin can access this page
  if (userRole !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.subtitle}>Only administrators can access this page</Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permissionsRef = doc(db, 'permissions', 'pagePermissions');
      const permissionsSnap = await getDoc(permissionsRef);
      
      if (permissionsSnap.exists()) {
        const data = permissionsSnap.data();
        setPermissions(data.pageAccess || {});
        setPagePermissions(data.pagePermissions || {});
      } else {
        // Initialize with default permissions
        const defaultPermissions: Record<string, Role[]> = {};
        const defaultPagePermissions: Record<string, Record<Role, PermissionType>> = {};
        
        allPages.forEach(page => {
          defaultPermissions[page.id] = page.roles;
          // Set default permissions based on page and role
          defaultPagePermissions[page.id] = getDefaultPagePermissions(page.id);
        });
        
        setPermissions(defaultPermissions);
        setPagePermissions(defaultPagePermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      Alert.alert('Error', 'Failed to load permissions');
      // Use default permissions on error
      const defaultPermissions: Record<string, Role[]> = {};
      const defaultPagePermissions: Record<string, Record<Role, PermissionType>> = {};
      
      allPages.forEach(page => {
        defaultPermissions[page.id] = page.roles;
        defaultPagePermissions[page.id] = getDefaultPagePermissions(page.id);
      });
      
      setPermissions(defaultPermissions);
      setPagePermissions(defaultPagePermissions);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPagePermissions = (pageId: string): Record<Role, PermissionType> => {
    // Default permissions for each page and role
    const defaults: Record<string, Record<Role, PermissionType>> = {
      'projects': {
        admin: 'edit',
        pm: 'edit',
        sales: 'view',
        office: 'view',
        client: 'view', // Client can only view their own projects
      },
      'proposals': {
        admin: 'edit',
        pm: 'view',
        sales: 'edit',
        office: 'view',
        client: 'view', // Client can only approve proposals
      },
      'invoices': {
        admin: 'edit',
        pm: 'view',
        sales: 'edit',
        office: 'view',
        client: 'view', // Client can only view invoices
      },
      'team': {
        admin: 'edit',
        pm: 'none',
        sales: 'none',
        office: 'none',
        client: 'none',
      },
      'clients': {
        admin: 'edit',
        pm: 'view',
        sales: 'edit',
        office: 'view',
        client: 'none',
      },
      'leads': {
        admin: 'edit',
        pm: 'view',
        sales: 'edit',
        office: 'view',
        client: 'none',
      },
      'reports': {
        admin: 'edit',
        pm: 'view',
        sales: 'view',
        office: 'view',
        client: 'none',
      },
      'time-clock': {
        admin: 'edit',
        pm: 'edit',
        sales: 'edit',
        office: 'edit',
        client: 'none',
      },
      'project-approval': {
        admin: 'edit',
        pm: 'view',
        sales: 'view',
        office: 'view',
        client: 'none',
      },
      'change-order': {
        admin: 'edit',
        pm: 'edit',
        sales: 'view',
        office: 'view',
        client: 'none',
      },
      'material-request': {
        admin: 'edit',
        pm: 'edit',
        sales: 'view',
        office: 'view',
        client: 'none',
      },
      'schedule': {
        admin: 'edit',
        pm: 'edit',
        sales: 'view',
        office: 'view',
        client: 'none',
      },
      'hr': {
        admin: 'edit',
        pm: 'none',
        sales: 'none',
        office: 'none',
        client: 'none',
      },
      'sales-report': {
        admin: 'edit',
        pm: 'view',
        sales: 'edit',
        office: 'view',
        client: 'none',
      },
      'settings': {
        admin: 'edit',
        pm: 'view',
        sales: 'view',
        office: 'view',
        client: 'view',
      },
    };

    return defaults[pageId] || {
      admin: 'edit',
      pm: 'view',
      sales: 'view',
      office: 'view',
      client: 'none',
    };
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const permissionsRef = doc(db, 'permissions', 'pagePermissions');
      await setDoc(permissionsRef, {
        pageAccess: permissions,
        pagePermissions: pagePermissions,
      });
      
      // Clear permission cache so changes take effect immediately
      const { PermissionService } = await import('@/services/permissionService');
      PermissionService.clearCache();
      
      Alert.alert('Success', 'Permissions saved successfully. Please refresh the page to see changes.');
    } catch (error) {
      console.error('Error saving permissions:', error);
      Alert.alert('Error', 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const togglePageForRole = (pageId: string, role: Role) => {
    setPermissions(prev => {
      const pageRoles = prev[pageId] || [];
      const newRoles = pageRoles.includes(role)
        ? pageRoles.filter(r => r !== role)
        : [...pageRoles, role];
      return {
        ...prev,
        [pageId]: newRoles,
      };
    });
    
    // Update page permissions - if page is removed, set to 'none', otherwise keep current or set default
    setPagePermissions(prev => {
      const pageRoles = permissions[pageId] || [];
      const isEnabled = pageRoles.includes(role);
      
      if (!isEnabled) {
        // Page is being enabled, set default permission
        const current = prev[pageId] || {};
        return {
          ...prev,
          [pageId]: {
            ...current,
            [role]: getDefaultPagePermissions(pageId)[role],
          },
        };
      } else {
        // Page is being disabled, set to 'none'
        const current = prev[pageId] || {};
        return {
          ...prev,
          [pageId]: {
            ...current,
            [role]: 'none',
          },
        };
      }
    });
  };

  const setPagePermission = (pageId: string, role: Role, permission: PermissionType) => {
    setPagePermissions(prev => {
      const current = prev[pageId] || {};
      return {
        ...prev,
        [pageId]: {
          ...current,
          [role]: permission,
        },
      };
    });
  };

  const getPagesForRole = (role: Role) => {
    return allPages.filter(page => {
      const pageRoles = permissions[page.id] || page.roles;
      return pageRoles.includes(role);
    });
  };

  const roles: Role[] = ['admin', 'pm', 'sales', 'office', 'client'];
  const roleLabels: Record<Role, string> = {
    admin: 'Admin',
    pm: 'PM',
    sales: 'Sales',
    office: 'Office',
    client: 'Client',
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading permissions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? <TopNavigationBar /> : <HamburgerMenu />}
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/');
            }
          }}
        >
          <ArrowLeft size={24} color="#ffcc00" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Permissions</Text>
          <Text style={styles.subtitle}>
            Manage which pages are visible to each role
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePermissions}
          disabled={saving}
        >
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Role Tabs */}
        <View style={styles.roleTabs}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleTab,
                selectedRole === role && styles.roleTabActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.roleTabText,
                  selectedRole === role && styles.roleTabTextActive,
                ]}
              >
                {roleLabels[role]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pages for Selected Role */}
        <ScrollView style={styles.pagesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleTitle}>
              Pages visible to {roleLabels[selectedRole]}
            </Text>
            <Text style={styles.roleSubtitle}>
              {getPagesForRole(selectedRole).length} pages
            </Text>
          </View>

          <View style={styles.pagesList}>
            {allPages.map((page) => {
              const Icon = page.icon;
              const pageRoles = permissions[page.id] || page.roles;
              const isEnabled = pageRoles.includes(selectedRole);
              const currentPermission = pagePermissions[page.id]?.[selectedRole] || (isEnabled ? getDefaultPagePermissions(page.id)[selectedRole] : 'none');

              return (
                <View key={page.id} style={styles.pageCard}>
                  <View style={styles.pageInfo}>
                    <View style={[styles.pageIcon, isEnabled && styles.pageIconEnabled]}>
                      <Icon size={24} color={isEnabled ? '#236ecf' : '#9ca3af'} />
                    </View>
                    <View style={styles.pageDetails}>
                      <Text style={styles.pageName}>{page.name}</Text>
                      <Text style={styles.pageDescription}>{page.description}</Text>
                      <Text style={styles.pageHref}>{page.href}</Text>
                    </View>
                  </View>
                  <View style={styles.permissionControls}>
                    {isEnabled && (
                      <View style={styles.permissionButtons}>
                        <TouchableOpacity
                          style={[
                            styles.permissionButton,
                            currentPermission === 'view' && styles.permissionButtonActive,
                          ]}
                          onPress={() => setPagePermission(page.id, selectedRole, 'view')}
                        >
                          <Text style={[
                            styles.permissionButtonText,
                            currentPermission === 'view' && styles.permissionButtonTextActive,
                          ]}>
                            View
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.permissionButton,
                            currentPermission === 'edit' && styles.permissionButtonActive,
                          ]}
                          onPress={() => setPagePermission(page.id, selectedRole, 'edit')}
                        >
                          <Text style={[
                            styles.permissionButtonText,
                            currentPermission === 'edit' && styles.permissionButtonTextActive,
                          ]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        isEnabled && styles.toggleButtonEnabled,
                      ]}
                      onPress={() => togglePageForRole(page.id, selectedRole)}
                    >
                      <View
                        style={[
                          styles.toggleCircle,
                          isEnabled && styles.toggleCircleEnabled,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header like other pages
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like other pages
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like other pages
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#236ecf',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    } : {}),
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#236ecf',
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  pagesContainer: {
    flex: 1,
  },
  roleHeader: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff', // White text on blue background like other pages
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
  },
  pagesList: {
    gap: 12,
  },
  pageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  pageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIconEnabled: {
    backgroundColor: '#eff6ff',
  },
  pageDetails: {
    flex: 1,
  },
  pageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  pageDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  pageHref: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  toggleButton: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    padding: 2,
  },
  toggleButtonEnabled: {
    backgroundColor: '#236ecf',
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleCircleEnabled: {
    alignSelf: 'flex-end',
  },
  permissionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  permissionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  permissionButtonActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  permissionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  permissionButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background like other pages
    fontWeight: '500',
  },
});


