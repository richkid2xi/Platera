import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/base/PageHeader';
import { useRefresh } from '@/contexts/RefreshContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import type { MenuItem } from '@/types/menu';
import AddEditModal from './components/AddEditModal';
import ItemDetailModal from './components/ItemDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import StatusConfirmModal from './components/StatusConfirmModal';
import Toast from './components/Toast';
import { apiClient } from '@/api/client';

function MenuItemCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 overflow-hidden animate-pulse">
      <div className="h-40 bg-background-200 dark:bg-foreground-800"></div>
      <div className="p-4 flex flex-col gap-2">
        <div className="w-3/4 h-5 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="w-full h-4 bg-background-200 dark:bg-foreground-800 rounded mt-1"></div>
        <div className="w-2/3 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="w-16 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
          <div className="w-11 h-6 bg-background-200 dark:bg-foreground-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

function MenuListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-white dark:bg-foreground-900 border-background-200 dark:border-foreground-700 animate-pulse">
      <div className="w-5 h-5 rounded bg-background-200 dark:bg-foreground-800 flex-shrink-0"></div>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-16 h-12 rounded-lg bg-background-200 dark:bg-foreground-800 flex-shrink-0"></div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="w-1/3 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
          <div className="w-1/2 h-3 bg-background-200 dark:bg-foreground-800 rounded"></div>
          <div className="w-16 h-3 bg-background-200 dark:bg-foreground-800 rounded"></div>
        </div>
        <div className="w-16 h-5 bg-background-200 dark:bg-foreground-800 rounded flex-shrink-0"></div>
      </div>
      <div className="w-11 h-6 bg-background-200 dark:bg-foreground-800 rounded-full flex-shrink-0"></div>
    </div>
  );
}

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
      className={`relative bg-white dark:bg-foreground-900 rounded-lg border overflow-hidden cursor-pointer hover-lift animate-fade-in-up group ${isSelected
          ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-background-200 dark:border-foreground-700'
        } ${!item.available ? 'opacity-60' : ''}`}
    >
      {/* Select checkbox */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(item.id, !isSelected); }}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'bg-white dark:bg-foreground-800 border-foreground-300 dark:border-foreground-600 hover:border-primary-400'
            }`}
        >
          {isSelected && <i className="ri-check-line text-xs"></i>}
        </button>
      </div>

      <div onClick={() => onClick(item.id)}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden bg-background-100 dark:bg-foreground-800">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-foreground-400">
               <i className="ri-restaurant-line text-3xl"></i>
             </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-foreground-900/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm font-heading px-3 py-1 rounded bg-black/50 backdrop-blur-sm">Sold Out</span>
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
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading truncate">
              {item.name}
            </h3>
            {(item.requiresPrep !== false && item.prepTime) && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-foreground-500 bg-background-50 dark:bg-foreground-800 px-1.5 py-0.5 rounded flex-shrink-0 border border-background-100 dark:border-foreground-700">
                <i className="ri-time-line"></i> {item.prepTime}m
              </div>
            )}
          </div>
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
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover-lift transition-all ${isSelected
          ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-700'
          : 'bg-white dark:bg-foreground-900 border-background-200 dark:border-foreground-700'
        } ${!item.available ? 'opacity-60' : ''}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(item.id, !isSelected); }}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${isSelected
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-foreground-300 dark:border-foreground-600 hover:border-primary-400'
          }`}
      >
        {isSelected && <i className="ri-check-line text-[10px]"></i>}
      </button>
      <div onClick={() => onClick(item.id)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background-100 dark:bg-foreground-800 relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-400">
               <i className="ri-restaurant-line text-xl"></i>
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-foreground-900/50 flex items-center justify-center">
              <span className="text-white font-bold text-[10px] tracking-wide uppercase">Sold Out</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading truncate">
              {item.name}
            </h3>
            {item.popular && (
              <span className="bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                Popular
              </span>
            )}
            {(item.requiresPrep !== false && item.prepTime) && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-foreground-500 bg-background-50 dark:bg-foreground-800 px-1.5 py-0.5 rounded border border-background-100 dark:border-foreground-700 flex-shrink-0">
                <i className="ri-time-line"></i> {item.prepTime}m
              </span>
            )}
          </div>
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
  const { isRefreshing } = useRefresh();
  const { markStepComplete } = useOnboarding();
  const queryClient = useQueryClient();

  // Categories include { id, name, displayOrder, items: MenuItem[] }
  const { data: categoryData = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await apiClient.get('/menu');
      return res.data;
    }
  });

  const categories = ['All', ...categoryData.map((c: any) => c.name)];
  const items: MenuItem[] = categoryData.flatMap((c: any) => c.items);
  const categoryIdMap = categoryData.reduce((acc: any, c: any) => {
    acc[c.name] = c.id;
    return acc;
  }, {});

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Custom Category Dropdown State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set()); // Clear bulk selection when filters change
  }, [searchQuery, activeCategory]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [bulkDeleteCount, setBulkDeleteCount] = useState<number | null>(null);

  // Status confirm modal
  const [statusTargetCount, setStatusTargetCount] = useState<number | null>(null);
  const [isMakingAvailable, setIsMakingAvailable] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const selectedItem = useMemo(
    () => (selectedItemId ? items.find((i) => i.id === selectedItemId) : null) ?? null,
    [selectedItemId, items]
  );

  const mutationAvailability = useMutation({
    mutationFn: async (args: { id: string | number, available: boolean }) => {
      const res = await apiClient.patch(`/menu/items/${args.id}/availability`, { available: args.available });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      const item = items.find(i => i.id === variables.id);
      if (item) {
        showToast(`${item.name} is now ${variables.available ? 'available' : 'sold out'}`, variables.available ? 'success' : 'warning');
      }
    }
  });

  const toggleAvailability = useCallback((id: string | number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    mutationAvailability.mutate({ id, available: !item.available });
  }, [items, mutationAvailability]);


  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      let categoryId = categoryIdMap[itemData.category];
      
      // If custom category, create it first
      if (!categoryId) {
        const catRes = await apiClient.post('/menu/categories', { 
          name: itemData.category,
          displayOrder: categoryData.length
        });
        categoryId = catRes.data.id;
      }

      // Create Item
      const res = await apiClient.post('/menu/items', {
        categoryId,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        prepTime: itemData.prepTime || 0,
        popular: itemData.popular,
        available: itemData.available,
        image: itemData.imageFile ? undefined : itemData.image, // pass URL only if no file
        variants: itemData.variants || [],
        addOns: itemData.addOns || []
      });

      const newItem = res.data;

      // Upload image if file provided
      if (itemData.imageFile) {
        const formData = new FormData();
        formData.append('image', itemData.imageFile);
        await apiClient.post(`/menu/items/${newItem.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      return newItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast(`${data.name} added to menu`, 'success');
      markStepComplete("menu_item");
    },
    onError: () => {
      showToast(`Failed to add item`, 'error');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      let categoryId = categoryIdMap[itemData.category];
      if (!categoryId) {
         const catRes = await apiClient.post('/menu/categories', { 
           name: itemData.category,
           displayOrder: categoryData.length
         });
         categoryId = catRes.data.id;
      }

      await apiClient.put(`/menu/items/${itemData.id}`, {
        categoryId,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        prepTime: itemData.prepTime || 0,
        popular: itemData.popular,
        available: itemData.available,
        image: itemData.imageFile ? undefined : itemData.image,
        variants: itemData.variants || [],
        addOns: itemData.addOns || []
      });

      if (itemData.imageFile) {
        const formData = new FormData();
        formData.append('image', itemData.imageFile);
        await apiClient.post(`/menu/items/${itemData.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast(`${variables.name} updated`, 'success');
    },
    onError: () => {
      showToast(`Failed to update item`, 'error');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(`/menu/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast(`Item deleted`, 'info');
      setDeleteTarget(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      for (const id of ids) {
         await apiClient.delete(`/menu/items/${id}`);
      }
    },
    onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ['menu'] });
       showToast(`${variables.length} items deleted`, 'info');
       setSelectedIds(new Set());
       setBulkDeleteCount(null);
    }
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async (args: { ids: (string | number)[], available: boolean }) => {
      for (const id of args.ids) {
         await apiClient.patch(`/menu/items/${id}/availability`, { available: args.available });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast(`${variables.ids.length} items marked as ${variables.available ? 'available' : 'sold out'}`, variables.available ? 'success' : 'warning');
      setSelectedIds(new Set());
      setStatusTargetCount(null);
    }
  });

  const addItem = useCallback((item: any) => {
    createItemMutation.mutate(item);
  }, [createItemMutation]);

  const updateItem = useCallback((updatedItem: any) => {
    updateItemMutation.mutate(updatedItem);
  }, [updateItemMutation]);

  const deleteItem = useCallback((item: MenuItem) => {
    deleteItemMutation.mutate(item.id);
  }, [deleteItemMutation]);

  const bulkDelete = useCallback(() => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  }, [selectedIds, bulkDeleteMutation]);

  const handleBulkStatusClick = () => {
    const allUnavailable = Array.from(selectedIds).every(id => {
      const item = items.find(i => i.id === id);
      return item && !item.available;
    });

    setIsMakingAvailable(allUnavailable);
    setStatusTargetCount(selectedIds.size);
  };

  const confirmBulkStatus = useCallback(() => {
    bulkStatusMutation.mutate({ ids: Array.from(selectedIds), available: isMakingAvailable });
  }, [selectedIds, isMakingAvailable, bulkStatusMutation]);

  const toggleSelect = useCallback((id: string | number, selected: boolean) => {
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

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    const allIds = paginatedItems.map((i) => i.id);
    let allSelected = true;
    for (const id of allIds) {
      if (!selectedIds.has(id)) {
        allSelected = false;
        break;
      }
    }

    if (allSelected && allIds.length > 0) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        for (const id of allIds) next.delete(id);
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        for (const id of allIds) next.add(id);
        return next;
      });
    }
  }, [selectedIds, paginatedItems]);

  const handleEdit = useCallback((item: MenuItem) => {
    setEditItem(item);
  }, []);

  const isAllSelected = paginatedItems.length > 0 && paginatedItems.every(i => selectedIds.has(i.id));

  const isAllSelectionUnavailable = selectedIds.size > 0 && Array.from(selectedIds).every(id => {
    const item = items.find(i => i.id === id);
    return item && !item.available;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Menu Management"
        description={`${items.length} items · ${items.filter((i) => !i.available).length} unavailable · across ${categories.length - 1} categories`}
      >
        <button
          onClick={() => { setEditItem(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm hover:-translate-y-0.5"
        >
          <i className="ri-add-line"></i> Add New Item
        </button>
      </PageHeader>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50/80 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 animate-fade-in-up">
          <button
            onClick={toggleSelectAll}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${isAllSelected
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
            onClick={handleBulkStatusClick}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${isAllSelectionUnavailable
                ? 'text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-800 hover:bg-accent-50 dark:hover:bg-accent-900/20'
              }`}
          >
            <i className={`${isAllSelectionUnavailable ? 'ri-check-line' : 'ri-eye-off-line'} mr-1`}></i>
            {isAllSelectionUnavailable ? 'Mark Available' : 'Mark Unavailable'}
          </button>
          <button
            onClick={() => setBulkDeleteCount(selectedIds.size)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line mr-1"></i> Delete
          </button>
        </div>
      )}

      {/* Toolbar (Inline layout) */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-white dark:bg-foreground-900 p-2 rounded-lg border border-background-200 dark:border-foreground-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border-0 bg-transparent text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-body transition-shadow"
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

        <div className="hidden md:block w-px h-6 bg-background-200 dark:bg-foreground-700"></div>

        {/* View Toggle */}
        <div className="flex bg-background-50 dark:bg-foreground-800/50 rounded-md p-1 w-full md:w-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm'
                : 'text-foreground-400 hover:text-foreground-600'
              }`}
          >
            <i className="ri-grid-fill"></i>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm'
                : 'text-foreground-400 hover:text-foreground-600'
              }`}
          >
            <i className="ri-list-unordered"></i>
          </button>
        </div>

        <div className="hidden md:block w-px h-6 bg-background-200 dark:bg-foreground-700"></div>

        {/* Custom Category Dropdown */}
        <div className="relative w-full md:w-48" ref={categoryDropdownRef}>
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex items-center justify-between pl-3 pr-3 py-2 rounded-md border-0 bg-transparent text-sm font-semibold text-foreground-900 dark:text-foreground-100 hover:bg-background-50 dark:hover:bg-foreground-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer font-body"
          >
            <span className="truncate">
              {activeCategory} {activeCategory === 'All' ? `(${items.length})` : `(${items.filter(i => i.category === activeCategory).length})`}
            </span>
            <i className={`ri-arrow-down-s-line text-foreground-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-foreground-900 rounded-lg shadow-xl border border-background-200 dark:border-foreground-800 py-1 max-h-60 overflow-y-auto animate-fade-in-up">
              {categories.map((cat) => {
                const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold'
                        : 'text-foreground-700 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800'
                      }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-xs ${isSelected ? 'text-primary-500/70' : 'text-foreground-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      {isRefreshing || isLoading ? (
        <div className="flex flex-col gap-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[400px] content-start">
              {Array.from({ length: 8 }).map((_, idx) => (
                <MenuItemCardSkeleton key={`skel-grid-${idx}`} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 min-h-[400px]">
              {Array.from({ length: 8 }).map((_, idx) => (
                <MenuListRowSkeleton key={`skel-list-${idx}`} />
              ))}
            </div>
          )}
        </div>
      ) : paginatedItems.length > 0 ? (
        <div className="flex flex-col gap-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[400px] content-start">
              {paginatedItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggle={toggleAvailability}
                  onClick={(id) => setSelectedItemId(id)}
                  isSelected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 min-h-[400px]">
              {paginatedItems.map((item) => (
                <MenuListRow
                  key={item.id}
                  item={item}
                  onToggle={toggleAvailability}
                  onClick={(id) => setSelectedItemId(id)}
                  isSelected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-background-200 dark:border-foreground-800 pt-4 mt-2">
              <span className="text-sm text-foreground-500 font-body">
                Showing <span className="font-semibold text-foreground-900 dark:text-foreground-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-foreground-900 dark:text-foreground-100">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-semibold text-foreground-900 dark:text-foreground-100">{filteredItems.length}</span> items
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50 dark:hover:bg-foreground-800 transition-colors"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${currentPage === page
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-foreground-600 hover:bg-background-50 dark:hover:bg-foreground-800'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50 dark:hover:bg-foreground-800 transition-colors"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>
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
          categories={categories.filter(c => c !== 'All')}
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

      {/* Bulk Status Confirmation */}
      <StatusConfirmModal
        isOpen={statusTargetCount !== null}
        onCancel={() => setStatusTargetCount(null)}
        onConfirm={confirmBulkStatus}
        count={statusTargetCount ?? 0}
        isMakingAvailable={isMakingAvailable}
      />
    </div>
  );
}