import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetTasks = ({
  workspaceId,
  status,
  assigneeId,
  projectId,
  dueDate,
  search,
}: {
  workspaceId: string;
  assigneeId?: string;
  projectId?: string;
  status?: string;
  dueDate?: string;
  search?: string;
}) => {
  const query = useQuery({
    queryKey: ["tasks", workspaceId, status, assigneeId, projectId, dueDate],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: { workspaceId, status, assigneeId, projectId, dueDate, search },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
