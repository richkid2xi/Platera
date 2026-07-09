import axios from 'axios';

// Get the API URL from Vite's env variables, or default to localhost:5000 for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const friendlyError = new Error('Server cannot be reached. Please check your connection or try again later.');
        (friendlyError as any).isNetworkError = true;
        
        window.dispatchEvent(new CustomEvent('global:toast', {
          detail: { message: 'Server cannot be reached.', type: 'error' }
        }));
        
        return Promise.reject(friendlyError);
      }
      return Promise.reject(error);
    }

    if (error.response.status >= 500) {
      window.dispatchEvent(new CustomEvent('global:toast', {
        detail: { message: 'An unexpected server error occurred.', type: 'error' }
      }));
    }

    if (error.response.status === 401) {
      // If we get a 401, it means the session cookie is invalid or expired.
      // We can dispatch an event or handle it in AuthContext to log the user out.
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
