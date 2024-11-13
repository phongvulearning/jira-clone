"use client";
import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTask } from "../api/use-delete-task";
import { useEditTaskModalStore } from "../hooks/use-edit-task-modal";

interface TaskActionsProps {
  id: string;
  projectId: string;
}

export const TaskActions = ({
  id,
  projectId,
  children,
}: PropsWithChildren<TaskActionsProps>) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { setTaskId } = useEditTaskModalStore();

  const [DeleteConfirm, confirmDelete] = useConfirm(
    "Delete Task",
    "Are you sure you want to delete this task?",
    "destructive"
  );

  const { mutate: deleteTask, isPending } = useDeleteTask();

  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  const onDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteTask({
      param: {
        taskId: id,
      },
    });
  };

  return (
    <div className="flex justify-end">
      <DeleteConfirm />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onOpenTask}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-5 mr-2 stroke-2" />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenProject}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-5 mr-2 stroke-2" />
            Open Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTaskId(id)}
            className="font-medium p-[10px]"
          >
            <PencilIcon className="size-5 mr-2 stroke-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className="font-medium p-[10px] text-amber-700 focus:text-amber-700"
          >
            <TrashIcon className="size-5 mr-2 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
