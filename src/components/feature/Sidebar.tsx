
import type { MouseEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NAV_PERMISSIONS } from '@/config/permissions';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-3-line' },
  { label: 'Live Orders', path: '/orders', icon: 'ri-list-check-2', badge: 5 },
  { label: 'Menu Management', path: '/menu', icon: 'ri-restaurant-2-line' },
  { label: 'Tables', path: '/tables', icon: 'ri-layout-grid-line' },
  { label: 'Inventory', path: '/inventory', icon: 'ri-archive-line' },
  { label: 'Sales & Reports', path: '/reports', icon: 'ri-bar-chart-2-line' },
  { label: 'Feedback', path: '/feedback', icon: 'ri-chat-smile-2-line' },
  { label: 'Staff', path: '/staff', icon: 'ri-team-line' },
  { label: 'Settings', path: '/settings', icon: 'ri-settings-3-line' },
  { label: 'Audit Log', path: '/audit', icon: 'ri-file-list-3-line' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { checkUnsaved } = useUnsavedChanges();
  const navigate = useNavigate();

  const handleNav = (e: MouseEvent, path?: string) => {
    if (path) {
      e.preventDefault();
      checkUnsaved(() => {
        navigate(path);
        if (mobileOpen) onMobileClose();
      });
    } else {
      if (mobileOpen) onMobileClose();
    }
  };

  const sidebarContent = (
    <>
      <div className={`flex items-center h-16 px-4 border-b border-background-200 dark:border-foreground-800 ${collapsed && !mobileOpen ? 'justify-center relative' : 'justify-between'}`}>
        <div className={`flex items-center ${collapsed && !mobileOpen ? 'hidden' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground-950 dark:text-foreground-100 whitespace-nowrap">Platera</span>
        </div>

        <button
          onClick={onToggle}
          title={collapsed && !mobileOpen ? "Expand" : "Collapse"}
          className={`hidden lg:flex items-center justify-center rounded-lg text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-600 dark:hover:text-foreground-300 transition-all cursor-pointer ${collapsed && !mobileOpen ? 'w-10 h-10' : 'p-1.5'}`}
        >
          <i className={`text-lg transition-transform duration-300 ${collapsed && !mobileOpen ? 'ri-menu-unfold-line text-xl' : 'ri-menu-fold-line'}`}></i>
        </button>
      </div>

      <nav className={`flex-1 px-3 overflow-y-auto lg:overflow-visible ${collapsed && !mobileOpen ? 'py-2' : 'py-4'}`}>
        <ul className={`flex flex-col ${collapsed && !mobileOpen ? 'gap-0.5' : 'gap-1'}`}>
          {mainNavItems.map((item) => {
            // Check if current user has permission to see this route
            if (user && !NAV_PERMISSIONS[item.path]?.includes(user.role)) {
              return null;
            }
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={(e) => handleNav(e, item.path)}
                  className={({ isActive }) =>
                    `w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap group relative ${collapsed && !mobileOpen ? 'justify-center w-9 h-9 mx-auto' : 'px-3 py-2 gap-3'
                    } ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-800 dark:hover:text-foreground-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative">
                        <i className={`${item.icon} text-lg ${isActive ? 'text-primary-500 dark:text-primary-400' : ''}`}></i>
                        {collapsed && !mobileOpen && item.badge && (
                          <span className="absolute -top-2 -right-3 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
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
                      {collapsed && !mobileOpen && (
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-foreground-900 dark:bg-white text-white dark:text-foreground-900 text-xs font-semibold rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-foreground-900 dark:before:border-r-white">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t border-background-200 dark:border-foreground-800 flex flex-col gap-0.5 ${collapsed && !mobileOpen ? 'p-2' : 'p-3'}`}>
        <NavLink
          to="/profile"
          onClick={(e) => handleNav(e, '/profile')}
          className={({ isActive }) =>
            `w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer group relative ${collapsed && !mobileOpen ? 'justify-center w-9 h-9 mx-auto' : 'px-3 py-2 gap-3'
            } ${isActive
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
              : 'text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-800 dark:hover:text-foreground-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`ri-user-3-line text-lg ${isActive ? 'text-primary-500 dark:text-primary-400' : ''}`}></i>
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="text-sm font-medium flex-1 text-left font-body">My Profile</span>
              )}
              {collapsed && !mobileOpen && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-foreground-900 dark:bg-white text-white dark:text-foreground-900 text-xs font-semibold rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-foreground-900 dark:before:border-r-white">
                  My Profile
                </div>
              )}
            </>
          )}
        </NavLink>

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-800 dark:hover:text-foreground-200 group relative ${collapsed && !mobileOpen ? 'justify-center w-9 h-9 mx-auto' : 'px-3 py-2 gap-3'
            }`}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className={`text-lg ${theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'}`}></i>
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-medium flex-1 text-left font-body">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
          {collapsed && !mobileOpen && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-foreground-900 dark:bg-white text-white dark:text-foreground-900 text-xs font-semibold rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-foreground-900 dark:before:border-r-white">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </div>
          )}
        </button>

        <button
          onClick={() => checkUnsaved(() => signOut())}
          className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 group relative ${collapsed && !mobileOpen ? 'justify-center w-9 h-9 mx-auto' : 'px-3 py-2 gap-3'
            }`}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-logout-box-r-line text-lg"></i>
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-medium flex-1 text-left font-body">Sign Out</span>
          )}
          {collapsed && !mobileOpen && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-red-600">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full bg-white dark:bg-foreground-900 border-r border-background-200 dark:border-foreground-800 flex flex-col z-30 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'
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