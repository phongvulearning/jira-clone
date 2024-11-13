"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Plus } from "lucide-react";
import { useCreateTaskModalStore } from "../hooks/use-create-task-modal";
import { useState } from "react";
import { TaskStatus, ViewType } from "../type";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetTasks } from "../api/use-get-tasks";
import { DataFilter } from "./data-filter";
import { useTaskFilterStore } from "../hooks/use-task-filter";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useBulkUpdate } from "../api/use-bulk-update";
import { DataCalander } from "./data-calendar";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const [view, setView] = useState<ViewType>(ViewType.TABLE);

  const { mutate: bulkUpdate } = useBulkUpdate();

  const { setOpen } = useCreateTaskModalStore();

  const { assigneeId, dueDate, projectId, status } = useTaskFilterStore();

  const { data: tasks, isLoading: tasksLoading } = useGetTasks({
    workspaceId,
    status,
    assigneeId,
    projectId: paramProjectId || projectId,
    dueDate,
  });

  const onKanbanChange = (
    tasks: { $id: string; status: TaskStatus; position: number }[]
  ) => {
    bulkUpdate({
      json: { tasks },
    });
  };

  return (
    <Tabs
      defaultValue={view}
      onValueChange={(view) => {
        setView(view as ViewType);
      }}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-start w-full">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value={ViewType.TABLE}
            >
              Table
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value={ViewType.KANBAN}
            >
              Kanban
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value={ViewType.CALENDAR}
            >
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="w-full lg:w-auto ml-auto"
          >
            <Plus className="size-4 mr-2" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilter hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {tasksLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value={ViewType.TABLE} className="mt-0">
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value={ViewType.KANBAN} className="mt-0">
              <DataKanban
                onChange={onKanbanChange}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value={ViewType.CALENDAR} className="mt-0  pb-4">
              <DataCalander data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
