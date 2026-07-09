import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/base/PageHeader';
import { apiClient } from '@/api/client';
import Toast from '../menu/components/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageSkeleton from '@/components/base/PageSkeleton';

export default function ManualOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Data Fetching
  const { data: tables = [], isLoading: isLoadingTables } = useQuery<any[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await apiClient.get('/tables');
      return res.data;
    }
  });

  const { data: menuCategories = [], isLoading: isLoadingMenu } = useQuery<any[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await apiClient.get('/menu');
      return res.data;
    }
  });


  // State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState<Array<{ itemId: string; quantity: number; notes: string }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Derived
  const allItems = useMemo(() => menuCategories.flatMap(cat => cat.items || []), [menuCategories]);
  const filteredItems = useMemo(() => {
    let items = activeCategory === 'All' 
      ? allItems 
      : allItems.filter(item => item.categoryId === menuCategories.find(c => c.name === activeCategory)?.id || item.category === activeCategory);
    return items.filter(item => item.available !== false);
  }, [allItems, activeCategory, menuCategories]);



  const addItemToCart = (itemId: string, delta: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) return prev.filter(i => i.itemId !== itemId);
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { itemId, quantity: delta, notes: '' }];
      return prev;
    });
  };

  const getCartQty = (itemId: string) => cart.find(c => c.itemId === itemId)?.quantity || 0;

  const cartTotal = useMemo(() => cart.reduce((sum, cartItem) => {
    const item = allItems.find(i => i.id === cartItem.itemId);
    return sum + (item?.price || 0) * cartItem.quantity;
  }, 0), [cart, allItems]);

  const handleSubmit = async () => {
    if (!selectedTable) {
      setToast({ message: "Please select a table first", type: 'error' });
      return;
    }
    if (cart.length === 0) {
      setToast({ message: "Cart is empty", type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/orders/manual', {
        tableId: selectedTable,
        items: cart.map(c => ({ menuItemId: c.itemId, quantity: c.quantity, notes: c.notes })),
        customerName: customerName || 'Walk-in',
        notes: orderNotes,
        paymentMethod
      });
      setToast({ message: "Order placed successfully!", type: 'success' });
      
      // Reset POS for next order immediately
      setTimeout(() => {
        setToast(null);
        setSelectedTable('');
        setCart([]);
        setCustomerName('');
        setOrderNotes('');
        setIsSubmitting(false);
        queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      }, 1500);
      
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || "Failed to create manual order", type: 'error' });
      setIsSubmitting(false);
    }
  };

  if (isLoadingTables || isLoadingMenu) return <PageSkeleton />;

  const tableObj = tables.find(t => t.id === selectedTable);

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] -m-4 md:-m-6 bg-background-50 dark:bg-foreground-950 animate-fade-in overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0 border-b border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 flex justify-between items-center">
        <PageHeader title="Point of Sale" description="Fast manual order entry" />
        <button 
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-background-200 text-foreground-600 hover:bg-background-50 transition-colors cursor-pointer font-semibold"
        >
          <i className="ri-arrow-left-line"></i> Back to Orders
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Dynamic Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-background-50 dark:bg-foreground-950 relative">
          
          {!selectedTable ? (
            // TABLE SELECTION GRID
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
              <div className="max-w-4xl w-full">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-restaurant-2-fill text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-foreground-900 dark:text-white">Select a Table</h2>
                  <p className="text-foreground-500 mt-1 text-sm">Choose a table to start taking an order</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tables.map(t => {
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTable(t.id)}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 bg-white border border-background-200 hover:border-primary-400 hover:shadow-sm dark:bg-foreground-900 dark:border-foreground-800`}
                      >
                        <i className={`ri-restaurant-line text-xl mb-1 text-foreground-400`}></i>
                        <span className="text-sm font-bold font-heading text-foreground-900 dark:text-foreground-100">Table {t.tableNumber}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded mt-1.5 bg-background-100 text-foreground-500 dark:bg-foreground-800`}>
                          {t.capacity || '?'} Seats
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // MENU SELECTION
            <>
              {/* Categories */}
              <div className="flex overflow-x-auto gap-2 p-3 shrink-0 no-scrollbar border-b border-background-200 dark:border-foreground-800 bg-white/50 dark:bg-foreground-900/50">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`px-4 py-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${activeCategory === 'All' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-800 text-foreground-700 hover:bg-background-100'}`}
                >
                  All Items
                </button>
                {menuCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-4 py-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${activeCategory === cat.name ? 'bg-primary-500 text-white shadow-sm' : 'bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-800 text-foreground-700 hover:bg-background-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin scrollbar-thumb-rounded">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-foreground-400">
                    <i className="ri-restaurant-line text-2xl mb-2"></i>
                    <p className="text-sm">No items found in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-16">
                    {filteredItems.map(item => {
                      const qty = getCartQty(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => qty === 0 && addItemToCart(item.id, 1)}
                          className={`relative flex flex-col text-left bg-white dark:bg-foreground-900 border rounded-xl overflow-hidden transition-all group ${qty > 0 ? 'border-primary-500 shadow-sm ring-1 ring-primary-500/20' : 'border-background-200 dark:border-foreground-800 hover:border-primary-300 cursor-pointer active:scale-[0.98]'}`}
                        >
                          <div className="h-24 w-full bg-background-100 dark:bg-foreground-800 relative overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-foreground-300">
                                <i className="ri-image-line text-2xl"></i>
                              </div>
                            )}
                            
                            {/* Fast Stepper Overlay */}
                            {qty > 0 && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-between px-3 animate-fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); addItemToCart(item.id, -1); }}
                                  className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer shadow-md"
                                >
                                  -
                                </button>
                                <span className="text-white text-xl font-bold font-heading">{qty}</span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); addItemToCart(item.id, 1); }}
                                  className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer shadow-md"
                                >
                                  +
                                </button>
                              </div>
                            )}
                            
                            {!item.available && qty === 0 && (
                              <div className="absolute inset-0 bg-background-950/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Sold Out</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <h4 className="font-semibold text-xs text-foreground-900 dark:text-foreground-100 line-clamp-2 leading-tight">{item.name}</h4>
                            <p className="text-primary-600 font-bold mt-1 text-xs">GH₵ {item.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Persistent Cart Summary */}
        <div className="w-full lg:w-[320px] xl:w-[380px] bg-white dark:bg-foreground-900 border-l border-background-200 dark:border-foreground-800 flex flex-col z-10 shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
          
          {/* Table Header in Cart */}
          <div className="p-3 md:p-4 border-b border-background-200 dark:border-foreground-800 bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-md flex items-center justify-center shadow-sm">
                  <i className="ri-restaurant-line text-sm"></i>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground-500 uppercase tracking-wider leading-none mb-0.5">Current Order</p>
                  <h3 className="text-sm font-bold font-heading text-foreground-900 dark:text-white leading-none">
                    {tableObj ? `Table ${tableObj.tableNumber}` : 'No Table Selected'}
                  </h3>
                </div>
              </div>
              {selectedTable && (
                <button 
                  onClick={() => setSelectedTable('')}
                  className="text-primary-600 font-bold text-xs hover:underline cursor-pointer px-2 py-1 bg-primary-100 dark:bg-primary-900/40 rounded-md"
                >
                  Change
                </button>
              )}
            </div>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-background-50/30 dark:bg-foreground-950/30 relative">
            {!selectedTable ? (
              <div className="absolute inset-0 flex items-center justify-center text-foreground-400 p-6 text-center bg-white/50 dark:bg-foreground-900/50 backdrop-blur-sm z-10">
                <p className="font-semibold text-sm">Select a table to start adding items.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center h-full opacity-50">
                <div className="w-16 h-16 bg-background-200 dark:bg-foreground-800 rounded-full flex items-center justify-center mb-3">
                  <i className="ri-shopping-bag-3-line text-2xl text-foreground-400"></i>
                </div>
                <p className="text-foreground-600 text-sm font-bold font-heading">Cart is empty</p>
                <p className="text-foreground-400 text-xs mt-1">Tap items on the left to add them</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {cart.map(c => {
                  const itemDef = allItems.find(m => m.id === c.itemId);
                  if (!itemDef) return null;
                  
                  return (
                    <div key={c.itemId} className="flex justify-between items-center bg-white dark:bg-foreground-900 p-2 rounded-lg border-b border-background-100 dark:border-foreground-800/50 animate-scale-in group hover:bg-background-50 dark:hover:bg-foreground-800/30">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0">
                          {c.quantity}x
                        </div>
                        <h4 className="font-semibold text-xs text-foreground-900 dark:text-foreground-100 truncate">{itemDef.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm text-foreground-900 dark:text-foreground-100 whitespace-nowrap">GH₵ {itemDef.price * c.quantity}</span>
                        <button 
                          onClick={() => addItemToCart(c.itemId, -c.quantity)} // Remove all
                          className="w-6 h-6 text-foreground-300 hover:bg-red-50 hover:text-red-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Config & Submit */}
          <div className="p-3 md:p-4 bg-white dark:bg-foreground-900 border-t border-background-200 dark:border-foreground-800 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input 
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name (Opt)"
                  className="w-full p-2 bg-background-50 dark:bg-foreground-950 border border-background-200 dark:border-foreground-700 rounded-md text-xs focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Order Notes (Opt)"
                  className="w-full p-2 bg-background-50 dark:bg-foreground-950 border border-background-200 dark:border-foreground-700 rounded-md text-xs focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-foreground-500 uppercase tracking-wider mb-1.5">Payment Method</label>
              <div className="flex gap-1.5">
                {(['CASH', 'MOBILE_MONEY', 'CARD'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${paymentMethod === method ? 'bg-primary-50 border-primary-400 text-primary-700 dark:bg-primary-900/20 dark:border-primary-500 dark:text-primary-300' : 'border-background-200 text-foreground-500 hover:bg-background-50 dark:border-foreground-700 dark:hover:bg-foreground-800'}`}
                  >
                    {method === 'MOBILE_MONEY' ? 'MOMO' : method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between mb-3 px-1">
              <span className="text-foreground-500 font-bold uppercase tracking-wider text-[10px] mb-0.5">Total Pay</span>
              <span className="text-2xl font-black font-heading text-primary-500 leading-none">GH₵ {cartTotal}</span>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0 || !selectedTable}
              className="w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <><i className="ri-loader-4-line animate-spin text-lg"></i> Processing...</>
              ) : (
                <><i className="ri-check-double-line text-lg"></i> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
