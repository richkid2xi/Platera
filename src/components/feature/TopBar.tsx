import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export default function TopBar({ sidebarCollapsed, onMobileMenuToggle }: TopBarProps) {
  const { user } = useAuth();
  const { isRefreshing, triggerRefresh } = useRefresh();
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleRefresh = async () => {
    await triggerRefresh();
    setToast({ message: 'Data refreshed successfully', visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const notifications = [
    { id: 1, type: 'order', message: 'New order from Table 7', time: '2 min ago', read: false },
    { id: 2, type: 'stock', message: 'Coca-Cola running low (3 left)', time: '15 min ago', read: false },
    { id: 3, type: 'order', message: 'Table 3 order is ready for serving', time: '28 min ago', read: true },
    { id: 4, type: 'alert', message: 'Negative feedback from Table 9', time: '1 hour ago', read: true },
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order': return 'ri-shopping-bag-3-line text-primary-500';
      case 'stock': return 'ri-alert-line text-accent-500';
      case 'alert': return 'ri-error-warning-line text-red-500';
      default: return 'ri-notification-3-line text-foreground-400';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-foreground-900 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between px-4 md:px-6 z-20 transition-all duration-300 ${sidebarCollapsed ? 'lg:left-[72px] left-0' : 'lg:left-[240px] left-0'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-foreground-500 hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>

        <div className="hidden sm:block">
          <span className="text-sm font-medium text-foreground-600 dark:text-foreground-300 font-body">{formatDate(currentTime)}</span>
          <span className="mx-2 text-foreground-300 dark:text-foreground-600">·</span>
          <span className="text-sm font-semibold text-foreground-800 dark:text-foreground-200 font-body">{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">

        {/* Global Refresh Button */}
        <button
          onClick={handleRefresh}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-600 dark:hover:text-foreground-300 transition-all cursor-pointer"
          title="Refresh data"
        >
          <i className={`ri-refresh-line text-xl ${isRefreshing ? 'animate-spin text-primary-500' : ''}`}></i>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 hover:text-foreground-600 dark:hover:text-foreground-300 transition-all cursor-pointer"
          >
            <i className="ri-notification-3-line text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-800 shadow-lg overflow-hidden animate-fade-in-up z-50">
              <div className="px-4 py-3 border-b border-background-200 dark:border-foreground-800 flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground-900 dark:text-foreground-100 font-heading">Notifications</span>
                <button className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">Mark all read</button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-background-100 dark:border-foreground-800 last:border-b-0 flex gap-3 cursor-pointer hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-background-100 dark:bg-foreground-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className={getNotifIcon(n.type)}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-foreground-500 dark:text-foreground-400' : 'text-foreground-900 dark:text-foreground-100 font-medium'} font-body`}>
                        {n.message}
                      </p>
                      <span className="text-xs text-foreground-400 mt-0.5 block">{n.time}</span>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-background-200 dark:border-foreground-800 text-center">
                <button className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold font-heading">
                {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{user?.name ?? 'User'}</span>
              <span className="text-xs text-foreground-400 font-body capitalize">{user?.staffRole ?? user?.role ?? 'Staff'}</span>
            </div>
            <i className="ri-arrow-down-s-line text-foreground-400 text-sm hidden md:block"></i>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-800 shadow-lg overflow-hidden z-50 animate-fade-in-up">
              <div className="px-4 py-3 border-b border-background-200 dark:border-foreground-800">
                <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{user?.name ?? 'User'}</p>
                <p className="text-xs text-foreground-400 font-body truncate">{user?.email ?? ''}</p>
              </div>
              <div className="py-1">
                <Link to="/profile" onClick={() => setShowProfile(false)} className="w-full px-4 py-2 text-sm text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 text-left cursor-pointer font-body whitespace-nowrap flex items-center">
                  <i className="ri-user-3-line mr-2"></i> My Profile
                </Link>
                <Link to="/settings" onClick={() => setShowProfile(false)} className="w-full px-4 py-2 text-sm text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 text-left cursor-pointer font-body whitespace-nowrap flex items-center">
                  <i className="ri-settings-3-line mr-2"></i> Settings
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Global Refresh Toast Notification */}
      {toast.visible && (
        <div className="fixed top-20 right-6 z-[100] animate-slide-in-right">
          <div className="bg-white dark:bg-foreground-900 rounded-lg border-l-4 border-l-primary-500 border border-background-200 dark:border-foreground-800 shadow-xl p-4 pr-12 flex items-center gap-3 relative min-w-[250px]">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-primary-500 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                Success
              </p>
              <p className="text-xs text-foreground-600 dark:text-foreground-400 font-body mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast({ message: '', visible: false })}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-foreground-400 hover:text-foreground-600 cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}