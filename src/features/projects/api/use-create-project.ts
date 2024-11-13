import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<typeof client.api.projects.$post, 200>;
type RequestType = InferRequestType<typeof client.api.projects.$post>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const res = await client.api.projects.$post({ form });
      if (!res.ok) throw new Error("Failed to create project!");
      return await res.json();
    },
    onSuccess() {
      toast.success("Create project successfully!");
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
