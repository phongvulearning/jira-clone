import React from "react";
import { TaskStatus } from "../type";
import { useCreateTaskModalStore } from "../hooks/use-create-task-modal";
import { statusIconMap } from "@/lib/contants";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

type KanbanColumnHeaderProps = {
  board: TaskStatus;
  taskCount: number;
};

export const KanbanColumnHeader = ({
  board,
  taskCount,
}: KanbanColumnHeaderProps) => {
  const { setOpen } = useCreateTaskModalStore();
  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button
        className="size-5"
        onClick={() => setOpen(true, board)}
        variant="ghost"
        size="icon"
      >
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};
