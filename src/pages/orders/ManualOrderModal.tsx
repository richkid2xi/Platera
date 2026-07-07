import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

export default function ManualOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}) {
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState<Array<{ itemId: string; quantity: number; notes: string }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // In a fully integrated flow, this uses react-query to fetch from /api/v1/tables and /api/v1/menu
      apiClient.get('/tables').then(res => setTables(res.data)).catch(() => {});
      apiClient.get('/menu').then(res => {
        const items = res.data.flatMap((category: any) => category.items || []);
        setMenuItems(items);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addItemToCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId, quantity: 1, notes: '' }];
    });
  };

  const updateItemQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.itemId === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleSubmit = async () => {
    if (!selectedTable || cart.length === 0) {
      setError("Please select a table and at least one item.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post('/orders/manual', {
        tableId: selectedTable,
        items: cart.map(c => ({ menuItemId: c.itemId, quantity: c.quantity, notes: c.notes })),
        customerName,
        notes: orderNotes,
        paymentMethod: 'CASH'
      });
      onOrderCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create manual order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background-950/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-foreground-900 w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-background-100 dark:border-foreground-800 shrink-0">
          <h2 className="text-xl font-heading font-black text-foreground-900 dark:text-foreground-100">
            Create Manual Order
          </h2>
          <button onClick={onClose} className="text-foreground-400 hover:text-foreground-600">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-2 text-sm">
            <i className="ri-error-warning-line mr-2"></i>{error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Menu Selection */}
          <div className="flex-1 border-r border-background-100 dark:border-foreground-800 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-3">Menu Items</h3>
            {menuItems.length === 0 ? (
              <p className="text-sm text-foreground-400">Loading menu...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addItemToCart(item.id)}
                    className="p-3 text-left rounded-lg border border-background-200 hover:border-primary-300 bg-background-50 hover:bg-primary-50 transition-colors"
                  >
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-foreground-500">GH₵ {item.price}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart & Details */}
          <div className="w-full md:w-[300px] flex flex-col bg-background-50 dark:bg-foreground-900">
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Table</label>
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-background-200"
                >
                  <option value="">Select a table...</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>Table {t.tableNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Customer Name (Optional)</label>
                <input 
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-background-200"
                  placeholder="Walk-in"
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-2">Order Items</h3>
                {cart.length === 0 ? (
                  <p className="text-xs text-foreground-400 italic">Cart is empty</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map(c => {
                      const itemDef = menuItems.find(m => m.id === c.itemId);
                      return (
                        <div key={c.itemId} className="flex items-center justify-between bg-white p-2 rounded border border-background-200 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate w-32">{itemDef?.name || 'Unknown'}</span>
                            <span className="text-xs text-foreground-500">GH₵ {(itemDef?.price || 0) * c.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateItemQty(c.itemId, -1)} className="w-6 h-6 bg-background-100 rounded text-foreground-600">-</button>
                            <span className="text-sm w-4 text-center">{c.quantity}</span>
                            <button onClick={() => updateItemQty(c.itemId, 1)} className="w-6 h-6 bg-background-100 rounded text-foreground-600">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-background-200">
              <button
                onClick={handleSubmit}
                disabled={isLoading || cart.length === 0 || !selectedTable}
                className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
