import { create } from 'zustand';

/**
 * Zustand v5 UI Store
 * Manages ephemeral UI state (sidebar drawer, active modals, modal data).
 * Never stores server-derived entities.
 */
export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  activeModal: null,
  modalData: null,

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

// Atomic Selectors
export const useIsSidebarOpen = () => useUIStore((s) => s.isSidebarOpen);
export const useActiveModal = () => useUIStore((s) => s.activeModal);
export const useModalData = () => useUIStore((s) => s.modalData);

