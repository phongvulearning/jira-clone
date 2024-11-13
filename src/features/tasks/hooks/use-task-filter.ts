import { create } from "zustand";

interface CreateFilterState {
  search?: string;
  projectId?: string;
  assigneeId?: string;
  status?: string;
  dueDate?: string;
  setSearch: (value: string | undefined) => void;
  setProjectId: (value: string | undefined) => void;
  setAssigneeId: (value: string | undefined) => void;
  setDueDate: (value: string | undefined) => void;
  setStatus: (value: string | undefined) => void;
}

const initialState = {
  search: undefined,
  dueDate: undefined,
  status: undefined,
  projectId: undefined,
  assigneeId: undefined,
};

export const useTaskFilterStore = create<CreateFilterState>()((set) => ({
  ...initialState,
  setSearch: (search) => set(() => ({ search })),
  setProjectId: (projectId) => set(() => ({ projectId })),
  setAssigneeId: (assigneeId) => set(() => ({ assigneeId })),
  setDueDate: (dueDate) => set(() => ({ dueDate })),
  setStatus: (status) => set(() => ({ status })),
}));
