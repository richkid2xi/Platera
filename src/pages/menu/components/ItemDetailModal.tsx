import { createPortal } from 'react-dom';
import type { MenuItem } from '@/types/menu';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onToggle: (id: number) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export default function ItemDetailModal({ item, onClose, onToggle, onEdit, onDelete }: ItemDetailModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-foreground-950/40" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-xl w-full max-w-md animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative h-48">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-foreground-900/80 backdrop-blur-sm flex items-center justify-center text-foreground-600 dark:text-foreground-300 hover:text-foreground-900 cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
          {item.popular && (
            <div className="absolute top-3 left-3 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Popular
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-foreground-900/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm font-heading bg-foreground-900/50 px-3 py-1 rounded-full">Sold Out</span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-3">
          {/* Title + Price */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                {item.name}
              </h2>
              <span className="text-xs text-primary-500 font-medium font-body">{item.category}</span>
            </div>
            <span className="text-lg font-bold text-primary-500 font-heading">GH₵ {item.price}</span>
          </div>

          <p className="text-sm text-foreground-500 dark:text-foreground-400 font-body">{item.description}</p>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                Variants
              </h4>
              <div className="flex flex-col gap-1">
                {item.variants.map((v) => (
                  <div key={v.name} className="flex items-center justify-between py-1.5 border-b border-background-100 dark:border-foreground-800 last:border-b-0">
                    <span className="text-sm text-foreground-700 dark:text-foreground-300 font-body">{v.name}</span>
                    <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading">GH₵ {v.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-2 font-body">
                Add-ons
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.addOns.map((a) => (
                  <span
                    key={a.name}
                    className="text-xs bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 px-3 py-1 rounded-full font-body"
                  >
                    {a.name} (+GH₵ {a.price})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-background-100 dark:border-foreground-800">
            <span className="text-sm text-foreground-500 dark:text-foreground-400 font-body">Available for ordering:</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.available
                    ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {item.available ? 'In Stock' : 'Sold Out'}
              </span>
              <button
                onClick={() => onToggle(item.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.available ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.available ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="flex-1 py-2.5 rounded-lg border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-medium text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line mr-1"></i> Edit
            </button>
            <button
              onClick={() => { onClose(); onDelete(item); }}
              className="flex-1 py-2.5 rounded-lg border border-red-200 dark:border-red-800/50 text-red-500 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line mr-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}