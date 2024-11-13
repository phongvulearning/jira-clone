import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

interface UseGetProjectAnalyticsProps {
  workspaceId: string;
}
export type ProjectAnalyticsResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["analytics"]["$get"],
  200
>["data"];

export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[
        ":workspaceId"
      ].analytics.$get({
        param: { workspaceId },
      });
      if (!response.ok) {
        throw new Error("Failed to get workspace analytics");
      }
      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
