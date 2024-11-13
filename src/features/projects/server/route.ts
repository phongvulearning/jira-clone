import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { CreateProjectSchema, UpdateProjectSchema } from "../schema";
import { getMember } from "@/features/members/queries";
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECT_ID, TASK_ID } from "@/config";
import { z } from "zod";
import { Project } from "../type";
import { MemberRole } from "@/features/members/types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/type";

const app = new Hono()
  .post(
    "/",
    zValidator("form", CreateProjectSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof Blob) {
        const extStr = image.type.split("/")[1];

        const uploadedFile = new File(
          [image],
          `${ID.unique()}.${extStr.indexOf("svg") !== -1 ? "svg" : extStr}`,
          { type: image.type }
        );

        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          uploadedFile
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const projects = await databases.createDocument(
        DATABASE_ID,
        PROJECT_ID,
        ID.unique(),
        {
          name,
          workspaceId,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
        }
      );
      return c.json({
        data: projects,
      });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId } = c.req.valid("query");
      if (!workspaceId) {
        return c.json({ error: "Missing workspaceId" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECT_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );

      return c.json({ data: projects });
    }
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    if (!project) {
      return c.json(
        {
          error: "Project not found",
        },
        404
      );
    }

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    return c.json({
      data: project,
    });
  })
  .patch(
    "/:projectId",
    zValidator("form", UpdateProjectSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const storage = c.get("storage");

      const projectId = c.req.param("projectId");

      const { name, image } = c.req.valid("form");

      const existedProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECT_ID,
        projectId
      );

      if (!existedProject) {
        return c.json(
          {
            error: "Project not found",
          },
          404
        );
      }

      const member = await getMember({
        databases,
        workspaceId: existedProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      let uploadedImageUrl: string | undefined | null;

      if (image instanceof Blob) {
        const extStr = image.type.split("/")[1];

        const uploadedFile = new File(
          [image],
          `${ID.unique()}.${extStr.indexOf("svg") !== -1 ? "svg" : extStr}`,
          { type: image.type }
        );

        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          uploadedFile
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      } else {
        uploadedImageUrl = null;
      }

      const updatedProject = await databases.updateDocument(
        DATABASE_ID,
        PROJECT_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({
        data: updatedProject,
      });
    }
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    if (!project) {
      return c.json(
        {
          error: "Project not found",
        },
        404
      );
    }

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    await databases.deleteDocument(DATABASE_ID, PROJECT_ID, projectId);

    return c.json({
      data: {
        $id: projectId,
      },
    });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const projectId = c.req.param("projectId");

    const project = await databases.getDocument(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal("projectId", projectId),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal("projectId", projectId),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const taskCount = thisMonthTasks.total;
    const taskDiff = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        Query.equal("assigneeId", member.$id),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        Query.equal("assigneeId", member.$id),
      ]
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDiff = assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        Query.notEqual("status", "DONE"),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        Query.notEqual("status", "DONE"),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDiff =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completeTaskDiff = completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverDueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverDueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const overdueTaskCount = thisMonthOverDueTasks.total;
    const overdueTaskDiff = overdueTaskCount - lastMonthOverDueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDiff,
        assignedTaskCount,
        assignedTaskDiff,
        incompleteTaskCount,
        incompleteTaskDiff,
        completedTaskCount,
        completeTaskDiff,
        overdueTaskCount,
        overdueTaskDiff,
      },
    });
  });

export default app;
