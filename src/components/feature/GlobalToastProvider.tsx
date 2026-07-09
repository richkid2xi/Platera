import { useEffect, useState } from 'react';
import Toast from '@/pages/menu/components/Toast';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function GlobalToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message, type } = customEvent.detail;
      
      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type: type || 'error',
      };
      
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('global:toast', handleToastEvent);
    
    // Also catch unhandled promises globally
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the default browser console error
      event.preventDefault();
      
      // We don't want to show generic network errors here if Axios is already handling them,
      // but this is a good catch-all for weird JS errors.
      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        message: 'An unexpected error occurred.',
        type: 'error',
      };
      setToasts((prev) => [...prev, newToast]);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('global:toast', handleToastEvent);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          {/* We wrap the Toast to position it properly in the stack, since Toast component uses fixed positioning by default.
              Wait, the Toast component uses fixed bottom-6 right-6 inside itself. Let's just override its wrapper or let it overlap for now if there are multiples. */}
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={4000}
          />
        </div>
      ))}
    </div>
  );
}
