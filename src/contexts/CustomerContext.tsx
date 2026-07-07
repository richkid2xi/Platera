import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface CustomerContextType {
  restaurant: {
    id: string;
    name: string;
    logoUrl: string | null;
    paystackPublicKey: string | null;
  } | null;
  table: {
    id: string;
    tableNumber: string;
  } | null;
  menu: any[]; // The structured menu from the backend
  token: string | null;
  isLoading: boolean;
  error: Error | null;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ token, children }: { token: string | undefined; children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-order', token],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      const res = await apiClient.get(`/public/order/${token}`);
      return res.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  return (
    <CustomerContext.Provider 
      value={{ 
        restaurant: data?.restaurant || null, 
        table: data?.table || null, 
        menu: data?.menu || [], 
        token: token || null,
        isLoading, 
        error: error as Error 
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
