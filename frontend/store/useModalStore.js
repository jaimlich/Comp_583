import { create } from 'zustand';

export const useModalStore = create((set) => ({
  modalType: null,
  openModal: (type) => set({ modalType: type }),
  closeModal: () => set({ modalType: null }),
}));
