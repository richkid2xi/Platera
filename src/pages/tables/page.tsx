import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { QRCodeCanvas } from 'qrcode.react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/api/client';
import Toast from '@/pages/menu/components/Toast';

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  qrCodeUrl: string | null;
  activeToken: string | null;
}

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
        Table {table.tableNumber}
      </span>
      <span className="text-xs font-medium text-foreground-500 font-body">
        {table.capacity} seats
      </span>
    </button>
  );
}

export default function Tables() {
  const { user } = useAuth();
  const { isRefreshing } = useRefresh();
  const { markStepComplete } = useOnboarding();
  const isStaff = user?.role === 'STAFF';
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading, isError } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await apiClient.get('/tables');
      return res.data;
    }
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: { tableNumber: string, capacity: number }) => {
      const res = await apiClient.post('/tables', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowAddModal(false);
      markStepComplete("review_tables");
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setSelectedTable(null);
      setShowDeleteConfirm(false);
      setToast({ message: 'Table deleted successfully', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err.response?.data?.error || 'Failed to delete table', type: 'error' });
      setShowDeleteConfirm(false);
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: async (data: { id: string, capacity: number }) => {
      const res = await apiClient.put(`/tables/${data.id}`, { capacity: data.capacity });
      return res.data;
    },
    onSuccess: (updatedTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      if (selectedTable?.id === updatedTable.id) {
        setSelectedTable(prev => prev ? { ...prev, capacity: updatedTable.capacity } : null);
      }
      setToast({ message: 'Table capacity updated', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err.response?.data?.error || 'Failed to update table', type: 'error' });
    }
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/tables/${id}/regenerate-token`);
      return res.data;
    },
    onSuccess: (updatedTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      
      // Update selected table with the newly active token
      const activeToken = updatedTable.tokens?.find((t: any) => t.isActive)?.token;
      setSelectedTable(prev => prev ? { 
        ...prev, 
        qrCodeUrl: updatedTable.qrCodeUrl, 
        activeToken 
      } : null);
      
      setShowRegenerateConfirm(false);
    }
  });

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTableNum, setNewTableNum] = useState<number>(1);
  const [addError, setAddError] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const { setUnsavedDiff, checkUnsaved } = useUnsavedChanges();

  useEffect(() => {
    const diffs: string[] = [];
    if (showAddModal) {
      if (newTableSeats !== 4 || newTableNum !== 1) {
        diffs.push(`New Table ${newTableNum} with ${newTableSeats} seats (unsaved)`);
      }
    }
    setUnsavedDiff(diffs);
  }, [showAddModal, newTableSeats, newTableNum, setUnsavedDiff]);

  const handleCloseAdd = () => checkUnsaved(() => { setUnsavedDiff([]); setShowAddModal(false); });
  const handleCloseEdit = () => checkUnsaved(() => { setUnsavedDiff([]); setSelectedTable(null); });

  const addTable = () => {
    if (tables.some(t => t.tableNumber === String(newTableNum))) {
      setAddError(`Table ${newTableNum} already exists.`);
      return;
    }
    createTableMutation.mutate({ tableNumber: String(newTableNum), capacity: newTableSeats });
  };

  const deleteTable = () => {
    if (selectedTable) {
      deleteTableMutation.mutate(selectedTable.id);
    }
  };

  const regenerateQR = () => {
    if (selectedTable) {
      regenerateTokenMutation.mutate(selectedTable.id);
    }
  };

  const baseUrl = useMemo(() => typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173', []);
  const getQrLink = (table: Table) => table.activeToken ? `${baseUrl}/order/${table.activeToken}` : '';

  const copyLink = () => {
    if (selectedTable) {
      navigator.clipboard.writeText(getQrLink(selectedTable));
      setCopied(true);
      markStepComplete("review_tables");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isRefreshing || isLoading) return <PageSkeleton />;

  const downloadQR = () => {
    if (!selectedTable) return;
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Table-${selectedTable.tableNumber}-QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader
        title="Tables"
        description={`Manage ${tables.length} tables and QR ordering codes`}
      >
        {!isStaff && (
          <button
            onClick={() => {
              setNewTableNum(tables.length > 0 ? Math.max(...tables.map((t) => Number(t.tableNumber) || 0)) + 1 : 1);
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

      {isError && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-medium">
          Error loading tables. Please try again later.
        </div>
      )}

      {/* Table Grid or Empty State */}
      {tables.length === 0 && !isLoading && !isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-background-200 dark:border-foreground-800 rounded-2xl bg-white/50 dark:bg-foreground-900/50 mt-4">
          <div className="w-24 h-24 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
            <i className="ri-layout-grid-fill text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold font-heading text-foreground-900 dark:text-foreground-100 mb-2">No Tables Yet</h3>
          <p className="text-foreground-500 max-w-md mb-8 font-body">
            Start by adding tables to generate QR codes. Your customers will scan these codes to view your menu and place orders.
          </p>
          {!isStaff && (
            <button
              onClick={() => {
                setNewTableNum(1);
                setNewTableSeats(4);
                setAddError('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5"
            >
              <i className="ri-add-line text-lg"></i> Add Your First Table
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {tables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((table) => (
            <TableTile key={table.id} table={table} onClick={(t) => { setSelectedTable(t); }} />
          ))}
        </div>
      )}

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
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-md animate-scale-in flex flex-col">

            <div className="px-5 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary-50 dark:bg-secondary-900/20">
                  <i className="ri-restaurant-line text-secondary-500 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                    Table {selectedTable.tableNumber}
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
                  <button
                    onClick={() => {
                      const newCap = Math.max(1, selectedTable.capacity - 1);
                      setSelectedTable(prev => prev ? { ...prev, capacity: newCap } : null);
                      updateTableMutation.mutate({ id: selectedTable.id, capacity: newCap });
                    }}
                    disabled={updateTableMutation.isPending}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                  >
                    <i className="ri-subtract-line text-lg"></i>
                  </button>
                  <span className="text-2xl font-bold text-foreground-900 dark:text-foreground-100 font-heading w-12 text-center">
                    {updateTableMutation.isPending ? '...' : selectedTable.capacity}
                  </span>
                  <button
                    onClick={() => {
                      const newCap = Math.min(20, selectedTable.capacity + 1);
                      setSelectedTable(prev => prev ? { ...prev, capacity: newCap } : null);
                      updateTableMutation.mutate({ id: selectedTable.id, capacity: newCap });
                    }}
                    disabled={updateTableMutation.isPending}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                  >
                    <i className="ri-add-line text-lg"></i>
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border-t border-background-200 dark:border-foreground-800 pt-5">
                <h3 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                  QR Ordering Link
                </h3>
                <div className="bg-background-50 dark:bg-foreground-800/50 rounded-lg border border-background-200 dark:border-foreground-700 p-5 flex flex-col items-center gap-4">
                  <div className="w-48 h-48 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm relative group">
                    {selectedTable.activeToken ? (
                      <>
                        <QRCodeCanvas
                          id="qr-canvas"
                          value={getQrLink(selectedTable)}
                          size={176}
                          bgColor="#FFFFFF"
                          fgColor="#1A1B1F"
                          level="M"
                          includeMargin={false}
                        />
                        <button 
                          onClick={downloadQR}
                          className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                        >
                          <i className="ri-download-2-line text-2xl mb-1"></i>
                          <span className="text-xs font-medium">Download PNG</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-foreground-400 text-sm text-center">No active token</span>
                    )}
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-white dark:bg-foreground-800 rounded-lg border border-background-200 dark:border-foreground-700 p-2">
                      <code className="text-xs text-foreground-600 dark:text-foreground-300 font-mono flex-1 truncate">
                        {getQrLink(selectedTable) || 'N/A'}
                      </code>
                      {selectedTable.activeToken && (
                        <button
                          onClick={copyLink}
                          className="px-3 py-1.5 rounded-md bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-800 text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                        >
                          <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!isStaff && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRegenerateConfirm(true)}
                      className="flex-1 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={regenerateTokenMutation.isPending}
                    >
                      <i className="ri-refresh-line"></i> {regenerateTokenMutation.isPending ? 'Regenerating...' : 'Regenerate Link'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-2.5 px-4 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={deleteTableMutation.isPending}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={() => !regenerateTokenMutation.isPending && setShowRegenerateConfirm(false)}></div>
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
                  This will generate a new secure link for Table {selectedTable?.tableNumber}. The old QR code will no longer work and must be physically replaced on the table.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  disabled={regenerateTokenMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={regenerateQR}
                  disabled={regenerateTokenMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {regenerateTokenMutation.isPending ? 'Working...' : 'Regenerate'}
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
          <div className="absolute inset-0 bg-foreground-950/40 backdrop-blur-sm" onClick={() => !deleteTableMutation.isPending && setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-1">
                  Delete Table {selectedTable?.tableNumber}?
                </h3>
                <p className="text-sm text-foreground-500 font-body">
                  This action cannot be undone. You can reuse this table number later if needed.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteTableMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTable}
                  disabled={deleteTableMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {deleteTableMutation.isPending ? 'Working...' : 'Delete Table'}
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
              {createTableMutation.isError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium animate-fade-in flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg"></i>
                  {(createTableMutation.error as any).response?.data?.error || 'Failed to create table'}
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
                  disabled={createTableMutation.isPending}
                  className="flex-1 py-3 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addTable}
                  disabled={createTableMutation.isPending}
                  className="flex-1 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {createTableMutation.isPending ? 'Creating...' : 'Confirm'}
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