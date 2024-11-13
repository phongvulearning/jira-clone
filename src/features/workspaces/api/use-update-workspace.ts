import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const res = await client.api.workspaces[":workspaceId"].$patch({
        form,
        param,
      });

      if (!res.ok) throw new Error("Failed to update workspace!");

      return await res.json();
    },
    onSuccess({ data }) {
      router.refresh();
      toast.success("Update workspace successfully!");
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.$id],
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
