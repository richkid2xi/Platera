import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { tables as initialTables, tableStatusConfig } from '@/mocks/tablets';
import type { Table } from '@/mocks/tablets';
import { orders } from '@/mocks/orders';

function TableTile({
  table,
  onClick,
}: {
  table: Table;
  onClick: (table: Table) => void;
}) {
  const config = tableStatusConfig[table.status];
  return (
    <button
      onClick={() => onClick(table)}
      className={`relative rounded-xl border p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${config.bg} ${config.border} animate-fade-in-up`}
    >
      <div className="w-10 h-10 rounded-full bg-white dark:bg-foreground-800 flex items-center justify-center shadow-sm">
        <i className={`${config.icon} text-lg`}></i>
      </div>
      <span className={`text-lg font-bold font-heading ${config.text}`}>Table {table.number}</span>
      <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      {table.currentOrderTotal && (
        <span className="text-xs font-bold text-foreground-700 dark:text-foreground-300 mt-0.5">
          GH₵ {table.currentOrderTotal}
        </span>
      )}
      {table.status === 'Occupied' && table.currentOrderId && (
        <span className="text-[10px] text-foreground-400 font-body">{table.currentOrderId}</span>
      )}
      <span className="text-[10px] text-foreground-400 font-body">{table.seats} seats</span>
    </button>
  );
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [copied, setCopied] = useState(false);

  const filteredTables = filterStatus === 'All'
    ? tables
    : tables.filter((t) => t.status === filterStatus);

  const addTable = () => {
    const nextNum = Math.max(...tables.map((t) => t.number)) + 1;
    const newTable: Table = {
      id: nextNum,
      number: nextNum,
      seats: newTableSeats,
      status: 'Empty',
      qrCodeUrl: `https://platera.app/order?t=${nextNum}`,
      qrLink: `https://platera.app/order?t=${nextNum}`,
    };
    setTables((prev) => [...prev, newTable]);
    setShowAddModal(false);
    setNewTableSeats(4);
  };

  const copyLink = () => {
    if (selectedTable) {
      navigator.clipboard.writeText(selectedTable.qrLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTableOrder = (tableNum: number) => {
    return orders.find((o) => o.table === tableNum);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">
            Tables
          </h1>
          <p className="text-sm text-foreground-400 mt-1 font-body">
            {tables.filter((t) => t.status === 'Occupied').length} occupied ·{' '}
            {tables.filter((t) => t.status === 'Empty').length} available ·{' '}
            {tables.filter((t) => t.status === 'Awaiting Payment').length} awaiting payment
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i> Add Table
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Empty', 'Occupied', 'Awaiting Payment'].map((status) => {
          const count = status === 'All'
            ? tables.length
            : tables.filter((t) => t.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border border-background-200 dark:border-foreground-700 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
            >
              {status}
              <span className={`ml-1.5 text-xs ${filterStatus === status ? 'text-white/80' : 'text-foreground-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTables.map((table) => (
          <TableTile key={table.id} table={table} onClick={setSelectedTable} />
        ))}
      </div>

      {/* Table Detail Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="absolute inset-0 bg-foreground-950/40" onClick={() => setSelectedTable(null)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-xl w-full max-w-lg animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tableStatusConfig[selectedTable.status].bg}`}>
                  <i className={`${tableStatusConfig[selectedTable.status].icon} text-lg`}></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                    Table {selectedTable.number}
                  </h2>
                  <span className="text-xs text-foreground-400 font-body">{selectedTable.seats} seats · {selectedTable.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Active Order */}
              {selectedTable.status !== 'Empty' && selectedTable.currentOrderId && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                    Active Order
                  </h3>
                  <div className="bg-background-50 dark:bg-foreground-800/50 rounded-lg border border-background-200 dark:border-foreground-700 p-4">
                    {(() => {
                      const order = getTableOrder(selectedTable.number);
                      if (!order) return <span className="text-sm text-foreground-400 font-body">No active order details</span>;
                      return (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">
                              {order.id}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                                : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-foreground-700 dark:text-foreground-300 font-body">{item.qty}x {item.name}</span>
                                <span className="text-foreground-500 dark:text-foreground-400 font-body">GH₵ {item.price * item.qty}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-background-200 dark:border-foreground-700">
                            <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">Total</span>
                            <span className="text-sm font-bold text-primary-500 font-heading">GH₵ {order.total}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              <div>
                <h3 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                  QR Ordering Code
                </h3>
                <div className="bg-background-50 dark:bg-foreground-800/50 rounded-lg border border-background-200 dark:border-foreground-700 p-5 flex flex-col items-center gap-4">
                  {/* QR Code */}
                  <div className="w-48 h-48 bg-white rounded-lg p-2 flex items-center justify-center">
                    <QRCodeCanvas
                      value={selectedTable.qrLink}
                      size={176}
                      bgColor="#FFFFFF"
                      fgColor="#1A1B1F"
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  {/* Link */}
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-xs text-foreground-500 dark:text-foreground-400 font-body text-center">
                      Scan to order or share the link below
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-foreground-800 rounded-lg border border-background-200 dark:border-foreground-700 p-2">
                      <code className="text-xs text-foreground-600 dark:text-foreground-300 font-mono flex-1 truncate">
                        {selectedTable.qrLink}
                      </code>
                      <button
                        onClick={copyLink}
                        className="px-3 py-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                      >
                        <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {selectedTable.status !== 'Empty' && (
                  <button className="flex-1 py-2.5 rounded-lg border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-medium text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-bill-line mr-1"></i> Print Bill
                  </button>
                )}
                <button className="flex-1 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line mr-1"></i> Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="absolute inset-0 bg-foreground-950/40" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-xl w-full max-w-sm animate-scale-in">
            <div className="px-5 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">Add New Table</h2>
              <button onClick={() => setShowAddModal(false)} className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">Number of Seats</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewTableSeats(Math.max(1, newTableSeats - 1))}
                    className="w-10 h-10 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 cursor-pointer"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading w-8 text-center">{newTableSeats}</span>
                  <button
                    onClick={() => setNewTableSeats(Math.min(12, newTableSeats + 1))}
                    className="w-10 h-10 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 cursor-pointer"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>
              <p className="text-xs text-foreground-400 font-body">
                Table will be numbered {Math.max(...tables.map((t) => t.number)) + 1} with an auto-generated QR code.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={addTable}
                  className="flex-1 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  Add Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}