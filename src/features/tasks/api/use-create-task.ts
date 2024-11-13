import { client } from "@/lib/rpc";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.tasks)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tasks)["$post"]>;

export const useCreateTask = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.tasks["$post"]({
        json,
      });

      if (!res.ok) throw new Error("Failed to create task!");

      return await res.json();
    },
    onSuccess() {
      router.refresh();
      toast.success("Create task successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
