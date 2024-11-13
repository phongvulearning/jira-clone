"use client";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useGetTask } from "../../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";

interface EditTaskFormWrapperProps {
  onCancel?: () => void;
  taskId: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  taskId,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
  });

  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const projectOptions = projects?.documents?.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents?.map((member) => ({
    id: member.$id,
    name: member.name,
  }));
  const { data: initialValues, isLoading: taskLoading } = useGetTask({
    taskId,
  });

  const isLoading = projectsLoading || membersLoading || taskLoading;

  if (isLoading)
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );

  if (!initialValues) return null;

  return (
    <EditTaskForm
      onCancel={onCancel}
      initialValues={initialValues}
      projectOptions={projectOptions}
      memberOptions={memberOptions}
    />
  );
};
