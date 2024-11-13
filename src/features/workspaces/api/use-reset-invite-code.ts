import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"]
>;

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.workspaces[":workspaceId"][
        "reset-invite-code"
      ]["$post"]({ param });

      if (!res.ok) throw new Error("Failed to reset invite code!");

      return await res.json();
    },
    onSuccess() {
      toast.success("Invite code reset successfully!");
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
