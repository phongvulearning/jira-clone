"use client";
import { PageError } from "@/app/components/page-error";
import { PageLoader } from "@/app/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectIdSettingsPageClient = () => {
  const projectId = useProjectId();
  const { data: initialValues, isLoading } = useGetProject({ projectId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) return <PageError message="Project not found" />;

  return <EditProjectForm initialValues={initialValues} />;
};
