export interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'Empty' | 'Occupied' | 'Awaiting Payment';
  currentOrderId?: string;
  currentOrderTotal?: number;
  qrCodeUrl: string;
  qrLink: string;
}

export const tables: Table[] = [
  { id: 1, number: 1, seats: 2, status: 'Occupied', currentOrderId: 'ORD-012', currentOrderTotal: 55, qrCodeUrl: 'https://platera.app/order?t=1', qrLink: 'https://platera.app/order?t=1' },
  { id: 2, number: 2, seats: 4, status: 'Occupied', currentOrderId: 'ORD-006', currentOrderTotal: 95, qrCodeUrl: 'https://platera.app/order?t=2', qrLink: 'https://platera.app/order?t=2' },
  { id: 3, number: 3, seats: 4, status: 'Occupied', currentOrderId: 'ORD-002', currentOrderTotal: 115, qrCodeUrl: 'https://platera.app/order?t=3', qrLink: 'https://platera.app/order?t=3' },
  { id: 4, number: 4, seats: 6, status: 'Occupied', currentOrderId: 'ORD-011', currentOrderTotal: 314, qrCodeUrl: 'https://platera.app/order?t=4', qrLink: 'https://platera.app/order?t=4' },
  { id: 5, number: 5, seats: 2, status: 'Occupied', currentOrderId: 'ORD-004', currentOrderTotal: 146, qrCodeUrl: 'https://platera.app/order?t=5', qrLink: 'https://platera.app/order?t=5' },
  { id: 6, number: 6, seats: 4, status: 'Occupied', currentOrderId: 'ORD-008', currentOrderTotal: 89, qrCodeUrl: 'https://platera.app/order?t=6', qrLink: 'https://platera.app/order?t=6' },
  { id: 7, number: 7, seats: 4, status: 'Occupied', currentOrderId: 'ORD-001', currentOrderTotal: 160, qrCodeUrl: 'https://platera.app/order?t=7', qrLink: 'https://platera.app/order?t=7' },
  { id: 8, number: 8, seats: 2, status: 'Occupied', currentOrderId: 'ORD-009', currentOrderTotal: 88, qrCodeUrl: 'https://platera.app/order?t=8', qrLink: 'https://platera.app/order?t=8' },
  { id: 9, number: 9, seats: 4, status: 'Occupied', currentOrderId: 'ORD-005', currentOrderTotal: 58, qrCodeUrl: 'https://platera.app/order?t=9', qrLink: 'https://platera.app/order?t=9' },
  { id: 10, number: 10, seats: 2, status: 'Occupied', currentOrderId: 'ORD-014', currentOrderTotal: 45, qrCodeUrl: 'https://platera.app/order?t=10', qrLink: 'https://platera.app/order?t=10' },
  { id: 11, number: 11, seats: 4, status: 'Occupied', currentOrderId: 'ORD-010', currentOrderTotal: 95, qrCodeUrl: 'https://platera.app/order?t=11', qrLink: 'https://platera.app/order?t=11' },
  { id: 12, number: 12, seats: 6, status: 'Occupied', currentOrderId: 'ORD-003', currentOrderTotal: 185, qrCodeUrl: 'https://platera.app/order?t=12', qrLink: 'https://platera.app/order?t=12' },
  { id: 13, number: 13, seats: 2, status: 'Empty', qrCodeUrl: 'https://platera.app/order?t=13', qrLink: 'https://platera.app/order?t=13' },
  { id: 14, number: 14, seats: 4, status: 'Occupied', currentOrderId: 'ORD-007', currentOrderTotal: 225, qrCodeUrl: 'https://platera.app/order?t=14', qrLink: 'https://platera.app/order?t=14' },
  { id: 15, number: 15, seats: 2, status: 'Occupied', currentOrderId: 'ORD-013', currentOrderTotal: 95, qrCodeUrl: 'https://platera.app/order?t=15', qrLink: 'https://platera.app/order?t=15' },
  { id: 16, number: 16, seats: 4, status: 'Empty', qrCodeUrl: 'https://platera.app/order?t=16', qrLink: 'https://platera.app/order?t=16' },
  { id: 17, number: 17, seats: 4, status: 'Awaiting Payment', currentOrderId: 'ORD-016', currentOrderTotal: 170, qrCodeUrl: 'https://platera.app/order?t=17', qrLink: 'https://platera.app/order?t=17' },
  { id: 18, number: 18, seats: 2, status: 'Empty', qrCodeUrl: 'https://platera.app/order?t=18', qrLink: 'https://platera.app/order?t=18' },
  { id: 19, number: 19, seats: 6, status: 'Empty', qrCodeUrl: 'https://platera.app/order?t=19', qrLink: 'https://platera.app/order?t=19' },
  { id: 20, number: 20, seats: 2, status: 'Empty', qrCodeUrl: 'https://platera.app/order?t=20', qrLink: 'https://platera.app/order?t=20' },
];

export const tableStatusConfig: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  Empty: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    border: 'border-secondary-200 dark:border-secondary-800',
    text: 'text-secondary-700 dark:text-secondary-300',
    icon: 'ri-checkbox-blank-circle-line text-secondary-500',
    label: 'Empty',
  },
  Occupied: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    border: 'border-primary-200 dark:border-primary-800',
    text: 'text-primary-700 dark:text-primary-300',
    icon: 'ri-restaurant-line text-primary-500',
    label: 'Occupied',
  },
  'Awaiting Payment': {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    border: 'border-accent-200 dark:border-accent-800',
    text: 'text-accent-700 dark:text-accent-300',
    icon: 'ri-money-dollar-circle-line text-accent-500',
    label: 'Awaiting Payment',
  },
};