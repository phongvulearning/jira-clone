import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { TaskIdPageClient } from "./client";

const TaskIdPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <TaskIdPageClient />;
};

export default TaskIdPage;
