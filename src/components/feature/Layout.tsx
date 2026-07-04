import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/feature/Sidebar';
import TopBar from '@/components/feature/TopBar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}