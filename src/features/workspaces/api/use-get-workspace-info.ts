import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceInfo = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const query = useQuery({
    queryKey: ["workspace-info", workspaceId],
    queryFn: async () => {
      const res = await client.api.workspaces[":workspaceId"]["$get"]({
        param: { workspaceId },
      });

      if (!res.ok) throw new Error("Failed to get workspace info!");

      const { data } = await res.json();

      return data;
    },
  });

  return query;
};
