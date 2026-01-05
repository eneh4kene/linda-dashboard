'use client';

import { useAuth } from '@/lib/auth-context';
import { Permission, hasPermission } from '@/lib/rbac';

export function useRBAC() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some((permission) => hasPermission(user.role, permission));
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every((permission) => hasPermission(user.role, permission));
  };

  return {
    can,
    canAny,
    canAll,
    role: user?.role,
    user,
  };
}
