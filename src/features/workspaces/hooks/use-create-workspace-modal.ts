import { create } from "zustand";

interface CreateWorkspaceModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: () => void;
}

export const useCreateWorkspaceModalStore = create<CreateWorkspaceModalState>()(
  (set) => ({
    open: false,
    setOpen: (open) => set(() => ({ open })),
    onClose: () => set(() => ({ open: false })),
  })
);
