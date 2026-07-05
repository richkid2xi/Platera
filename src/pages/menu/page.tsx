import { useState, useMemo, useCallback } from 'react';
import { menuItems, categories } from '@/mocks/menu';
import type { MenuItem } from '@/mocks/menu';
import AddEditModal from './components/AddEditModal';
import ItemDetailModal from './components/ItemDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';

function MenuItemCard({
  item,
  onToggle,
  onClick,
  isSelected,
  onSelect,
}: {
  item: MenuItem;
  onToggle: (id: number) => void;
  onClick: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-foreground-900 rounded-lg border overflow-hidden cursor-pointer hover-lift animate-fade-in-up group ${
        isSelected
          ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-background-200 dark:border-foreground-700'
      } ${!item.available ? 'opacity-60' : ''}`}
    >
      {/* Select checkbox */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(item.id, !isSelected); }}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
            isSelected
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'bg-white dark:bg-foreground-800 border-foreground-300 dark:border-foreground-600 hover:border-primary-400'
          }`}
        >
          {isSelected && <i className="ri-check-line text-xs"></i>}
        </button>
      </div>

      <div onClick={() => onClick(item.id)}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-foreground-900/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm font-heading">Sold Out</span>
            </div>
          )}
          {item.popular && (
            <div className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Popular
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <span className="bg-white/90 dark:bg-foreground-900/90 backdrop-blur-sm text-foreground-900 dark:text-foreground-100 text-sm font-bold px-2.5 py-1 rounded-lg font-heading">
              GH₵ {item.price}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading truncate">
            {item.name}
          </h3>
          <p className="text-xs text-foreground-400 line-clamp-2 font-body">{item.description}</p>
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-xs text-foreground-400 font-body">{item.category}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.available ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.available ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuListRow({
  item,
  onToggle,
  onClick,
  isSelected,
  onSelect,
}: {
  item: MenuItem;
  onToggle: (id: number) => void;
  onClick: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover-lift transition-all ${
        isSelected
          ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-700'
          : 'bg-white dark:bg-foreground-900 border-background-200 dark:border-foreground-700'
      } ${!item.available ? 'opacity-60' : ''}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(item.id, !isSelected); }}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
          isSelected
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-foreground-300 dark:border-foreground-600 hover:border-primary-400'
        }`}
      >
        {isSelected && <i className="ri-check-line text-[10px]"></i>}
      </button>
      <div onClick={() => onClick(item.id)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background-100 dark:bg-foreground-800">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading truncate">
            {item.name}
          </h3>
          <p className="text-xs text-foreground-400 mt-0.5 line-clamp-1 font-body">{item.description}</p>
          <span className="text-xs text-foreground-400 mt-0.5 block font-body">{item.category}</span>
        </div>
        <span className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading flex-shrink-0">
          GH₵ {item.price}
        </span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.available ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.available ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [bulkDeleteCount, setBulkDeleteCount] = useState<number | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  }, []);

  // Derive selected item from items array so toggles always sync
  const selectedItem = useMemo(
    () => (selectedItemId ? items.find((i) => i.id === selectedItemId) : null) ?? null,
    [selectedItemId, items]
  );

  const toggleAvailability = useCallback((id: number) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      );
      const toggled = updated.find((i) => i.id === id);
      if (toggled) {
        const msg = toggled.available
          ? `${toggled.name} is now available`
          : `${toggled.name} marked as sold out`;
        showToast(msg, toggled.available ? 'success' : 'warning');
      }
      return updated;
    });
  }, [showToast]);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => [item, ...prev]);
    showToast(`${item.name} added to menu`, 'success');
  }, [showToast]);

  const updateItem = useCallback((updatedItem: MenuItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    showToast(`${updatedItem.name} updated`, 'success');
  }, [showToast]);

  const deleteItem = useCallback((item: MenuItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setDeleteTarget(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    showToast(`${item.name} deleted from menu`, 'info');
  }, [showToast]);

  const bulkDelete = useCallback(() => {
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    const count = selectedIds.size;
    setSelectedIds(new Set());
    setBulkDeleteCount(null);
    showToast(`${count} items deleted`, 'info');
  }, [selectedIds, showToast]);

  const bulkMarkUnavailable = useCallback(() => {
    setItems((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, available: false } : i))
    );
    const count = selectedIds.size;
    setSelectedIds(new Set());
    showToast(`${count} items marked as unavailable`, 'warning');
  }, [selectedIds, showToast]);

  const toggleSelect = useCallback((id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [items, activeCategory, searchQuery]
  );

  const toggleSelectAll = useCallback(() => {
    const allIds = filteredItems.map((i) => i.id);
    if (selectedIds.size === allIds.length && allIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [selectedIds.size, filteredItems]);

  const handleEdit = useCallback((item: MenuItem) => {
    setEditItem(item);
  }, []);

  const isAllSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">
            Menu Management
          </h1>
          <p className="text-sm text-foreground-400 mt-1 font-body">
            {items.length} items · {items.filter((i) => !i.available).length} unavailable · across {categories.length - 1} categories
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i> Add New Item
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50/80 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 animate-fade-in-up">
          <button
            onClick={toggleSelectAll}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
              isAllSelected
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-foreground-300 dark:border-foreground-600 hover:border-primary-400'
            }`}
          >
            {isAllSelected && <i className="ri-check-line text-[10px]"></i>}
          </button>
          <span className="text-sm font-medium text-foreground-700 dark:text-foreground-300 font-body">
            {selectedIds.size} selected
          </span>
          <div className="flex-1"></div>
          <button
            onClick={bulkMarkUnavailable}
            className="px-3 py-2 rounded-lg text-sm font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-eye-off-line mr-1"></i> Mark Unavailable
          </button>
          <button
            onClick={() => setBulkDeleteCount(selectedIds.size)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line mr-1"></i> Delete
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer"
            >
              <i className="ri-close-circle-line text-sm"></i>
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex bg-background-100 dark:bg-foreground-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm'
                : 'text-foreground-400 hover:text-foreground-600'
            }`}
          >
            <i className="ri-grid-fill"></i>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm'
                : 'text-foreground-400 hover:text-foreground-600'
            }`}
          >
            <i className="ri-list-unordered"></i>
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="appearance-none pl-3 pr-10 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 cursor-pointer font-body"
          >
            {categories.map((cat) => {
              const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
              return (
                <option key={cat} value={cat}>{cat} ({count})</option>
              );
            })}
          </select>
          <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none text-sm"></i>
        </div>
      </div>

      {/* Items */}
      {filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onToggle={toggleAvailability}
                onClick={setSelectedItemId}
                isSelected={selectedIds.has(item.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => (
              <MenuListRow
                key={item.id}
                item={item}
                onToggle={toggleAvailability}
                onClick={setSelectedItemId}
                isSelected={selectedIds.has(item.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-background-100 dark:bg-foreground-800 flex items-center justify-center mb-4">
            <i className="ri-restaurant-2-line text-2xl text-foreground-400"></i>
          </div>
          <h3 className="text-base font-semibold text-foreground-700 dark:text-foreground-300 font-heading">
            No items found
          </h3>
          <p className="text-sm text-foreground-400 mt-1 font-body">
            {searchQuery ? 'Try adjusting your search or category filter.' : 'This category is empty. Add some items to get started!'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setEditItem(null); setShowAddModal(true); }}
              className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i> Add Item
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editItem) && (
        <AddEditModal
          isOpen={showAddModal || !!editItem}
          onClose={() => { setShowAddModal(false); setEditItem(null); }}
          onSave={editItem ? updateItem : addItem}
          editItem={editItem}
        />
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onToggle={toggleAvailability}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteItem(deleteTarget)}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={bulkDeleteCount !== null}
        itemName=""
        onCancel={() => setBulkDeleteCount(null)}
        onConfirm={bulkDelete}
        isBulk
        count={bulkDeleteCount ?? 0}
      />
    </div>
  );
}