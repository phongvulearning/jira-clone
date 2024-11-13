import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskStatus } from "../type";
import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/type";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { statusColorMap } from "@/lib/contants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

interface EventCardProps {
  id: string;
  title: string;
  project: Project;
  assignee: Member;
  status: TaskStatus;
}

export const EventCard = ({
  id,
  title,
  project,
  assignee,
  status,
}: EventCardProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
        onClick={onClick}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee.name} />
          <div className="dot" />
          <ProjectAvatar name={project.name} image={project.imageUrl} />
        </div>
      </div>
    </div>
  );
};
