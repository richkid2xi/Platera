import { useState, useEffect } from 'react';
import type { MenuItem } from '@/mocks/menu';
import { categories } from '@/mocks/menu';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  editItem?: MenuItem | null;
}

const DEFAULT_IMAGE_URL = 'https://readdy.ai/api/search-image?query=Beautifully%20plated%20modern%20African%20dish%20on%20a%20white%20ceramic%20plate%20with%20elegant%20garnish%2C%20warm%20studio%20lighting%2C%20clean%20minimal%20composition%2C%20professional%20food%20photography%20style%2C%20top-down%20angle%2C%20high%20detail%2C%20vibrant%20colors&width=600&height=400&seq=platera-menu-default&orientation=landscape';

export default function AddEditModal({ isOpen, onClose, onSave, editItem }: AddEditModalProps) {
  const isEdit = !!editItem;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Mains',
    imageUrl: '',
    popular: false,
  });

  const [variantInput, setVariantInput] = useState({ name: '', price: '' });
  const [variants, setVariants] = useState<{ name: string; price: number }[]>([]);

  const [addonInput, setAddonInput] = useState({ name: '', price: '' });
  const [addOns, setAddOns] = useState<{ name: string; price: number }[]>([]);

  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description,
        price: String(editItem.price),
        category: editItem.category,
        imageUrl: editItem.image,
        popular: editItem.popular,
      });
      setVariants(editItem.variants || []);
      setAddOns(editItem.addOns || []);
      setImagePreview(editItem.image);
      setImageError(false);
    } else {
      setForm({ name: '', description: '', price: '', category: 'Mains', imageUrl: '', popular: false });
      setVariants([]);
      setAddOns([]);
      setImagePreview('');
      setImageError(false);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleImageUrlChange = (url: string) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setImageError(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const basePrice = Number(form.price);
    const finalImage = form.imageUrl || DEFAULT_IMAGE_URL;

    onSave({
      id: editItem ? editItem.id : Date.now(),
      name: form.name,
      description: form.description,
      price: basePrice,
      category: form.category,
      image: finalImage,
      available: editItem ? editItem.available : true,
      popular: form.popular,
      variants: variants.length > 0 ? variants : undefined,
      addOns: addOns.length > 0 ? addOns : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-foreground-950/40" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-xl w-full max-w-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
            {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer">
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
              <div className="flex gap-4">
                {/* Preview */}
                <div className="w-40 h-32 rounded-lg border-2 border-dashed border-background-200 dark:border-foreground-700 bg-background-50 dark:bg-foreground-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {imagePreview && !imageError ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-foreground-400">
                      <i className="ri-image-add-line text-xl"></i>
                      <span className="text-[10px] font-body">No image</span>
                    </div>
                  )}
                </div>
                {/* URL Input */}
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 placeholder-foreground-400 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                    placeholder="Paste image URL here to upload a photo..."
                  />
                  <p className="text-xs text-foreground-400 font-body">Paste any image URL to upload. Leave empty to use a default food photo.</p>
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
              <div>
                <label className="block text-sm font-medium text-foreground-700 dark:text-foreground-300 mb-1 font-body">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:border-primary-300 dark:focus:border-primary-600 font-body"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground-700 dark:text-foreground-300 font-body">Mark as Popular</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, popular: !form.popular })}
                  className={`relative w-10 h-5 rounded-full transition-all duration-200 cursor-pointer ${form.popular ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.popular ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
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
              className="flex-1 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all cursor-pointer"
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
    </div>
  );
}