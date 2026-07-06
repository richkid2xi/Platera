import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

interface RefreshContextType {
  isRefreshing: boolean;
  triggerRefresh: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(true);

  // Initial load simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsRefreshing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const triggerRefresh = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        resolve();
      }, 1500);
    });
  }, []);

  return (
    <RefreshContext.Provider value={{ isRefreshing, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
