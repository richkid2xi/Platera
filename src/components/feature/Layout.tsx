import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/feature/Sidebar';
import TopBar from '@/components/feature/TopBar';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize auto-logout timer for security
  useAutoLogout();

  useEffect(() => {
    const error = (location.state as { error?: string })?.error;
    if (error) {
      setToastMessage(error);
      // Clear state so refresh doesn't trigger it again
      navigate(location.pathname, { replace: true, state: {} });
      
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  return (
    <>
      <div className="min-h-screen bg-background-50 dark:bg-foreground-950 font-body">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px] ml-0' : 'lg:ml-[240px] ml-0'
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
      
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/90 text-red-700 dark:text-red-100 rounded-xl border border-red-200 dark:border-red-800 shadow-xl">
            <i className="ri-error-warning-fill text-lg"></i>
            <span className="font-semibold text-sm">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:bg-red-100 dark:hover:bg-red-800 p-1 rounded-lg transition-colors"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}