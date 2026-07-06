import { useState } from 'react';

import { createPortal } from 'react-dom';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isBulk?: boolean;
  count?: number;
}

export default function DeleteConfirmModal({ isOpen, itemName, onCancel, onConfirm, isBulk, count }: DeleteConfirmModalProps) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleCancel = () => {
    setStep(1);
    onCancel();
  };

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setStep(1);
    onConfirm();
  };

  const title = isBulk ? `${count} items` : `"${itemName}"`;
  const message = isBulk
    ? `This will permanently delete ${count} menu items from your restaurant's menu.`
    : `This will permanently delete "${itemName}" from your restaurant's menu.`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-foreground-950/40" onClick={handleCancel}></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 shadow-xl w-full max-w-sm animate-scale-in overflow-hidden">
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          {step === 1 ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="ri-delete-bin-line text-2xl text-red-500"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">Delete {title}?</h3>
                <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">{message}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
                <i className="ri-error-warning-line text-2xl text-red-500"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 font-heading">Final Warning</h3>
                <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">
                  {isBulk
                    ? `You are about to permanently delete ${count} items. This cannot be undone.`
                    : 'This is your last chance. This action cannot be undone.'}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 rounded-lg border border-background-200 dark:border-foreground-700 text-foreground-600 dark:text-foreground-300 font-medium text-sm hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer text-white ${
              step === 1
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {step === 1 ? 'Yes, Delete' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}