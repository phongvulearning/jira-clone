import { PropsWithChildren } from "react";
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit/edit-task-modal";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen">
      <CreateProjectModal />
      <CreateWorkspaceModal />
      <CreateTaskModal />
      <EditTaskModal />
      <div className="flex h-full w-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full h-full">
          <div className="mx-auto max-w-screen-2xl h-full flex flex-col">
            <Navbar />
            <main className="py-8 px-6 flex flex-col flex-1 ">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}