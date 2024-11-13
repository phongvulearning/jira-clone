import { Button } from "@/components/ui/button";
import { Task } from "../type";
import { Pencil } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskDate } from "./task-date";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useEditTaskModalStore } from "../hooks/use-edit-task-modal";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { setTaskId } = useEditTaskModalStore();

  return (
    <div className="fle flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          <Button
            onClick={() => setTaskId(task.$id)}
            size="sm"
            variant="secondary"
          >
            <Pencil className="size-4 mr-2" />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <MemberAvatar name={task.assignee.name} className="size-6" />
            <p className="text-sm font-medium truncate">{task.assignee.name}</p>
          </OverviewProperty>
          <OverviewProperty label="Due Date">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OverviewProperty>
          <OverviewProperty label="Status">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};

interface OverviewPropertiesProps {
  label: string;
  children: React.ReactNode;
}

const OverviewProperty = ({ children, label }: OverviewPropertiesProps) => {
  return (
    <div className="flex items-start gap-x-2">
      <div className="min-w-[100px]">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-x-2 truncate">{children}</div>
    </div>
  );
};
