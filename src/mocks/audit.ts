export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: string;
    avatar?: string;
  };
  actionType: 'ORDER' | 'SETTING' | 'MENU' | 'INVENTORY' | 'STAFF' | 'TABLE';
  action: string;
  details: string;
  metadata?: Record<string, any>;
}

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: {
      name: 'System',
      role: 'Automated',
    },
    actionType: 'ORDER',
    action: 'New Order Received',
    details: 'Order #ORD-1029 created for GH₵ 250.00 via MoMo.',
    metadata: { orderId: 'ORD-1029', value: 250, method: 'momo' },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: {
      name: 'Sarah Johnson',
      role: 'Manager',
    },
    actionType: 'MENU',
    action: 'Menu Item Updated',
    details: 'Updated price of "Grilled Tilapia" from GH₵ 120 to GH₵ 150.',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: {
      name: 'Kwame Mensah',
      role: 'Admin',
    },
    actionType: 'SETTING',
    action: 'Settings Changed',
    details: 'Disabled "New Order Sound" notification.',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actor: {
      name: 'System',
      role: 'Automated',
    },
    actionType: 'ORDER',
    action: 'New Order Received',
    details: 'Order #ORD-1028 created for GH₵ 80.00 via Cash.',
    metadata: { orderId: 'ORD-1028', value: 80, method: 'cash' },
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: {
      name: 'Sarah Johnson',
      role: 'Manager',
    },
    actionType: 'TABLE',
    action: 'Table Edited',
    details: 'Changed Table 4 seats from 4 to 6.',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actor: {
      name: 'Kwame Mensah',
      role: 'Admin',
    },
    actionType: 'INVENTORY',
    action: 'Inventory Restocked',
    details: 'Restocked "Coca-Cola" by 50 units.',
  }
];
