import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useMemberInfo = ({ workspaceId }: { workspaceId: string }) => {
  const query = useQuery({
    queryKey: ["member-info"],
    queryFn: async () => {
      const response = await client.api.members["member-info"].$get({
        query: {
          workspaceId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch member");
      }
      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
