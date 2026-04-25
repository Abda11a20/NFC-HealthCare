import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// API Hooks using React Query
// retry: false prevents infinite 404 loops
// ============================================================================

const handleError = (error) => {
    const msg = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(msg);
    return msg;
};

export const useGet = (queryKey, url, options = {}) => {
    return useQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        queryFn: async () => {
            if (!url) return null;
            const { data } = await apiClient.get(url);
            return data;
        },
        retry: false,        // Don't retry on 404/500 — prevents infinite loops
        refetchOnWindowFocus: false,
        ...options,
        enabled: !!url && (options.enabled !== false)
    });
};

export const usePost = (url, options = {}) => {
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post(url, payload);
            return data;
        },
        onError: handleError,
        onSuccess: (data) => {
            if(data.message) toast.success(data.message);
        },
        ...options
    });
};

export const usePut = (url, options = {}) => {
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await apiClient.put(url, payload);
            return data;
        },
        onError: handleError,
        onSuccess: (data) => {
            if(data.message) toast.success(data.message);
        },
        ...options
    });
};

export const useDelete = (url, options = {}) => {
    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.delete(url);
            return data;
        },
        onError: handleError,
        onSuccess: (data) => {
            if(data.message) toast.success(data.message);
        },
        ...options
    });
};
