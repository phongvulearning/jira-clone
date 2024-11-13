import { create } from "zustand";

interface EditTaskModalState {
  taskId: string | null;
  setTaskId: (id: string) => void;
  onClose: () => void;
}

export const useEditTaskModalStore = create<EditTaskModalState>()((set) => ({
  taskId: null,
  setTaskId: (id) => set(() => ({ taskId: id })),
  onClose: () => set(() => ({ taskId: null })),
}));
