import { create } from 'zustand';

// Helper to safely decode JWT tokens
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// Parse token or user info from local storage if available
const getToken = () => localStorage.getItem('token') || null;
const getUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
        if (user && !user.role && user.nationalId) {
            user.role = 'PATIENT';
        }
        return user;
    } catch {
        return null;
    }
};

export const useAuthStore = create((set) => ({
    token: getToken(),
    user: getUser(),
    isAuthenticated: !!getToken(),

    login: (userData, token) => {
        let user = { ...userData };
        
        // Enrich user data from the JWT token if fields are missing (e.g. flat response without user object)
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                user._id = user._id || decoded._id || decoded.id;
                user.role = user.role || (decoded.role ? decoded.role.toUpperCase() : undefined);
            }
        }

        if (!user.role && user.nationalId) user.role = 'PATIENT';
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },
    updateUser: (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
    }
}));
