import { Outlet, useParams } from "react-router-dom";
import { OrderProvider, useOrder } from "../../contexts/OrderContext";
import { CustomerProvider, useCustomer } from "../../contexts/CustomerContext";
import { useEffect } from "react";
import NotFound from "@/pages/NotFound";
import AuthLoaders from "@/components/feature/AuthLoaders";

function CustomerLayoutInner() {
  const { isLoading, error, restaurant, table } = useCustomer();
  const { dispatch } = useOrder();

  useEffect(() => {
    if (table) {
      dispatch({ 
        type: 'INIT_TABLE', 
        payload: { tableId: table.id, tableNumber: Number(table.tableNumber) } 
      });
    }
  }, [table, dispatch]);

  if (isLoading) {
    return (
      <div className="customer-app min-h-screen bg-background-100 flex justify-center items-center">
        <AuthLoaders />
      </div>
    );
  }

  if (error || !restaurant || !table) {
    return <NotFound />;
  }

  return (
    <div 
      className="customer-app min-h-screen bg-background-100 flex justify-center lg:items-center lg:py-8"
      style={{ 
        '--color-primary-500': '#FF6B35', // default for now, could come from restaurant settings
        '--color-primary-600': '#E85A2A',
      } as React.CSSProperties}
    >
      <div 
        className="w-full h-[100dvh] lg:h-[850px] bg-background-50 lg:max-w-[480px] lg:max-h-[90vh] lg:rounded-[2.5rem] lg:shadow-2xl relative overflow-x-hidden overflow-y-auto lg:border-[12px] border-background-900 scrollbar-hide"
      >
        <Outlet />
      </div>
    </div>
  );
}

export default function CustomerLayout() {
  const { token } = useParams<{ token: string }>();

  return (
    <CustomerProvider token={token}>
      <OrderProvider>
        <CustomerLayoutInner />
      </OrderProvider>
    </CustomerProvider>
  );
}
