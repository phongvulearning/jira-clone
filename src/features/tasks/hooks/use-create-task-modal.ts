import { create } from "zustand";
import { TaskStatus } from "../type";

interface CreateTaskModalState {
  open: boolean;
  setOpen: (value: boolean, status?: TaskStatus) => void;
  onClose: () => void;
  taskStatus: TaskStatus | undefined;
}

export const useCreateTaskModalStore = create<CreateTaskModalState>()(
  (set) => ({
    open: false,
    taskStatus: undefined,
    setOpen: (open, taskStatus) => set(() => ({ open, taskStatus })),
    onClose: () => set(() => ({ open: false })),
  })
);
