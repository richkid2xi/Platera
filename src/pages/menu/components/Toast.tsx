import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const iconMap = {
    success: 'ri-checkbox-circle-line text-secondary-500',
    info: 'ri-information-line text-primary-500',
    warning: 'ri-alert-line text-accent-500',
    error: 'ri-error-warning-line text-red-500',
  };

  const bgMap = {
    success: 'border-secondary-200 dark:border-secondary-800',
    info: 'border-primary-200 dark:border-primary-800',
    warning: 'border-accent-200 dark:border-accent-800',
    error: 'border-red-200 dark:border-red-800',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm animate-slide-in-right`}>
      <div className={`bg-white dark:bg-foreground-900 rounded-lg border ${bgMap[type]} shadow-lg p-4 flex items-center gap-3`}>
        <div className="w-8 h-8 rounded-full bg-background-100 dark:bg-foreground-800 flex items-center justify-center flex-shrink-0">
          <i className={`${iconMap[type]} text-lg`}></i>
        </div>
        <p className="text-sm text-foreground-800 dark:text-foreground-200 font-body flex-1">{message}</p>
        <button onClick={onClose} className="text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 cursor-pointer flex-shrink-0">
          <i className="ri-close-line"></i>
        </button>
      </div>
    </div>
  );
}