export const inventoryItems = [
  { id: 1, name: 'Coca-Cola (Bottle)', category: 'Drinks', stock: 3, threshold: 10, unit: 'bottles', lastRestocked: '2026-06-28', supplier: 'Accra Beverages Ltd', costPerUnit: 'GH₵ 5.00', status: 'critical' as const },
  { id: 2, name: 'Fresh Tilapia', category: 'Proteins', stock: 2, threshold: 8, unit: 'kg', lastRestocked: '2026-07-01', supplier: 'Tema Fish Market', costPerUnit: 'GH₵ 45.00', status: 'critical' as const },
  { id: 3, name: 'Jollof Rice Pack', category: 'Dry Goods', stock: 1, threshold: 5, unit: 'packs', lastRestocked: '2026-06-25', supplier: 'Makola Wholesale', costPerUnit: 'GH₵ 85.00', status: 'critical' as const },
  { id: 4, name: 'Plantain', category: 'Produce', stock: 4, threshold: 15, unit: 'bunches', lastRestocked: '2026-06-30', supplier: 'Agbogbloshie Market', costPerUnit: 'GH₵ 12.00', status: 'critical' as const },
  { id: 5, name: 'Tomato Paste', category: 'Condiments', stock: 5, threshold: 12, unit: 'cans', lastRestocked: '2026-06-29', supplier: 'Makola Wholesale', costPerUnit: 'GH₵ 8.00', status: 'critical' as const },
  { id: 6, name: 'Sprite (Bottle)', category: 'Drinks', stock: 8, threshold: 10, unit: 'bottles', lastRestocked: '2026-06-28', supplier: 'Accra Beverages Ltd', costPerUnit: 'GH₵ 5.00', status: 'low' as const },
  { id: 7, name: 'Chicken (Whole)', category: 'Proteins', stock: 6, threshold: 10, unit: 'birds', lastRestocked: '2026-07-02', supplier: 'Darkuman Poultry', costPerUnit: 'GH₵ 55.00', status: 'low' as const },
  { id: 8, name: 'Cooking Oil (5L)', category: 'Dry Goods', stock: 4, threshold: 8, unit: 'containers', lastRestocked: '2026-06-20', supplier: 'Makola Wholesale', costPerUnit: 'GH₵ 120.00', status: 'low' as const },
  { id: 9, name: 'Onions (Bag)', category: 'Produce', stock: 7, threshold: 10, unit: 'bags', lastRestocked: '2026-06-30', supplier: 'Agbogbloshie Market', costPerUnit: 'GH₵ 30.00', status: 'low' as const },
  { id: 10, name: 'Fanta (Bottle)', category: 'Drinks', stock: 15, threshold: 8, unit: 'bottles', lastRestocked: '2026-06-28', supplier: 'Accra Beverages Ltd', costPerUnit: 'GH₵ 5.00', status: 'healthy' as const },
  { id: 11, name: 'Beef (Fresh Cut)', category: 'Proteins', stock: 12, threshold: 8, unit: 'kg', lastRestocked: '2026-07-02', supplier: 'Tudu Butchery', costPerUnit: 'GH₵ 40.00', status: 'healthy' as const },
  { id: 12, name: 'Basmati Rice (Bag)', category: 'Dry Goods', stock: 20, threshold: 8, unit: 'bags', lastRestocked: '2026-06-25', supplier: 'Makola Wholesale', costPerUnit: 'GH₵ 150.00', status: 'healthy' as const },
  { id: 13, name: 'Tomatoes (Crate)', category: 'Produce', stock: 18, threshold: 10, unit: 'crates', lastRestocked: '2026-07-01', supplier: 'Agbogbloshie Market', costPerUnit: 'GH₵ 25.00', status: 'healthy' as const },
  { id: 14, name: 'Malta Guinness', category: 'Drinks', stock: 22, threshold: 10, unit: 'bottles', lastRestocked: '2026-06-28', supplier: 'Accra Beverages Ltd', costPerUnit: 'GH₵ 7.00', status: 'healthy' as const },
  { id: 15, name: 'Goat Meat', category: 'Proteins', stock: 9, threshold: 6, unit: 'kg', lastRestocked: '2026-06-29', supplier: 'Tudu Butchery', costPerUnit: 'GH₵ 50.00', status: 'healthy' as const },
  { id: 16, name: 'Pepper (Fresh)', category: 'Produce', stock: 25, threshold: 10, unit: 'kg', lastRestocked: '2026-07-01', supplier: 'Agbogbloshie Market', costPerUnit: 'GH₵ 15.00', status: 'healthy' as const },
  { id: 17, name: 'Club Beer (Crate)', category: 'Drinks', stock: 30, threshold: 12, unit: 'crates', lastRestocked: '2026-06-28', supplier: 'Accra Brewery', costPerUnit: 'GH₵ 60.00', status: 'healthy' as const },
  { id: 18, name: 'Maggi Cubes (Box)', category: 'Condiments', stock: 40, threshold: 15, unit: 'boxes', lastRestocked: '2026-06-20', supplier: 'Makola Wholesale', costPerUnit: 'GH₵ 18.00', status: 'healthy' as const },
  { id: 19, name: 'Gari (Bag)', category: 'Dry Goods', stock: 14, threshold: 6, unit: 'bags', lastRestocked: '2026-06-25', supplier: 'Madina Market', costPerUnit: 'GH₵ 40.00', status: 'healthy' as const },
  { id: 20, name: 'Shito (Jar)', category: 'Condiments', stock: 35, threshold: 12, unit: 'jars', lastRestocked: '2026-06-22', supplier: 'Local Kitchen Supply', costPerUnit: 'GH₵ 10.00', status: 'healthy' as const },
];

export const inventoryCategories = ['All', 'Drinks', 'Proteins', 'Dry Goods', 'Produce', 'Condiments'];

export const inventoryStats = {
  totalItems: 20,
  lowStockCount: 8,
  criticalCount: 5,
  healthyCount: 12,
  totalValue: 'GH₵ 8,945',
};

export interface SaleRecord {
  id: number;
  itemName: string;
  category: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  date: string;
  time: string;
}

export const recentSales: SaleRecord[] = [
  { id: 1, itemName: 'Club Beer (Crate)', category: 'Drinks', qty: 3, unit: 'crates', unitPrice: 120, total: 360, date: '2026-07-03', time: '14:25' },
  { id: 2, itemName: 'Chicken (Whole)', category: 'Proteins', qty: 2, unit: 'birds', unitPrice: 110, total: 220, date: '2026-07-03', time: '13:10' },
  { id: 3, itemName: 'Onions (Bag)', category: 'Produce', qty: 1, unit: 'bags', unitPrice: 55, total: 55, date: '2026-07-03', time: '12:40' },
  { id: 4, itemName: 'Fanta (Bottle)', category: 'Drinks', qty: 5, unit: 'bottles', unitPrice: 12, total: 60, date: '2026-07-03', time: '11:15' },
  { id: 5, itemName: 'Beef (Fresh Cut)', category: 'Proteins', qty: 3, unit: 'kg', unitPrice: 80, total: 240, date: '2026-07-02', time: '19:30' },
  { id: 6, itemName: 'Maggi Cubes (Box)', category: 'Condiments', qty: 2, unit: 'boxes', unitPrice: 35, total: 70, date: '2026-07-02', time: '16:45' },
  { id: 7, itemName: 'Gari (Bag)', category: 'Dry Goods', qty: 2, unit: 'bags', unitPrice: 75, total: 150, date: '2026-07-02', time: '14:00' },
  { id: 8, itemName: 'Shito (Jar)', category: 'Condiments', qty: 4, unit: 'jars', unitPrice: 20, total: 80, date: '2026-07-02', time: '11:20' },
  { id: 9, itemName: 'Basmati Rice (Bag)', category: 'Dry Goods', qty: 1, unit: 'bags', unitPrice: 280, total: 280, date: '2026-07-01', time: '20:10' },
  { id: 10, itemName: 'Goat Meat', category: 'Proteins', qty: 2, unit: 'kg', unitPrice: 95, total: 190, date: '2026-07-01', time: '17:30' },
  { id: 11, itemName: 'Pepper (Fresh)', category: 'Produce', qty: 3, unit: 'kg', unitPrice: 25, total: 75, date: '2026-07-01', time: '15:00' },
  { id: 12, itemName: 'Malta Guinness', category: 'Drinks', qty: 6, unit: 'bottles', unitPrice: 15, total: 90, date: '2026-07-01', time: '12:30' },
];