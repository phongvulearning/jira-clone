import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"]
>;

export const useJoinWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const res = await client.api.workspaces[":workspaceId"]["join"]["$post"]({
        json,
        param,
      });

      if (!res.ok) throw new Error("Failed to join workspace");

      return await res.json();
    },
    onSuccess() {
      router.refresh();
      toast.success("Workspace joined successfully!");
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError(error) {
      console.log("error", error);
      toast.error(error.message);
    },
  });

  return mutation;
};
