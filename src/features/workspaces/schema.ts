import { z } from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required"),
  image: z
    .union([
      z.instanceof(Blob),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type CreateWorkspaceSchema = z.infer<typeof CreateWorkspaceSchema>;

export const UpdateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required"),
  image: z
    .union([
      z.null(),
      z.instanceof(Blob),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type UpdateWorkspaceSchema = z.infer<typeof UpdateWorkspaceSchema>;
