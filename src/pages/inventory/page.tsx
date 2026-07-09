import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { apiClient } from '@/api/client';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number | string;
  lowStockThreshold: number | string;
  category?: string;
  lastRestockedAt?: string;
}

export default function Inventory() {
  const { user } = useAuth();
  const { isRefreshing } = useRefresh();
  const queryClient = useQueryClient();
  const isStaff = user?.role === 'STAFF';

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showRestock, setShowRestock] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [showSell, setShowSell] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    unit: 'pcs',
    currentStock: 0,
    lowStockThreshold: 10,
    category: '',
  });

  const { data: invData, isLoading: invLoading, refetch: fetchInventory } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory');
      return res.data;
    }
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['inventory', 'logs'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/logs');
      return res.data;
    }
  });

  const items: InventoryItem[] = invData || [];
  
  const salesLog = (logsData || []).map((log: any) => {
    const d = new Date(log.createdAt);
    return {
      id: log.id,
      itemName: log.inventoryItem.name,
      category: log.inventoryItem.category || 'N/A',
      qty: Math.abs(log.changeAmount),
      unitPrice: 0,
      total: 0,
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  const isLoading = isRefreshing || invLoading || logsLoading;

  const { setUnsavedDiff, checkUnsaved, unsavedDiff } = useUnsavedChanges();

  useEffect(() => {
    if (!showItemModal) {
      setUnsavedDiff([]);
      return;
    }
    const diffs: string[] = [];
    if (editingItem) {
      if (formData.name !== editingItem.name) diffs.push(`Name changed to <b>${formData.name}</b>`);
      if (formData.currentStock !== Number(editingItem.currentStock)) diffs.push(`Stock changed to <b>${formData.currentStock}</b>`);
    } else {
      if (formData.name || formData.currentStock > 0) {
        diffs.push(`New unsaved item: <b>${formData.name || 'Untitled'}</b>`);
      }
    }
    setUnsavedDiff(diffs);
  }, [showItemModal, formData, editingItem, setUnsavedDiff]);

  const handleCloseItemModal = () => {
    checkUnsaved(() => {
      setUnsavedDiff([]);
      setShowItemModal(false);
    });
  };

  const categoryOptions = [
    'All Categories',
    ...Array.from(new Set(items.map((item) => item.category).filter((cat): cat is string => Boolean(cat)))),
  ];
  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      unit: 'pcs',
      currentStock: 0,
      lowStockThreshold: 10,
      category: '',
    });
    setShowItemModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      currentStock: Number(item.currentStock),
      lowStockThreshold: Number(item.lowStockThreshold),
      category: item.category || '',
    });
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!formData.name) {
      setToast('Item name is required');
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    try {
      if (editingItem) {
        await apiClient.put(`/inventory/${editingItem.id}`, formData);
        setToast('Item updated successfully!');
      } else {
        await apiClient.post('/inventory', formData);
        setToast('Item added successfully!');
      }

      await fetchInventory();

      setToastType('success');
      setUnsavedDiff([]);
      setShowItemModal(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setToast(err.response?.data?.error || 'Failed to save item');
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const deleteItem = async (id: string) => {
    const previousInventory = queryClient.getQueryData(['inventory', 'all']);
    queryClient.setQueryData(['inventory', 'all'], (old: any) =>
      old ? old.filter((item: any) => item.id !== id) : old
    );

    try {
      await apiClient.delete(`/inventory/${id}`);
      setToast('Item deleted successfully');
      setToastType('success');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      queryClient.setQueryData(['inventory', 'all'], previousInventory);
      setToast(err.response?.data?.error || 'Failed to delete item');
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleRestock = async (id: string) => {
    if (isStaff) return; // Prevent restock for staff
    const amount = Number(restockAmount);
    if (!amount || amount <= 0) return;

    try {
      await apiClient.post(`/inventory/${id}/log`, {
        reason: 'RESTOCK',
        changeAmount: amount,
      });
      await fetchInventory();
      setToast('Stock updated successfully!');
      setToastType('success');
      setShowRestock(null);
      setRestockAmount('');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setToast(err.response?.data?.error || 'Failed to restock');
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSell = async (id: string) => {
    const qty = Number(sellAmount);
    if (!qty || qty <= 0) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    
    if (qty > Number(item.currentStock)) {
      setToast(`Not enough stock! Only ${item.currentStock} available.`);
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    try {
      await apiClient.post(`/inventory/${id}/log`, {
        reason: 'USAGE',
        changeAmount: -qty,
      });
      await fetchInventory();
      
      setToast(`${qty} of ${item.name} used/sold!`);
      setToastType('success');
      setShowSell(null);
      setSellAmount('');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setToast(err.response?.data?.error || 'Failed to log usage');
      setToastType('warning');
      setTimeout(() => setToast(''), 3000);
    }
  };


  const totalItems = items.length;
  const lowStockCount = items.filter(i => (Number(i.currentStock) / Number(i.lowStockThreshold)) <= 1 && (Number(i.currentStock) / Number(i.lowStockThreshold)) > 0.5).length;
  const criticalCount = items.filter(i => (Number(i.currentStock) / Number(i.lowStockThreshold)) <= 0.5).length;
  const healthyCount = items.filter(i => (Number(i.currentStock) / Number(i.lowStockThreshold)) > 1).length;

  const totalSalesToday = 0; // Removing sales aggregation from inventory side, rely on dashboard or reports


  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap ${toastType === 'success' ? 'bg-secondary-500' : 'bg-accent-500'}`}>
          <i className={toastType === 'success' ? 'ri-check-line mr-2' : 'ri-error-warning-line mr-2'}></i>{toast}
        </div>
      )}

      <PageHeader
        title="Inventory"
        description="Track stock levels, manage restocks, and monitor low-stock alerts"
      >
        {!isStaff && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i> Add Item
          </button>
        )}
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Total Items', value: totalItems, icon: 'ri-archive-line', color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Healthy Stock', value: healthyCount, icon: 'ri-check-double-line', color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
          { label: 'Low Stock', value: lowStockCount, icon: 'ri-alert-line', color: 'text-accent-500 bg-accent-50 dark:bg-accent-900/20' },
          { label: 'Critical', value: criticalCount, icon: 'ri-error-warning-line', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
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
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 font-body transition-all"
          />
        </div>
        <div className="w-full sm:w-64 z-10">
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions.map(cat => ({ label: cat, value: cat }))}
            placeholder="All Categories"
            className="w-full text-sm font-medium"
          />
        </div>
      </div>



      {/* Items List */}
      <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 overflow-hidden mb-8">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-background-200 dark:border-foreground-800 text-xs font-semibold text-foreground-400 uppercase tracking-wider font-body">
          <div className="col-span-5">Item</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Stock / Threshold</div>
          <div className="col-span-2 text-right">Actions</div>
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
              return (
                <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 items-center hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors stagger-${Math.min(i + 1, 8)}`}>
                  {/* Item Name */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background-100 dark:bg-foreground-800 text-foreground-400">
                      <i className="ri-box-3-line text-xl"></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-foreground-400 font-body">{item.unit}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2 hidden md:block">
                    <span className="text-sm text-foreground-600 dark:text-foreground-300 font-body">{item.category || '-'}</span>
                  </div>

                  {/* Stock Level */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">
                        {Number(item.currentStock)}
                      </span>
                      <span className="text-sm font-semibold text-foreground-400 font-body">
                        / {Number(item.lowStockThreshold)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <div className="group relative">
                      <button
                        onClick={() => { setShowSell(item.id); setSellAmount(''); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 hover:bg-accent-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      >
                        <i className="ri-shopping-cart-2-line"></i>
                      </button>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground-950 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Sell
                      </div>
                    </div>

                    {!isStaff && (
                      <>
                        <div className="group relative">
                          <button
                            onClick={() => { setShowRestock(item.id); setRestockAmount(''); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <i className="ri-add-line"></i>
                          </button>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground-950 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Restock
                          </div>
                        </div>

                        <div className="group relative">
                          <button
                            onClick={() => openEditModal(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-foreground-900 hover:text-white dark:hover:bg-foreground-100 dark:hover:text-foreground-900 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <i className="ri-pencil-line"></i>
                          </button>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground-950 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Edit
                          </div>
                        </div>

                        <div className="group relative">
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground-950 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Delete
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sell Modal */}
                  {showSell === item.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setShowSell(null)}></div>
                      <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                        <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-1">Record Sale</h3>
                        <p className="text-sm text-foreground-500 mb-4 font-body">{item.name} <span className="text-xs text-foreground-400">({Number(item.currentStock)} in stock)</span></p>
                        <div className="flex flex-col gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Quantity Sold (units)</label>
                            <input
                              type="number"
                              min="1"
                              max={Number(item.currentStock)}
                              value={sellAmount}
                              onChange={(e) => setSellAmount(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                              placeholder={`Max: ${Number(item.currentStock)} units`}
                            />
                            {Number(sellAmount) > 0 && (
                              <div className="mt-2 text-xs font-medium text-foreground-500 bg-background-50 dark:bg-foreground-800/50 p-2 rounded border border-background-200 dark:border-foreground-800">
                                Resulting Stock: <span className="font-bold text-foreground-900 dark:text-foreground-100">{Math.max(0, Number(item.currentStock) - Number(sellAmount))} {item.unit}</span>
                              </div>
                            )}
                          </div>
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
                          <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Quantity to add (units)</label>
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

      {/* Permanent Recent Sales Section */}
      <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 overflow-hidden mb-6 animate-fade-in">
        <div className="px-5 py-3 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
            <i className="ri-shopping-cart-line mr-1.5 text-primary-500"></i>
            Recent Sales &amp; Usage
          </h3>
          <span className="text-xs text-foreground-400 font-body">
            {salesLog.length} records · Today: GH₵ {totalSalesToday.toFixed(2)}
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
            salesLog.map((sale: any) => (
              <div key={sale.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 items-center hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors">
                <div className="md:col-span-3">
                  <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body truncate">{sale.itemName}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-foreground-500 dark:text-foreground-400 font-body">{sale.category}</span>
                </div>
                <div className="md:col-span-1 text-center">
                  <span className="text-sm font-bold text-foreground-700 dark:text-foreground-300 font-body">{sale.qty} units</span>
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

      {/* Add/Edit Modal */}
      {showItemModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 dark:bg-foreground-950/60 backdrop-blur-sm animate-fade-in" onClick={handleCloseItemModal}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-up border border-background-200 dark:border-foreground-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                onClick={handleCloseItemModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-500 hover:bg-background-200 dark:hover:bg-foreground-700 transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="e.g. Coca-Cola"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="e.g. pcs, kg, boxes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Category (Optional)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Category name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Current Stock (units)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </div>

              <button
                onClick={saveItem}
                disabled={unsavedDiff.length === 0}
                className={`w-full mt-4 px-4 py-2.5 rounded-lg font-semibold transition-colors ${unsavedDiff.length > 0 ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
                {editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={() => setDeleteConfirmItem(null)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-1">
                  Delete {deleteConfirmItem.name}?
                </h3>
                <p className="text-sm text-foreground-500 font-body">
                  This will permanently remove <span className="font-semibold text-foreground-700 dark:text-foreground-300">{deleteConfirmItem.name}</span> ({Number(deleteConfirmItem.currentStock)} units) from inventory. This cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteItem(deleteConfirmItem.id); setDeleteConfirmItem(null); }}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
