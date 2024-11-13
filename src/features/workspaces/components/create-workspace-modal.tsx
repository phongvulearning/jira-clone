"use client";

import { ResponsiveModal } from "@/app/components/responsive-modal";
import { CreateWorkspaceForm } from "./create-workspace-form";
import { useCreateWorkspaceModalStore } from "../hooks/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {
  const { onClose, open, setOpen } = useCreateWorkspaceModalStore();
  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <CreateWorkspaceForm onCancel={onClose} />
    </ResponsiveModal>
  );
};
