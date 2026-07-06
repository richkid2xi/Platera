import { useEffect, useCallback, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export function useAutoLogout() {
  const { isAuthenticated, signOut } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      sessionStorage.setItem('logoutReason', 'timeout');
      signOut();
    }, TIMEOUT_MS);
  }, [isAuthenticated, signOut]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => document.addEventListener(event, handleActivity));
    
    // Initial start
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, resetTimer]);
}
