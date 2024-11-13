import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<typeof client.api.workspaces.$post>;
type RequestType = InferRequestType<typeof client.api.workspaces.$post>;

export const useCreateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const res = await client.api.workspaces.$post({ form });
      if (!res.ok) throw new Error("Failed to create workspace!");
      return await res.json();
    },
    onSuccess() {
      router.refresh();
      toast.success("Create workspace successfully!");
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
