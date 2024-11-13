import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const res = await client.api.tasks[":taskId"].$patch({
        json,
        param,
      });

      if (!res.ok) throw new Error("Failed to update task!");

      return await res.json();
    },
    onSuccess({ data }) {
      router.refresh();
      toast.success("Update task successfully!");
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks", data.$id],
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
