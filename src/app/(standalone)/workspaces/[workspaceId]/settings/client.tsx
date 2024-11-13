"use client";
import { PageError } from "@/app/components/page-error";
import { PageLoader } from "@/app/components/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettingsPageClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) return <PageError message="Workspace not found" />;

  return <EditWorkspaceForm initialValues={initialValues} />;
};
