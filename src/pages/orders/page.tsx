import { useState, useEffect } from 'react';
import {
  orders as initialOrders,
  orderColumns,
  statusBgColors,
  calculateWaitTime,
  formatElapsed,
  getWaitTimeColor,
} from '@/mocks/orders';
import type { Order } from '@/mocks/orders';

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
  const waitMins = calculateWaitTime(order.createdAt);
  const waitInfo = getWaitTimeColor(waitMins);

  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div
      className={`bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-4 flex flex-col gap-2.5 cursor-default animate-fade-in-up hover-lift ${
        order.status === 'New' ? 'order-new' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <i className="ri-restaurant-line text-primary-500 text-sm"></i>
          </div>
          <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">
            Table {order.table}
          </span>
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
              {item.qty}x {item.name}
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
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              order.paymentStatus === 'Paid'
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
            }`}
          >
            {order.paymentStatus === 'Paid' ? (
              <i className="ri-check-line mr-0.5"></i>
            ) : (
              <i className="ri-time-line mr-0.5"></i>
            )}
            {order.paymentStatus}
          </span>
          <span className="text-xs text-foreground-400 font-body">
            {order.paymentMethod || 'Cash'}
          </span>
        </div>
        <span className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
          GH₵ {order.total}
        </span>
      </div>

      {order.status !== 'Served' && (
        <button
          onClick={onAdvance}
          className="w-full mt-1 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <i className="ri-arrow-right-line"></i>
          Advance to{' '}
          {orderColumns[orderColumns.indexOf(order.status) + 1] || 'Served'}
        </button>
      )}
    </div>
  );
}

function NewOrderToast({ order, onClose }: { order: Order; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm animate-slide-in-right">
      <div className="bg-white dark:bg-foreground-900 rounded-lg border border-primary-200 dark:border-primary-800 shadow-lg p-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
          <i className="ri-shopping-bag-3-line text-primary-500 text-lg"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">
            New Order — Table {order.table}
          </p>
          <p className="text-xs text-foreground-500 dark:text-foreground-400 mt-0.5 font-body">
            {order.items.length} items · GH₵ {order.total}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer"
        >
          <i className="ri-close-line text-lg"></i>
        </button>
      </div>
    </div>
  );
}

export default function LiveOrders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterTable, setFilterTable] = useState('');
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);
  const [demoNewOrder, setDemoNewOrder] = useState(false);

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentIdx = orderColumns.indexOf(o.status);
          const nextStatus = orderColumns[currentIdx + 1];
          if (nextStatus) {
            return { ...o, status: nextStatus };
          }
        }
        return o;
      })
    );
  };

  const simulateNewOrder = () => {
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      table: Math.floor(Math.random() * 10) + 1,
      items: [
        { name: 'Jollof Rice with Chicken', qty: 1, price: 60 },
        { name: 'Fresh Coconut Juice', qty: 1, price: 20 },
      ],
      status: 'New',
      paymentStatus: 'Pending',
      total: 80,
      createdAt: new Date().toISOString(),
      customerName: 'New Customer',
    };
    setOrders((prev) => [newOrder, ...prev]);
    setNewOrderToast(newOrder);
    setDemoNewOrder(true);
    setTimeout(() => setDemoNewOrder(false), 5000);
  };

  const filteredOrders = filterTable
    ? orders.filter((o) => o.table.toString().includes(filterTable))
    : orders;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">
            Live Orders
          </h1>
          <p className="text-sm text-foreground-400 mt-1 font-body">
            Track and manage orders in real-time. {orders.length} orders today.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            onClick={simulateNewOrder}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              demoNewOrder ? 'animate-pulse' : ''
            }`}
          >
            <i className="ri-add-line"></i> Simulate Order
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {orderColumns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col);
          return (
            <div key={col} className="flex-shrink-0 w-[280px] flex flex-col gap-3">
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                  statusBgColors[col]
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      col === 'New'
                        ? 'bg-primary-500'
                        : col === 'Confirmed'
                        ? 'bg-accent-500'
                        : col === 'Preparing'
                        ? 'bg-amber-500'
                        : col === 'Ready'
                        ? 'bg-secondary-500'
                        : 'bg-foreground-400'
                    }`}
                  ></span>
                  <span className="text-sm font-semibold text-foreground-800 dark:text-foreground-200 font-heading">
                    {col}
                  </span>
                </div>
                <span className="text-xs font-bold bg-white dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 min-h-[100px]">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 bg-background-50 dark:bg-foreground-900/50 rounded-lg border border-dashed border-background-300 dark:border-foreground-700">
                    <i className="ri-inbox-line text-2xl text-foreground-300 mb-2"></i>
                    <span className="text-xs text-foreground-400 font-body text-center">
                      No {col.toLowerCase()} orders
                    </span>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={() => advanceOrder(order.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Order Toast */}
      {newOrderToast && (
        <NewOrderToast order={newOrderToast} onClose={() => setNewOrderToast(null)} />
      )}
    </div>
  );
}