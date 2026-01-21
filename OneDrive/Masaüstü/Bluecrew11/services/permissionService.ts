import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Role = 'admin' | 'pm' | 'sales' | 'office' | 'client';
type PermissionType = 'view' | 'edit' | 'none';

let cachedPermissions: Record<string, Role[]> | null = null;
let cachedPagePermissions: Record<string, Record<Role, PermissionType>> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export class PermissionService {
  static async loadPermissions(): Promise<{
    pageAccess: Record<string, Role[]>;
    pagePermissions: Record<string, Record<Role, PermissionType>>;
  }> {
    // Use cache if available and not expired
    const now = Date.now();
    if (cachedPermissions && cachedPagePermissions && (now - lastFetchTime) < CACHE_DURATION) {
      return {
        pageAccess: cachedPermissions,
        pagePermissions: cachedPagePermissions,
      };
    }

    try {
      const permissionsRef = doc(db, 'permissions', 'pagePermissions');
      const permissionsSnap = await getDoc(permissionsRef);
      
      if (permissionsSnap.exists()) {
        const data = permissionsSnap.data();
        cachedPermissions = data.pageAccess || {};
        cachedPagePermissions = data.pagePermissions || {};
        lastFetchTime = now;
        return {
          pageAccess: cachedPermissions,
          pagePermissions: cachedPagePermissions,
        };
      }
      
      // Return empty if no permissions set
      return {
        pageAccess: {},
        pagePermissions: {},
      };
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Return cached data if available, otherwise empty
      return {
        pageAccess: cachedPermissions || {},
        pagePermissions: cachedPagePermissions || {},
      };
    }
  }

  static async hasPageAccess(pageId: string, role: Role): Promise<boolean> {
    const { pageAccess } = await this.loadPermissions();
    
    // Default permissions for pages (if not set in Firebase)
    const defaultPermissions: Record<string, Role[]> = {
      'projects': ['admin', 'pm', 'sales', 'office', 'client'],
      'team': ['admin'],
      'hr': ['admin'],
      'payroll': ['admin'],
      'commission': ['admin'],
      'leads': ['admin', 'sales'],
      'clients': ['admin', 'sales'],
      'sales-report': ['admin', 'sales'], // Client cannot access
      'time-clock': ['admin', 'pm', 'sales', 'office'], // Client cannot access
      'project-approval': ['admin', 'sales'],
      'proposals': ['admin', 'sales', 'client'],
      'invoices': ['admin', 'sales', 'client'], // Client can view only
      'tracking': ['admin', 'pm'],
      'expenses': ['admin'],
      'reports': ['admin'],
      'schedule': ['admin', 'pm'],
      'change-order': ['admin', 'pm'],
      'material-request': ['admin', 'pm'],
      'settings': ['admin', 'pm', 'sales', 'office', 'client'],
      'permissions': ['admin'],
      'daily-logs': ['admin', 'pm', 'sales', 'office'], // Client cannot access
    };
    
    // If no permissions set in Firebase, use default permissions
    if (Object.keys(pageAccess).length === 0) {
      const defaultRoles = defaultPermissions[pageId] || [];
      return defaultRoles.includes(role);
    }
    
    const pageRoles = pageAccess[pageId] || [];
    // If page not in Firebase permissions, check default
    if (pageRoles.length === 0) {
      const defaultRoles = defaultPermissions[pageId] || [];
      return defaultRoles.includes(role);
    }
    
    return pageRoles.includes(role);
  }

  static async getPagePermission(pageId: string, role: Role): Promise<PermissionType> {
    const { pagePermissions } = await this.loadPermissions();
    
    // Default page permissions (if not set in Firebase)
    const defaultPagePermissions: Record<string, Record<Role, PermissionType>> = {
      'invoices': {
        'admin': 'edit',
        'pm': 'view',
        'sales': 'edit',
        'office': 'view',
        'client': 'view', // Client can only view invoices
      },
      'daily-logs': {
        'admin': 'edit',
        'pm': 'edit',
        'sales': 'view',
        'office': 'view',
        'client': 'none', // Client cannot access daily logs
      },
      'projects': {
        'admin': 'edit',
        'pm': 'edit',
        'sales': 'edit',
        'office': 'view',
        'client': 'view', // Client can view projects but not edit or assign PMs
      },
    };
    
    // If no permissions set in Firebase, use defaults
    if (Object.keys(pagePermissions).length === 0) {
      const defaultPerm = defaultPagePermissions[pageId]?.[role];
      if (defaultPerm) return defaultPerm;
      return role === 'admin' ? 'edit' : 'view';
    }
    
    return pagePermissions[pageId]?.[role] || 'none';
  }

  static clearCache() {
    cachedPermissions = null;
    cachedPagePermissions = null;
    lastFetchTime = 0;
  }
}

