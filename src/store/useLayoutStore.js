import { create } from 'zustand';

// Minimal layout state store, completely decoupled from business logic.
// This is used to handle global UI states like the mobile off-canvas sidebar.
export const useLayoutStore = create((set) => ({
    isMobileSidebarOpen: false,
    toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
    closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}));
