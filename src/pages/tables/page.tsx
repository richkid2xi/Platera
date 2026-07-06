import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { QRCodeCanvas } from 'qrcode.react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { tables as initialTables, generateTableToken } from '@/mocks/tablets';
import type { Table } from '@/mocks/tablets';

function TableTile({
  table,
  onClick,
}: {
  table: Table;
  onClick: (table: Table) => void;
}) {
  return (
    <button
      onClick={() => onClick(table)}
      className="relative rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md animate-fade-in-up"
    >
      <div className="w-10 h-10 rounded-full bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center shadow-sm">
        <i className="ri-restaurant-line text-secondary-500 text-lg"></i>
      </div>
      <span className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
        Table {table.number}
      </span>
      <span className="text-xs font-medium text-foreground-500 font-body">
        {table.seats} seats
      </span>
    </button>
  );
}

export default function Tables() {
  const { user } = useAuth();
  const { isRefreshing } = useRefresh();
  const { markStepComplete } = useOnboarding();
  const isStaff = user?.role === 'staff';

  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editTableSeats, setEditTableSeats] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTableNum, setNewTableNum] = useState<number>(1);
  const [addError, setAddError] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Confirmation state for QR regeneration and deletion
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { setUnsavedDiff, checkUnsaved } = useUnsavedChanges();

  useEffect(() => {
    markStepComplete("review_tables");
  }, [markStepComplete]);

  useEffect(() => {
    const diffs: string[] = [];
    if (showAddModal) {
      if (newTableSeats !== 4 || newTableNum !== 1) {
        diffs.push(`New Table ${newTableNum} with ${newTableSeats} seats (unsaved)`);
      }
    } else if (selectedTable && editTableSeats !== null) {
      if (editTableSeats !== selectedTable.seats) {
        diffs.push(`Table ${selectedTable.number} seats changed to <b>${editTableSeats}</b>`);
      }
    }
    setUnsavedDiff(diffs);
  }, [showAddModal, newTableSeats, newTableNum, selectedTable, editTableSeats, setUnsavedDiff]);

  const handleCloseAdd = () => checkUnsaved(() => { setUnsavedDiff([]); setShowAddModal(false); });
  const handleCloseEdit = () => checkUnsaved(() => { setUnsavedDiff([]); setSelectedTable(null); setEditTableSeats(null); });

  const addTable = () => {
    if (tables.some(t => t.number === newTableNum)) {
      setAddError(`Table ${newTableNum} already exists.`);
      return;
    }
    const token = generateTableToken();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const newTable: Table = {
      id: Date.now(),
      number: newTableNum,
      seats: newTableSeats,
      token,
      qrCodeUrl: `${baseUrl}/order/${token}`,
      qrLink: `${baseUrl}/order/${token}`,
    };
    setTables((prev) => [...prev, newTable].sort((a, b) => a.number - b.number));
    setUnsavedDiff([]);
    setShowAddModal(false);
  };

  const saveTableEdit = () => {
    if (selectedTable && editTableSeats !== null) {
      setTables((prev) => prev.map(t => t.id === selectedTable.id ? { ...t, seats: editTableSeats } : t));
      setSelectedTable(null);
      setEditTableSeats(null);
      setUnsavedDiff([]);
    }
  };

  const deleteTable = () => {
    if (selectedTable) {
      setTables((prev) => prev.filter(t => t.id !== selectedTable.id));
      setSelectedTable(null);
      setShowDeleteConfirm(false);
    }
  };

  const regenerateQR = () => {
    if (selectedTable) {
      const newToken = generateTableToken();
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const newUrl = `${baseUrl}/order/${newToken}`;

      setTables((prev) => prev.map((t) => {
        if (t.id === selectedTable.id) {
          const updatedTable = { ...t, token: newToken, qrCodeUrl: newUrl, qrLink: newUrl };
          setSelectedTable(updatedTable);
          return updatedTable;
        }
        return t;
      }));
      setShowRegenerateConfirm(false);
    }
  };

  const copyLink = () => {
    if (selectedTable) {
      navigator.clipboard.writeText(selectedTable.qrLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Tables"
        description={`Manage ${tables.length} tables and QR ordering codes`}
      >
        {!isStaff && (
          <button
            onClick={() => {
              setNewTableNum(tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1);
              setNewTableSeats(4);
              setAddError('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i> Add Table
          </button>
        )}
      </PageHeader>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((table) => (
          <TableTile key={table.id} table={table} onClick={(t) => { setSelectedTable(t); setEditTableSeats(t.seats); }} />
        ))}
      </div>

      {/* Pagination */}
      {tables.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-background-200 dark:border-foreground-800 pt-4 mt-2">
          <span className="text-sm text-foreground-500 font-body">
            Showing <span className="font-bold text-foreground-900 dark:text-foreground-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground-900 dark:text-foreground-100">{Math.min(currentPage * itemsPerPage, tables.length)}</span> of <span className="font-bold text-foreground-900 dark:text-foreground-100">{tables.length}</span> tables
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(tables.length / itemsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${currentPage === i + 1
                      ? 'bg-primary-500 text-white'
                      : 'border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(tables.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(tables.length / itemsPerPage)}
              className="w-9 h-9 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      )}

      {/* Modals via Portal to ensure they are above top navbar */}
      {selectedTable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={handleCloseEdit}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in flex flex-col">

            <div className="px-5 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary-50 dark:bg-secondary-900/20">
                  <i className="ri-restaurant-line text-secondary-500 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                    Table {selectedTable.number}
                  </h2>
                  <span className="text-xs text-foreground-400 font-body">Manage Table</span>
                </div>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
              {/* Seats Section */}
              <div>
                <label className="block text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">Table Seats</label>
                <div className="flex items-center justify-between bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-200 dark:border-foreground-700">
                  <button onClick={() => setEditTableSeats(Math.max(1, (editTableSeats || 1) - 1))} className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm"><i className="ri-subtract-line text-lg"></i></button>
                  <span className="text-2xl font-bold text-foreground-900 dark:text-foreground-100 font-heading w-12 text-center">{editTableSeats}</span>
                  <button onClick={() => setEditTableSeats(Math.min(20, (editTableSeats || 1) + 1))} className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm"><i className="ri-add-line text-lg"></i></button>
                </div>
                {editTableSeats !== selectedTable.seats && (
                  <button onClick={saveTableEdit} className="w-full mt-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer">
                    Save Seats
                  </button>
                )}
              </div>

              {/* QR Code Section */}
              <div className="border-t border-background-200 dark:border-foreground-800 pt-5">
                <h3 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                  QR Ordering Link
                </h3>
                <div className="bg-background-50 dark:bg-foreground-800/50 rounded-lg border border-background-200 dark:border-foreground-700 p-5 flex flex-col items-center gap-4">
                  <div className="w-48 h-48 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm">
                    <QRCodeCanvas
                      value={selectedTable.qrLink}
                      size={176}
                      bgColor="#FFFFFF"
                      fgColor="#1A1B1F"
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-white dark:bg-foreground-800 rounded-lg border border-background-200 dark:border-foreground-700 p-2">
                      <code className="text-xs text-foreground-600 dark:text-foreground-300 font-mono flex-1 truncate">
                        {selectedTable.qrLink}
                      </code>
                      <button
                        onClick={copyLink}
                        className="px-3 py-1.5 rounded-md bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-800 text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                      >
                        <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button className="w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                  <i className="ri-download-line"></i> Download QR Code
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRegenerateConfirm(true)}
                    className="flex-1 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="ri-refresh-line"></i> Regenerate Link
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="py-2.5 px-4 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={() => setShowRegenerateConfirm(false)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="ri-alert-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-1">
                  Regenerate QR Code?
                </h3>
                <p className="text-sm text-foreground-500 font-body">
                  This will generate a new secure link for Table {selectedTable?.number}. The old QR code will no longer work and must be physically replaced on the table.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={regenerateQR}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-1">
                  Delete Table {selectedTable?.number}?
                </h3>
                <p className="text-sm text-foreground-500 font-body">
                  This action cannot be undone. You can reuse this table number later if needed.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTable}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  Delete Table
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Table Modal */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={handleCloseAdd}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="px-5 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">Add New Table</h2>
              <button onClick={handleCloseAdd} className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {addError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium animate-fade-in flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg"></i>
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-2 font-body">Table Number</label>
                <input
                  type="number"
                  min="1"
                  value={newTableNum}
                  onChange={(e) => {
                    setNewTableNum(parseInt(e.target.value) || 1);
                    setAddError('');
                  }}
                  className="w-full bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-900 dark:text-foreground-100 font-heading text-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-2 font-body">Number of Seats</label>
                <div className="flex items-center justify-between bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-200 dark:border-foreground-700">
                  <button
                    onClick={() => setNewTableSeats(Math.max(1, newTableSeats - 1))}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm transition-all"
                  >
                    <i className="ri-subtract-line text-lg"></i>
                  </button>
                  <span className="text-2xl font-bold text-foreground-900 dark:text-foreground-100 font-heading w-12 text-center">{newTableSeats}</span>
                  <button
                    onClick={() => setNewTableSeats(Math.min(20, newTableSeats + 1))}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm transition-all"
                  >
                    <i className="ri-add-line text-lg"></i>
                  </button>
                </div>
              </div>
              <p className="text-xs text-foreground-500 font-body text-center bg-accent-50 dark:bg-accent-900/20 p-3 rounded-lg border border-accent-100 dark:border-accent-900/50">
                A secure QR ordering code will be generated automatically for this table.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseAdd}
                  className="flex-1 py-3 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={addTable}
                  className="flex-1 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-primary-500/20"
                >
                  Confirm
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