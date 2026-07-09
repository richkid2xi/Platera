export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export const NAV_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['OWNER', 'MANAGER', 'STAFF'],
  '/orders': ['OWNER', 'MANAGER', 'STAFF'],
  '/menu': ['OWNER', 'MANAGER'],
  '/tables': ['OWNER', 'MANAGER', 'STAFF'],
  '/inventory': ['OWNER', 'MANAGER', 'STAFF'],
  '/reports': ['OWNER', 'MANAGER'],
  '/reconciliation': ['OWNER', 'MANAGER'],
  '/feedback': ['OWNER', 'MANAGER'],
  '/staff': ['OWNER', 'MANAGER'],
  '/settings': ['OWNER'],
  '/audit': ['OWNER', 'MANAGER'],
  '/manual-order': ['OWNER', 'MANAGER', 'STAFF'],
};
