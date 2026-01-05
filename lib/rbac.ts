// Role-Based Access Control (RBAC) Configuration

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export type Permission =
  | 'view:dashboard'
  | 'view:residents'
  | 'create:resident'
  | 'edit:resident'
  | 'delete:resident'
  | 'view:calls'
  | 'view:concerns'
  | 'action:concerns'
  | 'view:lifebooks'
  | 'create:lifebook'
  | 'view:reports'
  | 'view:facilities'
  | 'create:facility'
  | 'edit:facility'
  | 'delete:facility';

// Define permissions for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'view:dashboard',
    'view:residents',
    'create:resident',
    'edit:resident',
    'delete:resident',
    'view:calls',
    'view:concerns',
    'action:concerns',
    'view:lifebooks',
    'create:lifebook',
    'view:reports',
    'view:facilities',
    'create:facility',
    'edit:facility',
    'delete:facility',
  ],
  MANAGER: [
    'view:dashboard',
    'view:residents',
    'create:resident',
    'edit:resident',
    'view:calls',
    'view:concerns',
    'action:concerns',
    'view:lifebooks',
    'create:lifebook',
    'view:reports',
    'view:facilities', // Can view but not modify
  ],
  STAFF: [
    'view:dashboard',
    'view:residents',
    'view:calls',
    'view:concerns',
    'view:lifebooks',
  ],
};

// Navigation items with required permissions
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  requiredPermission?: Permission;
}

export const navigation: NavItem[] = [
  { name: 'Overview', href: '/', icon: '📊', requiredPermission: 'view:dashboard' },
  { name: 'Residents', href: '/residents', icon: '👥', requiredPermission: 'view:residents' },
  { name: 'Calls', href: '/calls', icon: '📞', requiredPermission: 'view:calls' },
  { name: 'Concerns', href: '/concerns', icon: '🚨', requiredPermission: 'view:concerns' },
  { name: 'Life Story Books', href: '/lifebooks', icon: '📖', requiredPermission: 'view:lifebooks' },
  { name: 'Reports', href: '/reports', icon: '📈', requiredPermission: 'view:reports' },
  { name: 'Facilities', href: '/facilities', icon: '🏥', requiredPermission: 'view:facilities' },
];

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Get all permissions for a role
export function getPermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Filter navigation items based on role permissions
export function getAuthorizedNavigation(role: UserRole): NavItem[] {
  return navigation.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });
}
