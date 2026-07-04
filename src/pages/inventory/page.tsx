import { useState, useRef, useEffect } from 'react';
import { inventoryItems, inventoryCategories, inventoryStats, recentSales } from '@/mocks/inventory';
import type { SaleRecord } from '@/mocks/inventory';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  unit: string;
  lastRestocked: string;
  supplier: string;
  costPerUnit: string;
  status: 'critical' | 'low' | 'healthy';
}

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showRestock, setShowRestock] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [showSell, setShowSell] = useState<number | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [salesLog, setSalesLog] = useState<SaleRecord[]>(recentSales);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [showSalesLog, setShowSalesLog] = useState(false);

  // Inline editing
  const [editingCell, setEditingCell] = useState<{ itemId: number; field: 'name' | 'threshold' | 'supplier' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const startEditing = (itemId: number, field: 'name' | 'threshold' | 'supplier', currentValue: string) => {
    setEditingCell({ itemId, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { itemId, field } = editingCell;
    setItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      if (field === 'threshold') {
        const newThreshold = parseInt(editValue) || item.threshold;
        const newStatus: 'critical' | 'low' | 'healthy' =
          item.stock <= 0 ? 'critical' : item.stock <= newThreshold ? 'low' : 'healthy';
        return { ...item, threshold: newThreshold, status: newStatus };
      }
      if (field === 'name') return { ...item, name: editValue.trim() || item.name };
      if (field === 'supplier') return { ...item, supplier: editValue.trim() || item.supplier };
      return item;
    }));
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleRestock = (id: number) => {
    const amount = parseInt(restockAmount);
    if (!amount || amount <= 0) return;
    setItems((prev) => prev.map((item) =>
      item.id === id
        ? {
            ...item,
            stock: item.stock + amount,
            status: item.stock + amount <= item.threshold ? 'low' as const : 'healthy' as const,
            lastRestocked: new Date().toISOString().split('T')[0],
          }
        : item
    ));
    setToast('Stock updated successfully!');
    setToastType('success');
    setShowRestock(null);
    setRestockAmount('');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSell = (id: number) => {
    const qty = parseInt(sellAmount);
    const price = parseFloat(sellPrice);
    if (!qty || qty <= 0) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (qty > item.stock) {
      setToast(`Not enough stock! Only ${item.stock} ${item.unit} available.`);
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    const newStock = item.stock - qty;
    setItems((prev) => prev.map((i) =>
      i.id === id
        ? {
            ...i,
            stock: newStock,
            status: newStock <= 0 ? 'critical' as const : newStock <= item.threshold ? 'low' as const : 'healthy' as const,
          }
        : i
    ));

    const now = new Date();
    const saleEntry: SaleRecord = {
      id: Date.now(),
      itemName: item.name,
      category: item.category,
      qty,
      unit: item.unit,
      unitPrice: price || 0,
      total: price ? price * qty : 0,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
    setSalesLog((prev) => [saleEntry, ...prev]);

    const revenueText = price ? ` - GH₵ ${(price * qty).toFixed(2)} revenue` : '';
    setToast(`${qty} ${item.unit} of ${item.name} sold${revenueText}!`);
    setToastType('success');
    setShowSell(null);
    setSellAmount('');
    setSellPrice('');
    setTimeout(() => setToast(''), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
      case 'low': return 'bg-accent-50 text-accent-600 border-accent-200 dark:bg-accent-900/20 dark:text-accent-400 dark:border-accent-800/50';
      case 'healthy': return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50';
      default: return 'bg-background-100 text-foreground-600 border-background-200';
    }
  };

  const getStockBarColor = (stock: number, threshold: number) => {
    const ratio = stock / threshold;
    if (ratio <= 0.5) return 'bg-red-500';
    if (ratio <= 1) return 'bg-accent-500';
    return 'bg-secondary-500';
  };

  const totalSalesToday = salesLog
    .filter((s) => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="animate-fade-in">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap ${toastType === 'success' ? 'bg-secondary-500' : 'bg-accent-500'}`}>
          <i className={toastType === 'success' ? 'ri-check-line mr-2' : 'ri-error-warning-line mr-2'}></i>{toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Inventory</h1>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Track stock levels, manage restocks, and monitor low-stock alerts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Total Items', value: inventoryStats.totalItems, icon: 'ri-archive-line', color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Healthy Stock', value: inventoryStats.healthyCount, icon: 'ri-check-double-line', color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
          { label: 'Low Stock', value: inventoryStats.lowStockCount, icon: 'ri-alert-line', color: 'text-accent-500 bg-accent-50 dark:bg-accent-900/20' },
          { label: 'Critical', value: inventoryStats.criticalCount, icon: 'ri-error-warning-line', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
          { label: 'Sales Today', value: `GH₵ ${totalSalesToday}`, icon: 'ri-shopping-cart-line', color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
        ].map((stat, i) => (
          <div key={stat.label} className={`stagger-${i + 1} bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-4 md:p-5 hover-lift`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <i className={`${stat.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{stat.value}</p>
                <p className="text-xs text-foreground-400 font-body">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search items or suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 font-body transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
        >
          {inventoryCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
        >
          <option value="All">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low Stock</option>
          <option value="critical">Critical</option>
        </select>
        <button
          onClick={() => setShowSalesLog(!showSalesLog)}
          className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap font-body ${
            showSalesLog
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border-background-200 dark:border-foreground-800 hover:border-primary-300'
          }`}
        >
          <i className="ri-history-line mr-1.5"></i>
          Recent Sales ({salesLog.length})
        </button>
      </div>

      {/* Recent Sales Log */}
      {showSalesLog && (
        <div className="mb-6 bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 overflow-hidden animate-fade-in-up">
          <div className="px-5 py-3 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
              <i className="ri-shopping-cart-line mr-1.5 text-primary-500"></i>
              Recent Sales
            </h3>
            <span className="text-xs text-foreground-400 font-body">
              {salesLog.length} records · Today: GH₵ {totalSalesToday}
            </span>
          </div>
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-background-100 dark:border-foreground-800 text-[11px] font-semibold text-foreground-400 uppercase tracking-wider font-body">
            <div className="col-span-3">Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Date &amp; Time</div>
          </div>
          <div className="divide-y divide-background-100 dark:divide-foreground-800 max-h-[360px] overflow-y-auto">
            {salesLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-foreground-400">
                <i className="ri-shopping-cart-line text-2xl mb-2"></i>
                <p className="text-sm font-medium font-body">No sales recorded yet</p>
                <p className="text-xs mt-0.5 font-body">Sales will appear here when you record them</p>
              </div>
            ) : (
              salesLog.map((sale) => (
                <div key={sale.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 items-center hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors">
                  <div className="md:col-span-3">
                    <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body truncate">{sale.itemName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-foreground-500 dark:text-foreground-400 font-body">{sale.category}</span>
                  </div>
                  <div className="md:col-span-1 text-center">
                    <span className="text-sm font-bold text-foreground-700 dark:text-foreground-300 font-body">{sale.qty} {sale.unit}</span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <span className="text-sm text-foreground-600 dark:text-foreground-400 font-body">{sale.unitPrice > 0 ? `GH₵ ${sale.unitPrice.toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400 font-heading">{sale.total > 0 ? `GH₵ ${sale.total.toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <span className="text-xs text-foreground-400 font-body">{sale.date} · {sale.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-background-200 dark:border-foreground-800 text-xs font-semibold text-foreground-400 uppercase tracking-wider font-body">
          <div className="col-span-3">Item <span className="text-[10px] font-normal normal-case">(click to edit)</span></div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Stock / Threshold</div>
          <div className="col-span-2">Supplier <span className="text-[10px] font-normal normal-case">(click to edit)</span></div>
          <div className="col-span-1">Unit</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-background-100 dark:divide-foreground-800">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-foreground-400">
              <div className="w-16 h-16 rounded-2xl bg-background-100 dark:bg-foreground-800 flex items-center justify-center mb-4">
                <i className="ri-archive-line text-2xl"></i>
              </div>
              <p className="text-sm font-medium font-body">No items found</p>
              <p className="text-xs mt-1 font-body">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const stockPercent = Math.min((item.stock / item.threshold) * 100, 100);
              const isEditing = editingCell?.itemId === item.id;
              return (
                <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 items-center hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors stagger-${Math.min(i + 1, 8)}`}>
                  {/* Item Name — editable */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background-100 dark:bg-foreground-800 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.category === 'Drinks' ? 'ri-goblet-line' : item.category === 'Proteins' ? 'ri-knife-line' : item.category === 'Dry Goods' ? 'ri-archive-line' : item.category === 'Produce' ? 'ri-leaf-line' : 'ri-flask-line'} text-foreground-500 text-sm`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing && editingCell.field === 'name' ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleEditKeyDown}
                          className="w-full px-2 py-1 text-sm font-semibold rounded border border-primary-300 dark:border-primary-600 bg-white dark:bg-foreground-800 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-1 focus:ring-primary-400 font-body"
                        />
                      ) : (
                        <p
                          onClick={() => startEditing(item.id, 'name', item.name)}
                          className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body truncate cursor-pointer hover:text-primary-500 transition-colors"
                          title="Click to edit name"
                        >
                          {item.name}
                        </p>
                      )}
                      <p className="text-xs text-foreground-400 font-body md:hidden">{item.category} · {item.supplier}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2 hidden md:block">
                    <span className="text-sm text-foreground-600 dark:text-foreground-300 font-body">{item.category}</span>
                  </div>

                  {/* Stock Level */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-background-200 dark:bg-foreground-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getStockBarColor(item.stock, item.threshold)}`}
                          style={{ width: `${stockPercent}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold font-body whitespace-nowrap ${item.status === 'critical' ? 'text-red-500' : item.status === 'low' ? 'text-accent-500' : 'text-secondary-500'}`}>
                        {item.stock}/
                      </span>
                      {isEditing && editingCell.field === 'threshold' ? (
                        <input
                          ref={editInputRef}
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleEditKeyDown}
                          min="1"
                          className="w-14 px-1.5 py-0.5 text-xs font-bold rounded border border-primary-300 dark:border-primary-600 bg-white dark:bg-foreground-800 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-1 focus:ring-primary-400 font-body text-center"
                        />
                      ) : (
                        <span
                          onClick={() => startEditing(item.id, 'threshold', String(item.threshold))}
                          className="text-xs font-bold font-body cursor-pointer hover:text-primary-500 transition-colors"
                          title="Click to edit threshold"
                        >
                          {item.threshold}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-400 mt-1 font-body">
                      Restocked: {item.lastRestocked}
                    </p>
                  </div>

                  {/* Supplier — editable */}
                  <div className="md:col-span-2 hidden md:block">
                    {isEditing && editingCell.field === 'supplier' ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleEditKeyDown}
                        className="w-full px-2 py-1 text-sm rounded border border-primary-300 dark:border-primary-600 bg-white dark:bg-foreground-800 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-1 focus:ring-primary-400 font-body"
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(item.id, 'supplier', item.supplier)}
                        className="text-sm text-foreground-500 dark:text-foreground-400 font-body cursor-pointer hover:text-primary-500 transition-colors"
                        title="Click to edit supplier"
                      >
                        {item.supplier}
                      </span>
                    )}
                  </div>

                  {/* Unit */}
                  <div className="md:col-span-1 hidden md:block">
                    <span className="text-sm text-foreground-400 font-body">{item.unit}</span>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border font-body ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex justify-end gap-1.5">
                    <button
                      onClick={() => { setShowSell(item.id); setSellAmount(''); setSellPrice(''); }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-all cursor-pointer whitespace-nowrap font-body"
                    >
                      <i className="ri-shopping-cart-line mr-1"></i>Sell
                    </button>
                    <button
                      onClick={() => { setShowRestock(item.id); setRestockAmount(''); }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body"
                    >
                      <i className="ri-add-line mr-1"></i>Restock
                    </button>
                  </div>

                  {/* Sell Modal */}
                  {showSell === item.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setShowSell(null)}></div>
                      <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                        <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-1">Record Sale</h3>
                        <p className="text-sm text-foreground-500 mb-4 font-body">{item.name} <span className="text-xs text-foreground-400">({item.stock} {item.unit} in stock)</span></p>
                        <div className="flex flex-col gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Quantity Sold ({item.unit})</label>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={sellAmount}
                              onChange={(e) => setSellAmount(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                              placeholder={`Max: ${item.stock} ${item.unit}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Unit Price (GH₵) <span className="text-foreground-400 font-normal">- optional</span></label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                              placeholder="0.00"
                            />
                          </div>
                          {sellAmount && sellPrice && (
                            <div className="bg-background-50 dark:bg-foreground-800 rounded-lg px-4 py-2.5 flex items-center justify-between">
                              <span className="text-sm text-foreground-600 dark:text-foreground-300 font-body">Estimated Revenue</span>
                              <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400 font-heading">
                                GH₵ {(parseFloat(sellPrice) * parseInt(sellAmount)).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setShowSell(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
                          <button onClick={() => handleSell(item.id)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-all cursor-pointer whitespace-nowrap font-body">Confirm Sale</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restock Modal */}
                  {showRestock === item.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setShowRestock(null)}></div>
                      <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                        <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-1">Restock Item</h3>
                        <p className="text-sm text-foreground-500 mb-4 font-body">{item.name}</p>
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Quantity to add ({item.unit})</label>
                          <input
                            type="number"
                            min="1"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                            placeholder="Enter quantity"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setShowRestock(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
                          <button onClick={() => handleRestock(item.id)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">Confirm Restock</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}