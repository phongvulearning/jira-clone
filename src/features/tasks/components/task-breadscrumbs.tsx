import { Project } from "@/features/projects/type";
import { Task } from "../type";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useDeleteTask } from "../api/use-delete-task";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import Link from "next/link";
import { ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskBreadcrumbsProps {
  task: Task;
  project: Project;
}

export const TaskBreadcrumbs = ({ task, project }: TaskBreadcrumbsProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { mutate, isPending } = useDeleteTask();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "Are you sure you want to delete this task?",
    "destructive"
  );

  const handleDeleteTask = async () => {
    const ok = await confirm();

    if (!ok) return;

    mutate(
      {
        param: { taskId: task.$id },
      },
      {
        onSuccess() {
          router.push(`/workspaces/${workspaceId}/projects/${project.$id}`);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmDialog />
      <ProjectAvatar
        name={project.name}
        image={project.imageUrl}
        className="size-6 lg:size-8"
      />

      <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
        <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
          {project.name}
        </p>
      </Link>
      <ChevronRight className="size-4 lg:size-5 text-muted-foreground" />
      <p className="text-sm lg:text-lg font-semibold">{task.name}</p>
      <Button
        onClick={handleDeleteTask}
        variant="destructive"
        disabled={isPending}
        className="ml-auto"
        size="sm"
      >
        <Trash className="size-4 lg:mr-2" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
    </div>
  );
};
