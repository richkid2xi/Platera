export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastLogin: string;
  generatedPassword?: string;
  firstLogin: boolean;
}

export type StaffRole = 'Manager' | 'Owner' | 'Waitress' | 'Waiter' | 'Cook' | 'Kitchen Supervisor' | 'Accountant' | 'Bartender' | 'Cleaner' | 'Host';

export interface RolePermission {
  role: StaffRole;
  label: string;
  icon: string;
  permissions: PermissionSet;
}

export interface PermissionSet {
  dashboard: boolean;
  liveOrders: boolean;
  menu: boolean;
  tables: boolean;
  inventory: boolean;
  reports: boolean;
  feedback: boolean;
  staff: boolean;
  settings: boolean;
}

export const allRoles: RolePermission[] = [
  {
    role: 'Owner',
    label: 'Owner',
    icon: 'ri-vip-crown-line',
    permissions: { dashboard: true, liveOrders: true, menu: true, tables: true, inventory: true, reports: true, feedback: true, staff: true, settings: true },
  },
  {
    role: 'Manager',
    label: 'Manager',
    icon: 'ri-user-star-line',
    permissions: { dashboard: true, liveOrders: true, menu: true, tables: true, inventory: true, reports: true, feedback: true, staff: true, settings: false },
  },
  {
    role: 'Accountant',
    label: 'Accountant',
    icon: 'ri-calculator-line',
    permissions: { dashboard: true, liveOrders: false, menu: false, tables: false, inventory: true, reports: true, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Kitchen Supervisor',
    label: 'Kitchen Supervisor',
    icon: 'ri-restaurant-line',
    permissions: { dashboard: true, liveOrders: true, menu: true, tables: false, inventory: true, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Cook',
    label: 'Cook',
    icon: 'ri-knife-line',
    permissions: { dashboard: false, liveOrders: true, menu: false, tables: false, inventory: true, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Waitress',
    label: 'Waitress',
    icon: 'ri-women-line',
    permissions: { dashboard: false, liveOrders: true, menu: false, tables: true, inventory: false, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Waiter',
    label: 'Waiter',
    icon: 'ri-men-line',
    permissions: { dashboard: false, liveOrders: true, menu: false, tables: true, inventory: false, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Bartender',
    label: 'Bartender',
    icon: 'ri-goblet-line',
    permissions: { dashboard: false, liveOrders: true, menu: false, tables: false, inventory: true, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Host',
    label: 'Host',
    icon: 'ri-user-smile-line',
    permissions: { dashboard: false, liveOrders: false, menu: false, tables: true, inventory: false, reports: false, feedback: false, staff: false, settings: false },
  },
  {
    role: 'Cleaner',
    label: 'Cleaner',
    icon: 'ri-brush-line',
    permissions: { dashboard: false, liveOrders: false, menu: false, tables: false, inventory: false, reports: false, feedback: false, staff: false, settings: false },
  },
];

export const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: 'Kwame Owusu',
    email: 'kwame@platera.app',
    role: 'Owner',
    status: 'active',
    joinedDate: '2026-01-15',
    lastLogin: '2026-07-03T08:30:00',
    firstLogin: false,
  },
  {
    id: 2,
    name: 'Ama Serwaa',
    email: 'ama@platera.app',
    role: 'Manager',
    status: 'active',
    joinedDate: '2026-02-01',
    lastLogin: '2026-07-03T09:15:00',
    firstLogin: false,
  },
  {
    id: 3,
    name: 'Kofi Mensah',
    email: 'kofi@platera.app',
    role: 'Accountant',
    status: 'active',
    joinedDate: '2026-03-10',
    lastLogin: '2026-07-02T16:45:00',
    firstLogin: false,
  },
  {
    id: 4,
    name: 'Akosua Boatemaa',
    email: 'akosua@platera.app',
    role: 'Kitchen Supervisor',
    status: 'active',
    joinedDate: '2026-02-15',
    lastLogin: '2026-07-03T07:00:00',
    firstLogin: false,
  },
  {
    id: 5,
    name: 'Yaw Donkor',
    email: 'yaw@platera.app',
    role: 'Cook',
    status: 'active',
    joinedDate: '2026-04-01',
    lastLogin: '2026-07-03T06:30:00',
    firstLogin: false,
  },
  {
    id: 6,
    name: 'Abigail Adjei',
    email: 'abigail@platera.app',
    role: 'Waitress',
    status: 'active',
    joinedDate: '2026-05-12',
    lastLogin: '2026-07-03T10:00:00',
    firstLogin: false,
  },
  {
    id: 7,
    name: 'Emmanuel Tetteh',
    email: 'emmanuel@platera.app',
    role: 'Waiter',
    status: 'active',
    joinedDate: '2026-05-12',
    lastLogin: '2026-07-03T10:05:00',
    firstLogin: false,
  },
  {
    id: 8,
    name: 'Comfort Dede',
    email: 'comfort@platera.app',
    role: 'Bartender',
    status: 'active',
    joinedDate: '2026-06-01',
    lastLogin: '2026-07-03T11:00:00',
    firstLogin: false,
  },
  {
    id: 9,
    name: 'Richard Nyarko',
    email: 'richard@platera.app',
    role: 'Host',
    status: 'active',
    joinedDate: '2026-06-15',
    lastLogin: '2026-07-03T08:00:00',
    firstLogin: false,
  },
  {
    id: 10,
    name: 'Grace Asare',
    email: 'grace@platera.app',
    role: 'Cleaner',
    status: 'active',
    joinedDate: '2026-06-20',
    lastLogin: '2026-07-02T22:00:00',
    firstLogin: false,
  },
  {
    id: 11,
    name: 'Daniel Amoah',
    email: 'daniel@platera.app',
    role: 'Cook',
    status: 'inactive',
    joinedDate: '2026-04-15',
    lastLogin: '2026-06-20T14:30:00',
    firstLogin: false,
  },
];

export const permissionLabels: Record<keyof PermissionSet, string> = {
  dashboard: 'Dashboard',
  liveOrders: 'Live Orders',
  menu: 'Menu Management',
  tables: 'Tables & QR Codes',
  inventory: 'Inventory',
  reports: 'Sales & Reports',
  feedback: 'Customer Feedback',
  staff: 'Staff Management',
  settings: 'Restaurant Settings',
};

export const permissionIcons: Record<keyof PermissionSet, string> = {
  dashboard: 'ri-dashboard-3-line',
  liveOrders: 'ri-list-check-2',
  menu: 'ri-restaurant-2-line',
  tables: 'ri-layout-grid-line',
  inventory: 'ri-archive-line',
  reports: 'ri-bar-chart-2-line',
  staff: 'ri-team-line',
  feedback: 'ri-chat-smile-2-line',
  settings: 'ri-settings-3-line',
};

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}