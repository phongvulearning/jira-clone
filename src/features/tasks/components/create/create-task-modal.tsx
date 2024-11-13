"use client";

import { ResponsiveModal } from "@/app/components/responsive-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useCreateTaskModalStore } from "@/features/tasks/hooks/use-create-task-modal";

export const CreateTaskModal = () => {
  const { onClose, open, setOpen, taskStatus } = useCreateTaskModalStore();

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <CreateTaskFormWrapper onCancel={onClose} status={taskStatus} />
    </ResponsiveModal>
  );
};
