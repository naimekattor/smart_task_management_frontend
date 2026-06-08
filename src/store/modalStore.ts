import { create } from 'zustand';

type ModalType =
  | 'createProject'
  | 'editProject'
  | 'createTask'
  | 'editTask'
  | 'addMember'
  | 'confirmDelete'
  | null;

interface ModalState {
  activeModal: ModalType;
  metaData: any;
  openModal: (type: ModalType, metaData?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  metaData: null,
  openModal: (activeModal, metaData = null) => set({ activeModal, metaData }),
  closeModal: () => set({ activeModal: null, metaData: null }),
}));
