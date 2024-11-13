"use client";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { CreateTaskForm } from "./create-task-form";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { TaskStatus } from "../../type";

interface CreateTaskFormWrapperProps {
  onCancel?: () => void;
  status?: TaskStatus;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  status,
}: CreateTaskFormWrapperProps) => {
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

  const isLoading = projectsLoading || membersLoading;

  if (isLoading)
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );

  return (
    <CreateTaskForm
      status={status}
      onCancel={onCancel}
      projectOptions={projectOptions}
      memberOptions={memberOptions}
    />
  );
};
