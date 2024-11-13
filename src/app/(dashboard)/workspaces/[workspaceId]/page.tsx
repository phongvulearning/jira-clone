import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { WorkspaceIdClient } from "./client";

export default async function WorkspaceId() {
  const current = await getCurrent();

  if (!current) {
    redirect("/sign-in");
  }

  return <WorkspaceIdClient />;
}
