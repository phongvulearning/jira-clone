import { create } from "zustand";

interface CreateProjectModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: () => void;
}

export const useCreateProjectModalStore = create<CreateProjectModalState>()(
  (set) => ({
    open: false,
    setOpen: (open) => set(() => ({ open })),
    onClose: () => set(() => ({ open: false })),
  })
);
