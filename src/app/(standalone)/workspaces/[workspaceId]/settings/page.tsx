import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { WorkspaceIdSettingsPageClient } from "./client";

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <WorkspaceIdSettingsPageClient />;
};

export default WorkspaceIdSettingsPage;
