import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ManualOrderModal from './ManualOrderModal';
import { useRefresh } from '@/contexts/RefreshContext';
import PageHeader from '@/components/base/PageHeader';
import { apiClient } from '@/api/client';
import Toast from '../menu/components/Toast';
import { useSocketEvent } from '@/hooks/useSocket';

type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED';
type PaymentStatus = 'PENDING' | 'PAID';

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  notes?: string;
  menuItem: {
    name: string;
  };
}

export interface Order {
  id: string;
  table: { tableNumber: string };
  items: OrderItem[];
  status: OrderStatus | 'CANCELLED';
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  total: string;
  createdAt: string;
  customerName?: string;
  notes?: string;
  source: 'CUSTOMER_APP' | 'STAFF_MANUAL';
}

const orderColumns: OrderStatus[] = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

const statusBgColors: Record<OrderStatus, string> = {
  NEW: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  CONFIRMED: 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800',
  PREPARING: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  READY: 'bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800',
  SERVED: 'bg-foreground-50 dark:bg-foreground-800/30 border-foreground-200 dark:border-foreground-700',
};

function getWaitTimeColor(minutes: number): { color: string; label: string } {
  if (minutes <= 10) return { color: 'text-secondary-600', label: 'On time' };
  if (minutes <= 20) return { color: 'text-amber-600', label: 'Getting there' };
  if (minutes <= 35) return { color: 'text-orange-600', label: 'Slow' };
  return { color: 'text-red-600', label: 'Overdue' };
}

function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function calculateWaitTime(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return Math.floor((now - created) / 60000);
}

function OrderCard({ order, onChangeStatus, onMarkPaid }: { order: Order; onChangeStatus: (status: OrderStatus) => void; onMarkPaid: () => void; }) {
  const waitMins = calculateWaitTime(order.createdAt);
  const waitInfo = getWaitTimeColor(waitMins);

  return (
    <div
      className={`bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-4 flex flex-col gap-2.5 cursor-default animate-fade-in-up hover-lift ${order.status === 'NEW' ? 'order-new' : ''
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <i className="ri-restaurant-line text-primary-500 text-sm"></i>
          </div>
          <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">
            Table {order.table?.tableNumber || '?'}
          </span>
          {order.source === 'STAFF_MANUAL' && (
            <span className="text-[10px] bg-foreground-100 text-foreground-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Staff entered
            </span>
          )}
        </div>
        <span
          className={`text-xs font-semibold flex items-center gap-1 ${waitInfo.color}`}
        >
          <i className="ri-time-line"></i>
          {formatElapsed(waitMins)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-foreground-700 dark:text-foreground-300 font-body">
              {item.quantity}x {item.menuItem.name}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <span className="text-xs text-foreground-400 font-body">
            +{order.items.length - 3} more items
          </span>
        )}
      </div>

      {order.notes && (
        <div className="flex items-start gap-1.5">
          <i className="ri-sticky-note-line text-foreground-400 text-xs mt-0.5"></i>
          <span className="text-xs text-foreground-500 dark:text-foreground-400 font-body italic">
            {order.notes}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-background-100 dark:border-foreground-800">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID'
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
              }`}
          >
            {order.paymentStatus === 'PAID' ? (
              <i className="ri-check-line mr-0.5"></i>
            ) : (
              <i className="ri-time-line mr-0.5"></i>
            )}
            {order.paymentStatus}
          </span>
          <span className="text-xs text-foreground-400 font-body">
            {order.paymentMethod || 'CASH'}
          </span>
        </div>
        <span className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
          GH₵ {order.total}
        </span>
      </div>

      {(order.status !== 'SERVED' || order.paymentStatus === 'PENDING') && (
        <div className="mt-2 pt-3 border-t border-background-100 dark:border-foreground-800 flex items-center justify-between">
          {/* Payment Toggle */}
          {order.paymentStatus === 'PENDING' ? (
            <button
              onClick={onMarkPaid}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                order.paymentMethod === 'CASH' || !order.paymentMethod
                  ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-900/40'
                  : 'text-foreground-500 hover:bg-background-100 dark:hover:bg-foreground-800 text-[10px]'
              }`}
              title={order.paymentMethod === 'CASH' ? 'Confirm Cash Payment' : 'System pending. Click to force override.'}
            >
              <i className={order.paymentMethod === 'CASH' || !order.paymentMethod ? 'ri-money-dollar-circle-line' : 'ri-shield-check-line'}></i> 
              {order.paymentMethod === 'CASH' || !order.paymentMethod ? 'Confirm Cash' : 'Override'}
            </button>
          ) : (
            <div className="flex-1"></div>
          )}

          {/* Status Progression */}
          {order.status !== 'SERVED' && (
            <div className="flex items-center">
              {order.status === 'NEW' && (
                <button onClick={() => onChangeStatus('CONFIRMED')} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold transition-colors shadow-sm">
                  Confirm <i className="ri-arrow-right-s-line"></i>
                </button>
              )}
              {order.status === 'CONFIRMED' && (
                <button onClick={() => onChangeStatus('PREPARING')} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm">
                  Prepare <i className="ri-arrow-right-s-line"></i>
                </button>
              )}
              {order.status === 'PREPARING' && (
                <button onClick={() => onChangeStatus('READY')} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-semibold transition-colors shadow-sm">
                  Ready <i className="ri-arrow-right-s-line"></i>
                </button>
              )}
              {order.status === 'READY' && (
                <button onClick={() => onChangeStatus('SERVED')} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors shadow-sm">
                  Serve <i className="ri-check-line"></i>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BulkConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  fromStatus,
  actionText,
  orders,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromStatus: string;
  actionText: string;
  orders: Order[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-background-950/20 dark:bg-background-950/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl shadow-2xl border border-background-200 dark:border-foreground-700 w-full max-w-md overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-background-100 dark:border-foreground-800">
          <h3 className="text-lg font-heading font-bold text-foreground-900 dark:text-foreground-100">
            {actionText}
          </h3>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1">
            You are about to move {orders.length} orders from <span className="font-semibold text-foreground-700 dark:text-foreground-300">{fromStatus}</span>.
          </p>
        </div>

        <div className="px-6 py-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded">
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between items-center bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-200 dark:border-foreground-700">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground-800 dark:text-foreground-200 font-heading">
                    Table {o.table?.tableNumber || '?'}
                  </span>
                  <span className="text-xs text-foreground-500 font-body">
                    {o.items.length} items
                  </span>
                </div>
                <span className="text-xs font-bold bg-white dark:bg-foreground-900 px-2 py-1 rounded shadow-sm text-foreground-700 dark:text-foreground-300">
                  {formatElapsed(calculateWaitTime(o.createdAt))} wait
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 bg-background-50 dark:bg-foreground-800/30 border-t border-background-100 dark:border-foreground-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground-600 hover:bg-background-200 dark:hover:bg-foreground-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-sm transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function SingleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  toStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
  toStatus: OrderStatus;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-background-950/20 dark:bg-background-950/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl shadow-2xl border border-background-200 dark:border-foreground-700 w-full max-w-sm overflow-hidden animate-scale-in text-center p-6">
        <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4 text-primary-500">
          <i className="ri-question-line text-3xl"></i>
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground-900 dark:text-foreground-100 mb-2">
          Update Order Status
        </h3>
        <p className="text-sm text-foreground-500 dark:text-foreground-400 font-body mb-6">
          Move <strong className="text-foreground-800 dark:text-foreground-200">Table {order.table?.tableNumber}</strong>'s order to <span className="font-semibold text-foreground-700 dark:text-foreground-300">{toStatus}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground-600 hover:bg-background-200 dark:hover:bg-foreground-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-sm transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background-200 dark:bg-foreground-800"></div>
          <div className="w-16 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
        </div>
        <div className="w-12 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
      </div>
      <div className="flex flex-col gap-2 mt-1">
        <div className="w-full h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="w-3/4 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-background-100 dark:border-foreground-800">
        <div className="w-16 h-5 bg-background-200 dark:bg-foreground-800 rounded-full"></div>
        <div className="w-12 h-5 bg-background-200 dark:bg-foreground-800 rounded"></div>
      </div>
    </div>
  );
}

export default function LiveOrders() {
  const { isRefreshing } = useRefresh();
  const queryClient = useQueryClient();
  const [filterTable, setFilterTable] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    },
    refetchInterval: 30000, // Fallback poll every 30s in case socket events are missed
  });

  // Real-time: merge new orders into the cache when socket events arrive
  useSocketEvent('order:new', (newOrder: Order) => {
    queryClient.setQueryData<Order[]>(['orders'], (prev = []) => {
      if (prev.find(o => o.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });
    setToast({ message: `New order — Table ${newOrder.table?.tableNumber}`, type: 'success' });
    setTimeout(() => setToast(null), 4000);
  });

  useSocketEvent('order:status_updated', (updated: { id: string; status: OrderStatus }) => {
    queryClient.setQueryData<Order[]>(['orders'], (prev = []) =>
      prev.map(o => o.id === updated.id ? { ...o, status: updated.status } : o)
    );
  });

  const [bulkConfirm, setBulkConfirm] = useState<{
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    actionText: string;
  } | null>(null);

  const [singleConfirm, setSingleConfirm] = useState<{
    orderId: string;
    toStatus: OrderStatus;
  } | null>(null);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: OrderStatus }) => {
      await apiClient.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSingleConfirm(null);
    },
    onError: () => {
      setToast({ message: 'Failed to update order status', type: 'error' });
    }
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/orders/manual/${id}/confirm-payment`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      setToast({ message: error.response?.data?.error || 'Failed to confirm payment', type: 'error' });
    }
  });

  const changeOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'SERVED') {
      setSingleConfirm({ orderId, toStatus: newStatus });
    } else {
      updateStatusMutation.mutate({ id: orderId, status: newStatus });
    }
  };

  const executeSingleChange = () => {
    if (!singleConfirm) return;
    updateStatusMutation.mutate({ id: singleConfirm.orderId, status: singleConfirm.toStatus });
  };

  const executeBulkChange = () => {
    if (!bulkConfirm) return;
    const toUpdate = orders.filter(o => o.status === bulkConfirm.fromStatus);
    Promise.all(toUpdate.map(o => updateStatusMutation.mutateAsync({ id: o.id, status: bulkConfirm.toStatus }))).then(() => {
      setBulkConfirm(null);
    });
  };

  const filteredOrders = filterTable
    ? orders.filter((o) => o.table?.tableNumber.includes(filterTable))
    : orders;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] overflow-hidden -m-4 md:-m-6 bg-background-50 dark:bg-foreground-950 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0">
        <PageHeader
          title="Live Orders"
          description={`Track and manage orders in real-time. ${orders.length} orders today.`}
        >
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
            <input
              type="text"
              placeholder="Filter by table..."
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 w-44 font-body"
            />
          </div>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-add-line"></i> Manual Order
          </button>
        </PageHeader>
      </div>

      {/* Kanban Board Container */}
      <div className="relative group flex-1 min-h-0 mt-2">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-r-full bg-white dark:bg-foreground-800 shadow-lg border border-background-200 dark:border-foreground-700 border-l-0 flex items-center justify-center text-foreground-600 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden xl:flex cursor-pointer"
        >
          <i className="ri-arrow-left-s-line text-xl"></i>
        </button>

        {/* Kanban Board */}
        <div
          ref={scrollContainerRef}
          className="flex flex-col xl:flex-row gap-6 xl:gap-5 overflow-x-auto pb-6 pt-1 px-4 md:px-6 h-full snap-x scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent"
        >
          {orderColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col);

            const nextStatusMap: Record<OrderStatus, OrderStatus> = {
              NEW: 'CONFIRMED',
              CONFIRMED: 'PREPARING',
              PREPARING: 'READY',
              READY: 'SERVED',
              SERVED: 'SERVED' // End state
            };
            const actionTextMap: Record<OrderStatus, string> = {
              NEW: 'Confirm All',
              CONFIRMED: 'Prepare All',
              PREPARING: 'Ready All',
              READY: 'Serve All',
              SERVED: ''
            };

            const nextStatus = nextStatusMap[col];
            const actionText = actionTextMap[col];

            return (
              <div key={col} className="w-full xl:flex-shrink-0 xl:w-[320px] flex flex-col gap-3 snap-start h-full max-h-full">
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg shrink-0 ${statusBgColors[col]
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${col === 'NEW'
                          ? 'bg-primary-500 shadow-[0_0_8px_rgba(255,107,53,0.5)]'
                          : col === 'CONFIRMED'
                            ? 'bg-accent-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]'
                            : col === 'PREPARING'
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : col === 'READY'
                                ? 'bg-secondary-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                : 'bg-foreground-400'
                        }`}
                    ></span>
                    <span className="text-sm font-semibold text-foreground-800 dark:text-foreground-200 font-heading">
                      {col.charAt(0) + col.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-white dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 px-2 py-0.5 rounded-full shadow-sm">
                      {colOrders.length}
                    </span>
                    {col !== 'SERVED' && colOrders.length > 0 && (
                      <button
                        onClick={() => setBulkConfirm({ fromStatus: col, toStatus: nextStatus, actionText })}
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-foreground-800/20 hover:bg-foreground-800/30 dark:bg-foreground-100/20 dark:hover:bg-foreground-100/30 transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        {actionText}
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 min-h-[100px] flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent pr-2 pb-2">
                  {isRefreshing || isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <OrderCardSkeleton key={`skel-${idx}`} />
                    ))
                  ) : colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 bg-background-50 dark:bg-foreground-900/50 rounded-xl border border-dashed border-background-300 dark:border-foreground-700">
                      <i className="ri-inbox-line text-3xl text-foreground-300 mb-2"></i>
                      <span className="text-sm text-foreground-400 font-body text-center">
                        No {col.toLowerCase()} orders
                      </span>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onChangeStatus={(status) => changeOrderStatus(order.id, status)}
                        onMarkPaid={() => confirmPaymentMutation.mutate(order.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-l-full bg-white dark:bg-foreground-800 shadow-lg border border-background-200 dark:border-foreground-700 border-r-0 flex items-center justify-center text-foreground-600 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:flex cursor-pointer"
        >
          <i className="ri-arrow-right-s-line text-xl"></i>
        </button>
      </div>

      <BulkConfirmModal
        isOpen={bulkConfirm !== null}
        onClose={() => setBulkConfirm(null)}
        onConfirm={executeBulkChange}
        fromStatus={bulkConfirm?.fromStatus || ''}
        actionText={bulkConfirm?.actionText || ''}
        orders={bulkConfirm ? orders.filter((o) => o.status === bulkConfirm.fromStatus) : []}
      />

      <SingleConfirmModal
        isOpen={singleConfirm !== null}
        onClose={() => setSingleConfirm(null)}
        onConfirm={executeSingleChange}
        order={singleConfirm ? orders.find((o) => o.id === singleConfirm.orderId) || null : null}
        toStatus={singleConfirm?.toStatus || 'NEW'}
      />

      <ManualOrderModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onOrderCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }}
      />
    </div>
  );
}