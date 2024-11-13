"use client";

import { PageError } from "@/app/components/page-error";
import { PageLoader } from "@/app/components/page-loader";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadscrumbs";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";

export const TaskIdPageClient = () => {
  const taskId = useTaskId();

  const { data: task, isLoading } = useGetTask({ taskId });

  if (isLoading) return <PageLoader />;

  if (!task) return <PageError message="Task not found" />;

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs task={task} project={task.project} />
      <DottedSeparator className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview task={task} />
        <TaskDescription task={task} />
      </div>
    </div>
  );
};
