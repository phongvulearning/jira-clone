import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bulk-update"]["$post"],
  200
>;

type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-update"]["$post"]
>;

export const useBulkUpdate = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.tasks["bulk-update"].$post({
        json,
      });

      if (!res.ok) throw new Error("Failed to update task!");

      return await res.json();
    },
    onSuccess() {
      router.refresh();
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError(error) {
      console.log(error);
    },
  });

  return mutation;
};
