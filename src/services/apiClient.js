import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// ============================================================================
// Axios Instance — reads base URL from .env (VITE_API_URL)
// ============================================================================

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global 401 handler — auto logout on expired token
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            const requestUrl = error.config?.url || '';
            
            // Prevent auto-logout if the 401 came from a profile fetch or admin list fetch
            // This prevents a loop where a user logs in but their role lacks access to a specific initial endpoint
            const isProfileFetch = requestUrl.includes('/profile') || requestUrl.includes('/admins') || requestUrl.includes('/receptionists');
            
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup') && !isProfileFetch) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
