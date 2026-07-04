
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'ri-dashboard-3-line' },
  { label: 'Live Orders', path: '/orders', icon: 'ri-list-check-2', badge: 5 },
  { label: 'Menu Management', path: '/menu', icon: 'ri-restaurant-2-line' },
  { label: 'Tables', path: '/tables', icon: 'ri-layout-grid-line' },
  { label: 'Inventory', path: '/inventory', icon: 'ri-archive-line' },
  { label: 'Sales & Reports', path: '/reports', icon: 'ri-bar-chart-2-line' },
  { label: 'Feedback', path: '/feedback', icon: 'ri-chat-smile-2-line' },
  { label: 'Staff', path: '/staff', icon: 'ri-team-line' },
  { label: 'Settings', path: '/settings', icon: 'ri-settings-3-line' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onMobileClose();
  };

  const sidebarContent = (
    <>
      <div className={`flex items-center h-16 px-4 border-b border-background-200 dark:border-foreground-800 ${collapsed && !mobileOpen ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <i className="ri-restaurant-line text-white text-lg"></i>
        </div>
        {(!collapsed || mobileOpen) && (
          <span className="font-heading font-bold text-lg text-foreground-950 dark:text-foreground-100 whitespace-nowrap">Platera</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    collapsed && !mobileOpen ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'
                  } ${
                    active
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-800 dark:hover:text-foreground-200'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-lg ${active ? 'text-primary-500 dark:text-primary-400' : ''}`}></i>
                  </div>
                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left font-body">{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !mobileOpen && item.badge && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-background-200 dark:border-foreground-800">
        <button
          onClick={() => handleNav('/profile')}
          className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer mb-1 ${
            collapsed && !mobileOpen ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'
          } text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-800 dark:hover:text-foreground-200`}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-user-3-line text-lg"></i>
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-medium flex-1 text-left font-body">My Profile</span>
          )}
        </button>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-600 dark:hover:text-foreground-300 transition-all cursor-pointer"
        >
          <i className={`text-lg transition-transform duration-300 ${collapsed && !mobileOpen ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'}`}></i>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full bg-white dark:bg-foreground-900 border-r border-background-200 dark:border-foreground-800 flex flex-col z-30 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose}></div>
          <aside className="absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-foreground-900 border-r border-background-200 dark:border-foreground-800 flex flex-col z-50 animate-slide-in-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}