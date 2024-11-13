import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, MEMBER_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMember } from "../queries";
import { Member, MemberRole } from "../types";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { workspaceId } = c.req.valid("query");

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

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBER_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      return c.json({
        data: {
          ...members,
          documents: populatedMembers,
        },
      });
    }
  )
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const memberId = c.req.param("memberId");

    const memberToDelete = await databases.getDocument<Member>(
      DATABASE_ID,
      MEMBER_ID,
      memberId
    );

    if (!memberToDelete) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBER_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
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

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json(
        {
          error: "No permission",
        },
        401
      );
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json(
        {
          error: "Cannot delete the only member",
        },
        400
      );
    }

    await databases.deleteDocument(DATABASE_ID, MEMBER_ID, memberId);
    return c.json({
      data: {
        $id: memberToDelete.$id,
      },
    });
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBER_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBER_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      console.log("memberToUpdate.workspaceId", memberToUpdate.workspaceId);

      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBER_ID, memberId, {
        role,
      });
      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  )
  .get(
    "/member-info",
    zValidator("query", z.object({ workspaceId: z.string() })),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.valid("query");

      const member = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBER_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("workspaceId", workspaceId),
        ]
      );

      const correctMember = member.documents[0];

      if (!correctMember) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      return c.json({
        data: {
          ...correctMember,
          name: user.name || user.email,
          email: user.email,
        },
      });
    }
  );

export default app;
