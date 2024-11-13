"use client";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { PageLoader } from "@/app/components/page-loader";
import { PageError } from "@/app/components/page-error";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-swicher";
import { useGetProjectAnalytics } from "@/features/projects/hooks/use-get-project-analytics";
import { Analytics } from "@/app/components/analytics";

export const ProjectIdPageClient = () => {
  const projectId = useProjectId();

  const { data: project, isLoading: projectsLoading } = useGetProject({
    projectId,
  });

  const { data: analytics } = useGetProjectAnalytics({
    projectId,
  });

  const isLoading = projectsLoading;

  if (isLoading) return <PageLoader />;

  if (!project) return <PageError message="Project not found" />;

  const href = `/workspaces/${project.workspaceId}/projects/${project.$id}/settings`;

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href={href}>
            <Pencil className="size-4 mr-2" />
            Edit Project
          </Link>
        </Button>
      </div>
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
};
