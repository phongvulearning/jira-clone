import { Databases, Query } from "node-appwrite";

import { DATABASE_ID, MEMBER_ID } from "@/config";

interface GetMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  databases,
  workspaceId,
  userId,
}: GetMemberProps) => {
  const member = await databases.listDocuments(DATABASE_ID, MEMBER_ID, [
    Query.equal("userId", userId),
    Query.equal("workspaceId", workspaceId),
  ]);

  if (member.total === 0) {
    return null;
  }

  return member.documents[0];
};
