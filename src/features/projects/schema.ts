import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  image: z
    .union([
      z.instanceof(Blob),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  image: z
    .union([
      z.null(),
      z.instanceof(Blob),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type UpdateProjectSchema = z.infer<typeof UpdateProjectSchema>;
