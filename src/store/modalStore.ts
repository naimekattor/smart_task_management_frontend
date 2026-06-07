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
  metaData: any; // Contextual data (e.g. project data, task data, action callbacks)
  openModal: (type: ModalType, metaData?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  metaData: null,
  openModal: (activeModal, metaData = null) => set({ activeModal, metaData }),
  closeModal: () => set({ activeModal: null, metaData: null }),
}));
