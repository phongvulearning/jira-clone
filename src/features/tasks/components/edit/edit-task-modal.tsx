"use client";

import { EditTaskFormWrapper } from "./edit-task-form-wrapper";
import { ResponsiveModal } from "@/app/components/responsive-modal";
import { useEditTaskModalStore } from "@/features/tasks/hooks/use-edit-task-modal";

export const EditTaskModal = () => {
  const { onClose, taskId } = useEditTaskModalStore();

  return (
    <ResponsiveModal open={!!taskId} onOpenChange={onClose}>
      {!!taskId && <EditTaskFormWrapper taskId={taskId} onCancel={onClose} />}
    </ResponsiveModal>
  );
};
