import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { CreateWorkspaceSchema, UpdateWorkspaceSchema } from "../schema";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBER_ID,
  TASK_ID,
  WORKSPACE_ID,
} from "@/config";
import { Workspace } from "../types";
import { generateInviteCode, INVITECODE_LENGTH } from "@/lib/utils";
import { getMember } from "@/features/members/queries";
import { z } from "zod";
import { MemberRole } from "@/features/members/types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/type";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const members = await databases.listDocuments(DATABASE_ID, MEMBER_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return c.json({
        data: { documents: [] },
        total: 0,
      });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );

    return c.json({
      data: workspaces,
    });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })
  .post(
    "/",
    zValidator("form", CreateWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

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

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(INVITECODE_LENGTH),
        }
      );

      await databases.createDocument(DATABASE_ID, MEMBER_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({
        data: workspace,
      });
    }
  )
  .patch(
    "/:workspaceId",
    zValidator("form", UpdateWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const storage = c.get("storage");

      const workspaceId = c.req.param("workspaceId");
      const { name, image } = c.req.valid("form");

      console.log("image", image);

      const member = await getMember({
        databases,
        workspaceId,
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

      const updatedWorkspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({
        data: updatedWorkspace,
      });
    }
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
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

    await databases.deleteDocument(DATABASE_ID, WORKSPACE_ID, workspaceId);

    return c.json({
      data: { $id: workspaceId },
    });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
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

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(INVITECODE_LENGTH),
      }
    );

    return c.json({
      data: { workspace },
    });
  })
  .post(
    "/:workspaceId/join",
    zValidator(
      "json",
      z.object({
        inviteCode: z.string().min(1, { message: "Invite code is required" }),
      })
    ),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json(
          {
            error: "Already a member",
          },
          400
        );
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );

      if (!workspace) {
        return c.json(
          {
            error: "Workspace not found",
          },
          404
        );
      }

      if (workspace.inviteCode !== inviteCode) {
        return c.json(
          {
            error: "Invalid invite code",
          },
          400
        );
      }

      await databases.createDocument(DATABASE_ID, MEMBER_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.MEMBER,
      });

      const updatedWorkspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(INVITECODE_LENGTH),
        }
      );

      return c.json({
        data: { $id: updatedWorkspace.$id },
      });
    }
  )
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    // const workspace = await databases.getDocument<Workspace>(
    //   DATABASE_ID,
    //   WORKSPACE_ID,
    //   workspaceId
    // );

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
    const thisMonthStart = startOfMonth(new Date());
    const thisMonthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const taskCount = thisMonthTasks.total;
    const taskDiff = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        Query.equal("assigneeId", member.$id),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
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
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        Query.notEqual("status", "DONE"),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
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
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
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
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", new Date().toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverDueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", new Date().toISOString()),
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
