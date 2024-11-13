import { z } from "zod";

import { TaskStatus } from "./type";

export const CreateTaskSchema = z.object({
  name: z.string().trim().min(1, { message: "Task name is required" }),
  status: z.nativeEnum(TaskStatus, {
    required_error: "Task status is required",
  }),
  projectId: z.string(),
  workspaceId: z.string(),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  assigneeId: z.string().trim().min(1, { message: "Assignee is required" }),
});

export type CreateTaskSchema = z.infer<typeof CreateTaskSchema>;
