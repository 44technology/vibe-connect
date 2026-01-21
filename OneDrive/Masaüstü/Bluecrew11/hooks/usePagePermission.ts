import { useState, useEffect } from 'react';
import { PermissionService } from '@/services/permissionService';

type Role = 'admin' | 'pm' | 'sales' | 'office' | 'client';
type PermissionType = 'view' | 'edit' | 'none';

export function usePagePermission(pageId: string, userRole: Role) {
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [permission, setPermission] = useState<PermissionType>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        
        // Admin always has edit permission
        if (userRole === 'admin') {
          setCanView(true);
          setCanEdit(true);
          setPermission('edit');
          setLoading(false);
          return;
        }

        // Check page access
        const hasAccess = await PermissionService.hasPageAccess(pageId, userRole);
        if (!hasAccess) {
          setCanView(false);
          setCanEdit(false);
          setPermission('none');
          setLoading(false);
          return;
        }

        // Get permission type
        const perm = await PermissionService.getPagePermission(pageId, userRole);
        setPermission(perm);
        setCanView(perm !== 'none');
        setCanEdit(perm === 'edit');
      } catch (error) {
        console.error('Error checking permission:', error);
        // Default: no access
        setCanView(false);
        setCanEdit(false);
        setPermission('none');
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [pageId, userRole]);

  return { canView, canEdit, permission, loading };
}











