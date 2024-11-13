import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetTask = ({ taskId }: { taskId: string }) => {
  const query = useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const res = await client.api.tasks[":taskId"]["$get"]({
        param: { taskId: taskId },
      });

      if (!res.ok) throw new Error("Failed to get task info!");

      const { data } = await res.json();

      return data;
    },
  });
  return query;
};
