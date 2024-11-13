"use server";
import { Query } from "node-appwrite";

import { DATABASE_ID, MEMBER_ID, WORKSPACE_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Workspace } from "./types";
import { getMember } from "../members/queries";

export const getWorkspaces = async () => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();

  if (!user) return { documents: [], total: 0 };

  const members = await databases.listDocuments(DATABASE_ID, MEMBER_ID, [
    Query.equal("userId", user.$id),
  ]);

  if (members.total == 0) {
    return { documents: [], total: 0 };
  }
  const workspaceIds = members.documents.map((member) => member.workspaceId);

  const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACE_ID, [
    Query.orderDesc("$createdAt"),
    Query.contains("$id", workspaceIds),
  ]);

  return workspaces;
};

export const getWorkspace = async (workspaceId: string) => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();

  const member = await getMember({ databases, workspaceId, userId: user.$id });

  if (!member) {
    return null;
  }

  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACE_ID,
    workspaceId
  );

  return workspace;
};
