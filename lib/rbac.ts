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
//
// ROLE SCOPING:
// - ADMIN: Multi-facility (ai4e1 ltd - Linda's vendor)
// - MANAGER: Single-facility (can manage their facility's residents & concerns)
// - STAFF: Single-facility (read-only access to their facility's data)
export const rolePermissions: Record<UserRole, Permission[]> = {
  // ADMIN: Full system access across all facilities
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
    'view:facilities',      // Only ADMIN can see facilities tab
    'create:facility',
    'edit:facility',
    'delete:facility',
  ],
  // MANAGER: Manage their own facility's data (no facilities tab)
  MANAGER: [
    'view:dashboard',
    'view:residents',
    'create:resident',      // Can create residents in their facility
    'edit:resident',        // Can edit residents in their facility
    'delete:resident',      // Can delete residents in their facility
    'view:calls',
    'view:concerns',
    'action:concerns',      // Can action concerns in their facility
    'view:lifebooks',
    'create:lifebook',
    'view:reports',         // Can view reports for their facility
    // NO view:facilities - cannot access facilities tab
  ],
  // STAFF: Read-only access to their facility's data
  STAFF: [
    'view:dashboard',
    'view:residents',       // Read-only
    'view:calls',           // Read-only
    'view:concerns',        // Read-only (cannot action)
    'view:lifebooks',       // Read-only
    // NO view:reports - cannot access reports
    // NO view:facilities - cannot access facilities
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
