import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { apiClient } from './api/client'

// Global error logging
window.onerror = function (message, source, lineno, colno, error) {
  apiClient.post('/system/logs', {
    type: 'onerror',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  }).catch(() => {});
};

window.addEventListener('unhandledrejection', function (event) {
  apiClient.post('/system/logs', {
    type: 'unhandledrejection',
    reason: event.reason?.message || event.reason,
    stack: event.reason?.stack
  }).catch(() => {});
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes — data is fresh, avoid redundant fetches
      gcTime: 1000 * 60 * 10,       // 10 minutes — keep in memory while navigating
      retry: (failureCount, error: any) => {
        // Never retry 4xx client errors — only retry network/5xx failures
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,  // Don't re-fetch just because the user tabs back
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
