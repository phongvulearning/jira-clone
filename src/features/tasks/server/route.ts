import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateTaskSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMember } from "@/features/members/queries";
import { DATABASE_ID, MEMBER_ID, PROJECT_ID, TASK_ID } from "@/config";
import { Task, TaskStatus } from "../type";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/type";
import { Member } from "@/features/members/types";
import { z } from "zod";

const app = new Hono()
  .post(
    "/",
    zValidator("json", CreateTaskSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        projectId,
        workspaceId,
        description,
        dueDate,
        assigneeId,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      const highestPositionTask = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASK_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("projectId", projectId),
          Query.equal("status", status),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument<Task>(
        DATABASE_ID,
        TASK_ID,
        ID.unique(),
        {
          name,
          status,
          projectId,
          workspaceId,
          description,
          dueDate,
          assigneeId,
          position: newPosition,
        }
      );

      return c.json({
        data: task,
      });
    }
  )
  .patch(
    "/:taskId",
    zValidator("json", CreateTaskSchema.partial()),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const taskId = c.req.param("taskId");
      const { name, status, projectId, description, dueDate, assigneeId } =
        c.req.valid("json");

      const existedTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASK_ID,
        taskId
      );

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: existedTask.workspaceId,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      const updatedTask = await databases.updateDocument<Task>(
        DATABASE_ID,
        TASK_ID,
        taskId,
        {
          name,
          status,
          dueDate,
          projectId,
          assigneeId,
          description,
        }
      );

      return c.json({
        data: updatedTask,
      });
    }
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const taskId = c.req.param("taskId");

    const existedTask = await databases.getDocument<Task>(
      DATABASE_ID,
      TASK_ID,
      taskId
    );

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId: existedTask.workspaceId,
    });

    if (!member) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    await databases.deleteDocument(DATABASE_ID, TASK_ID, taskId);

    return c.json({
      data: {
        $id: taskId,
      },
    });
  })
  .get("/:taskId", sessionMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const taskId = c.req.param("taskId");

    const existedTask = await databases.getDocument<Task>(
      DATABASE_ID,
      TASK_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      userId: currentUser.$id,
      workspaceId: existedTask.workspaceId,
    });

    if (!currentMember) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      existedTask.projectId
    );

    const member = await databases.getDocument<Member>(
      DATABASE_ID,
      MEMBER_ID,
      existedTask.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: { ...existedTask, assignee, project },
    });
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        status: z.string().optional(),
        assigneeId: z.string().optional(),
        projectId: z.string().optional(),
        dueDate: z.string().optional(),
        search: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const { workspaceId, status, assigneeId, projectId, dueDate, search } =
        c.req.valid("query");

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
          400
        );
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderAsc("$createdAt"),
      ];

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (assigneeId) {
        query.push(Query.equal("assigneeId", assigneeId));
      }
      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate));
      }

      if (search) {
        query.push(Query.search("name", search));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASK_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECT_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBER_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      const populatedTasks = await Promise.all(
        tasks.documents.map(async (task) => {
          const project = projects.documents.find(
            (project) => project.$id === task.projectId
          );
          const assignee = assignees.find(
            (assignee) => assignee.$id === task.assigneeId
          );

          return {
            ...task,
            project,
            assignee,
          };
        })
      );

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )
  .post(
    "/bulk-update",
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const taskIds = tasks.map((task) => task.$id);

      const existedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASK_ID,
        [Query.contains("$id", taskIds)]
      );

      const workpspaceIds = new Set(
        existedTasks.documents.map((task) => task.workspaceId)
      );

      if (workpspaceIds.size < 1) {
        return c.json(
          {
            error: "All tasks must belong to the same workspace",
          },
          400
        );
      }

      const workspaceId = workpspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json(
          {
            error: "Workspace Id is missing",
          },
          400
        );
      }

      const members = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!members) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;

          return databases.updateDocument<Task>(DATABASE_ID, TASK_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;
