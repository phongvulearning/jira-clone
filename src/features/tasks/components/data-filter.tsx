"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderIcon, ListChecksIcon, UserCog2 } from "lucide-react";
import { TaskStatus } from "../type";
import { useTaskFilterStore } from "../hooks/use-task-filter";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { DatePicker } from "@/components/date-picker";

interface DataFilterProps {
  hideProjectFilter?: boolean;
}

export const DataFilter = ({ hideProjectFilter }: DataFilterProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });
  const isLoading = projectsLoading || membersLoading;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));
  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  const {
    status,
    setStatus,
    assigneeId,
    setAssigneeId,
    projectId,
    setProjectId,
    dueDate,
    setDueDate,
  } = useTaskFilterStore();

  const onStatusChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    setStatus(newValue);
  };

  const onAssigneeChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    setAssigneeId(newValue);
  };

  const onProjectChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    setProjectId(newValue);
  };

  const onDueDateChange = (value: Date) => {
    const newValue = value ? value.toISOString() : undefined;

    setDueDate(newValue);
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="size-4 mr-2" />
            <SelectValue placeholder="All status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectSeparator />
          {Object.entries(TaskStatus).map(([key, value]) => (
            <SelectItem key={value} value={value.toString()}>
              {key
                .replace("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <UserCog2 className="size-4 mr-2" />
            <SelectValue placeholder="All assignee" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignee</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value.toString()}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className="w-full lg:w-auto h-8">
            <div className="flex items-center pr-2">
              <FolderIcon className="size-4 mr-2" />
              <SelectValue placeholder="All projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        placeholder="Due date"
        className="w-full lg:w-auto h-8"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => onDueDateChange(date)}
      />
    </div>
  );
};
