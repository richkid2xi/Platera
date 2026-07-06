import { createPortal } from 'react-dom';

interface StatusConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  count: number;
  isMakingAvailable: boolean;
}

export default function StatusConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  count,
  isMakingAvailable,
}: StatusConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in p-4">
      <div className="absolute inset-0 bg-background-950/20 dark:bg-background-950/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl shadow-2xl border border-background-200 dark:border-foreground-700 w-full max-w-sm overflow-hidden animate-scale-in text-center p-6">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
          isMakingAvailable 
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' 
            : 'bg-accent-100 dark:bg-accent-900/30 text-accent-500'
        }`}>
          <i className={`text-2xl ${isMakingAvailable ? 'ri-check-line' : 'ri-eye-off-line'}`}></i>
        </div>
        
        <h3 className="text-xl font-heading font-bold text-foreground-900 dark:text-foreground-100 mb-2">
          {isMakingAvailable ? 'Mark Available?' : 'Mark as Sold Out?'}
        </h3>
        
        <p className="text-sm text-foreground-500 dark:text-foreground-400 font-body mb-6">
          You are about to mark <strong>{count}</strong> {count === 1 ? 'item' : 'items'} as {isMakingAvailable ? 'available for sale again' : 'sold out and unavailable'}. Are you sure you want to proceed?
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground-600 dark:text-foreground-300 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors ${
              isMakingAvailable
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-accent-500 hover:bg-accent-600'
            }`}
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
