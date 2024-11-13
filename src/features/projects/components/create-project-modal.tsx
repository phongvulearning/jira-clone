"use client";

import { CreateProjectForm } from "./create-project-form";
import { ResponsiveModal } from "@/app/components/responsive-modal";
import { useCreateProjectModalStore } from "../hooks/use-create-project-modal";

export const CreateProjectModal = () => {
  const { onClose, open, setOpen } = useCreateProjectModalStore();
  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <CreateProjectForm onCancel={onClose} />
    </ResponsiveModal>
  );
};
