import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

export default function UnsavedChangesModal() {
  const { isWarningVisible, unsavedDiff, confirmDiscard, cancelDiscard } = useUnsavedChanges();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isWarningVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-foreground-950/40 dark:bg-foreground-950/60 backdrop-blur-sm"
        onClick={cancelDiscard}
      ></div>
      <div className="relative bg-white dark:bg-foreground-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-background-200 dark:border-foreground-800 flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-background-200 dark:border-foreground-800">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-error-warning-fill text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Unsaved Changes</h2>
              <p className="text-xs text-foreground-500 font-body">Are you sure you want to discard?</p>
            </div>
          </div>
          <button 
            onClick={cancelDiscard}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto font-body">
          <p className="text-sm text-foreground-600 dark:text-foreground-300 mb-4">
            If you leave now, the following changes will be lost forever:
          </p>
          <ul className="space-y-3">
            {unsavedDiff.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground-800 dark:text-foreground-200 bg-background-50 dark:bg-foreground-800/50 p-3 rounded-lg border border-background-100 dark:border-foreground-800/50">
                <i className="ri-pencil-line text-primary-500 mt-0.5"></i>
                <span dangerouslySetInnerHTML={{ __html: diff }}></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-900/50">
          <button
            onClick={cancelDiscard}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg text-foreground-600 dark:text-foreground-300 hover:bg-background-200 dark:hover:bg-foreground-800 transition-all cursor-pointer font-body"
          >
            Go Back
          </button>
          <button
            onClick={confirmDiscard}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer font-body shadow-lg shadow-red-500/20"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
