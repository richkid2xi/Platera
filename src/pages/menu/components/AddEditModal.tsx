import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import type { MenuItem } from '@/mocks/menu';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  editItem?: MenuItem | null;
  categories: string[];
}

const DEFAULT_IMAGE_URL = 'https://readdy.ai/api/search-image?query=Beautifully%20plated%20modern%20African%20dish%20on%20a%20white%20ceramic%20plate%20with%20elegant%20garnish%2C%20warm%20studio%20lighting%2C%20clean%20minimal%20composition%2C%20professional%20food%20photography%20style%2C%20top-down%20angle%2C%20high%20detail%2C%20vibrant%20colors&width=600&height=400&seq=platera-menu-default&orientation=landscape';

export default function AddEditModal({ isOpen, onClose, onSave, editItem, categories }: AddEditModalProps) {
  const isEdit = !!editItem;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0] || 'Mains',
    imageUrl: '',
    popular: false,
    requiresPrep: true,
    prepTime: 15,
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  const [variantInput, setVariantInput] = useState({ name: '', price: '' });
  const [variants, setVariants] = useState<{ name: string; price: number }[]>([]);

  const [addonInput, setAddonInput] = useState({ name: '', price: '' });
  const [addOns, setAddOns] = useState<{ name: string; price: number }[]>([]);

  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState(false);

  const { setUnsavedDiff, checkUnsaved, unsavedDiff } = useUnsavedChanges();

  useEffect(() => {
    const diffs: string[] = [];
    if (editItem) {
      if (form.name !== editItem.name) diffs.push(`Name changed to <b>${form.name}</b>`);
      if (form.price !== String(editItem.price)) diffs.push(`Price changed to <b>${form.price}</b>`);
      if (form.description !== editItem.description) diffs.push(`Description modified`);
      const finalCategory = isCustomCategory ? customCategoryName : form.category;
      if (finalCategory !== editItem.category) diffs.push(`Category changed to <b>${finalCategory}</b>`);
      if (form.requiresPrep !== editItem.requiresPrep) diffs.push(`Requires Prep toggled`);
      if (form.requiresPrep && form.prepTime !== editItem.prepTime) diffs.push(`Prep time changed to <b>${form.prepTime}m</b>`);
    } else {
      if (form.name || form.price || form.description) {
        diffs.push(`New unsaved item: <b>${form.name || 'Untitled'}</b>`);
      }
    }
    setUnsavedDiff(diffs);
  }, [form, isCustomCategory, customCategoryName, editItem, setUnsavedDiff]);

  const handleClose = () => {
    checkUnsaved(() => {
      setUnsavedDiff([]); // clear on actual close
      onClose();
    });
  };

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description,
        price: String(editItem.price),
        category: categories.includes(editItem.category) ? editItem.category : 'custom',
        imageUrl: editItem.image,
        popular: editItem.popular,
        requiresPrep: editItem.requiresPrep ?? true,
        prepTime: editItem.prepTime ?? 15,
      });
      if (!categories.includes(editItem.category)) {
        setIsCustomCategory(true);
        setCustomCategoryName(editItem.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategoryName('');
      }
      setVariants(editItem.variants || []);
      setAddOns(editItem.addOns || []);
      setImagePreview(editItem.image);
      setImageError(false);
    } else {
      setForm({ name: '', description: '', price: '', category: categories[0] || 'Mains', imageUrl: '', popular: false, requiresPrep: true, prepTime: 15 });
      setIsCustomCategory(false);
      setCustomCategoryName('');
      setVariants([]);
      setAddOns([]);
      setImagePreview('');
      setImageError(false);
    }
  }, [editItem, isOpen, categories]);

  if (!isOpen) return null;

  const handleImageUrlChange = (url: string) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setImageError(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setForm(prev => ({ ...prev, imageUrl: result }));
      setImagePreview(result);
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const addVariant = () => {
    if (!variantInput.name || !variantInput.price) return;
    setVariants(prev => [...prev, { name: variantInput.name, price: Number(variantInput.price) }]);
    setVariantInput({ name: '', price: '' });
  };

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const addAddon = () => {
    if (!addonInput.name || !addonInput.price) return;
    setAddOns(prev => [...prev, { name: addonInput.name, price: Number(addonInput.price) }]);
    setAddonInput({ name: '', price: '' });
  };

  const removeAddon = (idx: number) => {
    setAddOns(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomCategory(true);
      setForm({ ...form, category: 'custom' });
    } else {
      setIsCustomCategory(false);
      setForm({ ...form, category: val });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const finalCategory = isCustomCategory ? customCategoryName : form.category;
    if (!finalCategory) return; // Prevent empty category

    const basePrice = Number(form.price);
    const finalImage = form.imageUrl || DEFAULT_IMAGE_URL;

    onSave({
      id: editItem ? editItem.id : Date.now(),
      name: form.name,
      description: form.description,
      price: basePrice,
      category: finalCategory,
      image: finalImage,
      available: editItem ? editItem.available : true,
      popular: form.popular,
      requiresPrep: form.requiresPrep,
      prepTime: form.requiresPrep ? form.prepTime : undefined,
      variants: variants.length > 0 ? variants : undefined,
      addOns: addOns.length > 0 ? addOns : undefined,
    });
    setUnsavedDiff([]);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-foreground-950/40 dark:bg-foreground-950/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-foreground-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-background-200 dark:border-foreground-800">

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-background-200 dark:border-foreground-800 bg-background-50/50 dark:bg-foreground-900/50">
          <div>
            <h2 className="text-xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">
              {isEdit ? 'Edit Menu Item' : 'Add New Item'}
            </h2>
            <p className="text-sm text-foreground-500 mt-1 font-body">
              {isEdit ? 'Update item details and availability' : 'Create a new item for your menu'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-400 hover:bg-background-200 dark:hover:bg-foreground-800 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 flex flex-col gap-5">
            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-2 font-body">
                Item Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview */}
                <div className="w-full sm:w-40 h-40 sm:h-32 rounded-lg border-2 border-dashed border-background-200 dark:border-foreground-700 bg-background-50 dark:bg-foreground-800 flex-shrink-0 overflow-hidden flex items-center justify-center relative group">
                  {imagePreview && !imageError ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-foreground-400">
                      <i className="ri-image-add-line text-2xl"></i>
                      <span className="text-xs font-body">No image</span>
                    </div>
                  )}
                  {/* Overlay for quick action */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <i className="ri-camera-fill text-white text-2xl drop-shadow-md"></i>
                  </div>
                </div>
                {/* Upload Controls */}
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-800 text-sm font-semibold text-foreground-700 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-700 transition-colors shadow-sm"
                    >
                      <i className="ri-upload-cloud-2-line"></i>
                      Upload Photo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-foreground-400">
                    <div className="h-px bg-background-200 dark:bg-foreground-700 flex-1"></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">OR</span>
                    <div className="h-px bg-background-200 dark:bg-foreground-700 flex-1"></div>
                  </div>

                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                    placeholder="Paste image URL here..."
                  />
                </div>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="e.g. Jollof Rice with Chicken"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">
                  Price (GH₵) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">
                  Category
                </label>
                {isCustomCategory ? (
                  <div className="flex items-center gap-2 relative">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="New Category Name"
                      className="w-full px-3 py-2.5 rounded-lg border border-primary-300 dark:border-primary-600 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-body"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => { setIsCustomCategory(false); setForm({ ...form, category: categories[0] || 'Mains' }); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 cursor-pointer bg-white dark:bg-foreground-900 px-1"
                    >
                      <i className="ri-close-circle-line text-xl"></i>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={handleCategoryChange}
                      className="w-full appearance-none px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body cursor-pointer transition-shadow"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom" className="font-semibold text-primary-500">
                        + Add Custom Category...
                      </option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none"></i>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body resize-none"
                  rows={3}
                  placeholder="Describe the dish, ingredients, and flavor..."
                  maxLength={300}
                />
                <p className="text-xs text-foreground-400 mt-1 text-right font-body">{form.description.length}/300</p>
              </div>
              {/* Popular Toggle */}
              <div className="flex items-center justify-between bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-100 dark:border-foreground-800">
                <label className="text-sm font-medium text-foreground-700 dark:text-foreground-300 font-body">Mark as Popular</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, popular: !form.popular })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.popular ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.popular ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Prep Time */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background-50 dark:bg-foreground-800/50 p-4 rounded-lg border border-background-100 dark:border-foreground-800 mt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-foreground-700 dark:text-foreground-300 font-body">Requires Preparation</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, requiresPrep: !form.requiresPrep })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.requiresPrep ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.requiresPrep ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <span className="text-xs text-foreground-400 font-body">Turn off if item is served instantly (e.g. bottled drinks)</span>
                </div>

                {form.requiresPrep && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground-600 dark:text-foreground-400 font-body">Est. Time:</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.prepTime}
                        onChange={(e) => setForm({ ...form, prepTime: parseInt(e.target.value) || 0 })}
                        className="w-24 pl-3 pr-8 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                        placeholder="15"
                        min="1"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-400 pointer-events-none">
                        min
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variants */}
            <div className="border-t border-background-100 dark:border-foreground-800 pt-5">
              <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-3 font-body">
                Variants (e.g. protein options, sizes)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={variantInput.name}
                  onChange={(e) => setVariantInput({ ...variantInput, name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="Variant name (e.g. With Fish)"
                />
                <input
                  type="number"
                  value={variantInput.price}
                  onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                  className="w-24 px-3 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line"></i> Add
                </button>
              </div>
              {variants.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background-50 dark:bg-foreground-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-foreground-700 dark:text-foreground-300 font-body">{v.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">GH₵ {v.price}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-foreground-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div className="border-t border-background-100 dark:border-foreground-800 pt-5">
              <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-3 font-body">
                Add-ons (e.g. extra sauce, sides)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={addonInput.name}
                  onChange={(e) => setAddonInput({ ...addonInput, name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="Add-on name (e.g. Extra Pepper)"
                />
                <input
                  type="number"
                  value={addonInput.price}
                  onChange={(e) => setAddonInput({ ...addonInput, price: e.target.value })}
                  className="w-24 px-3 py-2 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={addAddon}
                  className="px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line"></i> Add
                </button>
              </div>
              {addOns.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {addOns.map((a, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 bg-background-50 dark:bg-foreground-800/50 rounded-full px-3 py-1.5">
                      <span className="text-sm text-foreground-700 dark:text-foreground-300 font-body">
                        {a.name} (+GH₵ {a.price})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAddon(idx)}
                        className="text-foreground-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-circle-line text-sm"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-background-200 dark:border-foreground-800 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={unsavedDiff.length === 0}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${unsavedDiff.length > 0 ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
            >
              {isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>

          <input
            type="text"
            name="company_alt"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            readOnly
            className="website-alt-field"
          />
        </form>
      </div>
    </div>,
    document.body
  );
}