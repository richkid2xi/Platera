export type UserRole = 'owner' | 'manager' | 'staff';

export const NAV_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['owner', 'manager', 'staff'],
  '/orders': ['owner', 'manager', 'staff'],
  '/menu': ['owner', 'manager'],
  '/tables': ['owner', 'manager', 'staff'],
  '/inventory': ['owner', 'manager', 'staff'],
  '/reports': ['owner', 'manager'],
  '/feedback': ['owner', 'manager'],
  '/staff': ['owner', 'manager'],
  '/settings': ['owner'],
  '/audit': ['owner', 'manager'],
};
