import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKlOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  projectId: string;
  workspaceId: string;
  description: string;
  dueDate: Date | string;
};

export enum ViewType {
  TABLE = "table",
  KANBAN = "kanban",
  CALENDAR = "calendar",
}
