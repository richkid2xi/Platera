export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  table: number;
  items: OrderItem[];
  status: 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Served';
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod?: 'Cash' | 'MoMo' | 'Card' | 'Paystack';
  total: number;
  createdAt: string;
  customerName?: string;
  notes?: string;
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    table: 7,
    items: [
      { name: 'Jollof Rice with Chicken', qty: 2, price: 60, note: 'Extra spicy' },
      { name: 'Fresh Coconut Juice', qty: 2, price: 20 },
    ],
    status: 'New',
    paymentStatus: 'Pending',
    total: 160,
    createdAt: '2026-07-03T15:52:00',
    customerName: 'Kwame A.',
    notes: 'Birthday celebration',
  },
  {
    id: 'ORD-002',
    table: 3,
    items: [
      { name: 'Grilled Tilapia with Banku', qty: 1, price: 80 },
      { name: 'Kelewele', qty: 1, price: 20 },
      { name: 'Sobolo', qty: 1, price: 15 },
    ],
    status: 'New',
    paymentStatus: 'Paid',
    paymentMethod: 'MoMo',
    total: 115,
    createdAt: '2026-07-03T15:48:00',
    customerName: 'Abena M.',
  },
  {
    id: 'ORD-003',
    table: 12,
    items: [
      { name: 'Waakye Special', qty: 3, price: 50 },
      { name: 'Grilled Chicken Wings', qty: 1, price: 35 },
    ],
    status: 'New',
    paymentStatus: 'Pending',
    total: 185,
    createdAt: '2026-07-03T15:45:00',
    customerName: 'Kofi D.',
  },
  {
    id: 'ORD-004',
    table: 5,
    items: [
      { name: 'Fufu with Light Soup', qty: 2, price: 55 },
      { name: 'Fresh Orange Juice', qty: 2, price: 18 },
    ],
    status: 'New',
    paymentStatus: 'Paid',
    paymentMethod: 'Paystack',
    total: 146,
    createdAt: '2026-07-03T15:40:00',
    notes: 'No palm oil in soup',
  },
  {
    id: 'ORD-005',
    table: 9,
    items: [
      { name: 'Red Red (Beans & Plantain)', qty: 1, price: 30 },
      { name: 'Boiled Eggs', qty: 2, price: 8 },
      { name: 'Coca-Cola', qty: 1, price: 12 },
    ],
    status: 'Confirmed',
    paymentStatus: 'Pending',
    total: 58,
    createdAt: '2026-07-03T15:35:00',
    customerName: 'Yaw B.',
  },
  {
    id: 'ORD-006',
    table: 2,
    items: [
      { name: 'Jollof Rice with Chicken', qty: 1, price: 60 },
      { name: 'Kelewele', qty: 1, price: 20 },
      { name: 'Sobolo', qty: 1, price: 15 },
    ],
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    total: 95,
    createdAt: '2026-07-03T15:30:00',
  },
  {
    id: 'ORD-007',
    table: 14,
    items: [
      { name: 'Grilled Tilapia with Banku', qty: 2, price: 80 },
      { name: 'Kontomire Stew', qty: 1, price: 25 },
      { name: 'Fresh Coconut Juice', qty: 2, price: 20 },
    ],
    status: 'Preparing',
    paymentStatus: 'Pending',
    total: 225,
    createdAt: '2026-07-03T15:20:00',
    customerName: 'Akua S.',
    notes: 'One tilapia with extra pepper',
  },
  {
    id: 'ORD-008',
    table: 6,
    items: [
      { name: 'Chicken Wings Platter', qty: 1, price: 45 },
      { name: 'French Fries', qty: 1, price: 20 },
      { name: 'Coca-Cola', qty: 2, price: 12 },
    ],
    status: 'Preparing',
    paymentStatus: 'Paid',
    paymentMethod: 'MoMo',
    total: 89,
    createdAt: '2026-07-03T15:15:00',
  },
  {
    id: 'ORD-009',
    table: 8,
    items: [
      { name: 'Fried Rice with Shrimp', qty: 1, price: 70 },
      { name: 'Spring Rolls', qty: 1, price: 18 },
    ],
    status: 'Preparing',
    paymentStatus: 'Pending',
    total: 88,
    createdAt: '2026-07-03T15:10:00',
    customerName: 'Nana K.',
  },
  {
    id: 'ORD-010',
    table: 11,
    items: [
      { name: 'Banku with Tilapia', qty: 1, price: 75 },
      { name: 'Pepper Sauce', qty: 1, price: 5 },
      { name: ' Malta Guinness', qty: 1, price: 15 },
    ],
    status: 'Preparing',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    total: 95,
    createdAt: '2026-07-03T15:05:00',
  },
  {
    id: 'ORD-011',
    table: 4,
    items: [
      { name: 'Jollof Rice with Chicken', qty: 2, price: 60 },
      { name: 'Grilled Tilapia with Banku', qty: 1, price: 80 },
      { name: 'Kelewele', qty: 2, price: 20 },
      { name: 'Fresh Orange Juice', qty: 3, price: 18 },
    ],
    status: 'Ready',
    paymentStatus: 'Paid',
    paymentMethod: 'Paystack',
    total: 314,
    createdAt: '2026-07-03T14:50:00',
    customerName: 'Family of 5',
    notes: 'Large party, serve together',
  },
  {
    id: 'ORD-012',
    table: 1,
    items: [
      { name: 'Waakye Special', qty: 1, price: 50 },
      { name: 'Shito', qty: 1, price: 5 },
    ],
    status: 'Ready',
    paymentStatus: 'Pending',
    total: 55,
    createdAt: '2026-07-03T14:45:00',
  },
  {
    id: 'ORD-013',
    table: 15,
    items: [
      { name: 'Fufu with Light Soup', qty: 1, price: 55 },
      { name: 'Goat Meat', qty: 1, price: 40 },
    ],
    status: 'Served',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    total: 95,
    createdAt: '2026-07-03T14:20:00',
    customerName: 'Efua A.',
  },
  {
    id: 'ORD-014',
    table: 10,
    items: [
      { name: 'Red Red (Beans & Plantain)', qty: 1, price: 30 },
      { name: 'Gari Soaking', qty: 1, price: 15 },
    ],
    status: 'Served',
    paymentStatus: 'Paid',
    paymentMethod: 'MoMo',
    total: 45,
    createdAt: '2026-07-03T14:15:00',
  },
  {
    id: 'ORD-015',
    table: 13,
    items: [
      { name: 'Grilled Tilapia with Banku', qty: 1, price: 80 },
      { name: 'Kontomire Stew', qty: 1, price: 25 },
      { name: 'Fresh Coconut Juice', qty: 1, price: 20 },
    ],
    status: 'Served',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    total: 125,
    createdAt: '2026-07-03T14:00:00',
    customerName: 'Maame Yaa',
  },
];

export const orderColumns = ['New', 'Confirmed', 'Preparing', 'Ready', 'Served'] as const;

export const statusColors: Record<string, string> = {
  New: 'bg-primary-500',
  Confirmed: 'bg-accent-500',
  Preparing: 'bg-amber-500',
  Ready: 'bg-secondary-500',
  Served: 'bg-foreground-400',
};

export const statusBgColors: Record<string, string> = {
  New: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  Confirmed: 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800',
  Preparing: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  Ready: 'bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800',
  Served: 'bg-foreground-50 dark:bg-foreground-800/30 border-foreground-200 dark:border-foreground-700',
};

export function getWaitTimeColor(minutes: number): { color: string; label: string } {
  if (minutes <= 10) return { color: 'text-secondary-600', label: 'On time' };
  if (minutes <= 20) return { color: 'text-amber-600', label: 'Getting there' };
  if (minutes <= 35) return { color: 'text-orange-600', label: 'Slow' };
  return { color: 'text-red-600', label: 'Overdue' };
}

export function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function calculateWaitTime(createdAt: string): number {
  const now = new Date('2026-07-03T16:00:00').getTime();
  const created = new Date(createdAt).getTime();
  return Math.floor((now - created) / 60000);
}