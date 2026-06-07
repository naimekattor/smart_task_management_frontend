import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  projectStatus: string;
  taskStatus: string;
  priority: string;
  assignedUserId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  setSearchQuery: (query: string) => void;
  setProjectStatus: (status: string) => void;
  setTaskStatus: (status: string) => void;
  setPriority: (priority: string) => void;
  setAssignedUserId: (userId: string) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

const initialFilters = {
  searchQuery: '',
  projectStatus: 'ALL',
  taskStatus: 'ALL',
  priority: 'ALL',
  assignedUserId: 'ALL',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setProjectStatus: (projectStatus) => set({ projectStatus }),
  setTaskStatus: (taskStatus) => set({ taskStatus }),
  setPriority: (priority) => set({ priority }),
  setAssignedUserId: (assignedUserId) => set({ assignedUserId }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  resetFilters: () => set(initialFilters),
}));
