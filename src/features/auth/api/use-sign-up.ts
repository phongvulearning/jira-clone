import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<typeof client.api.auth.register.$post>;
type RequestType = InferRequestType<typeof client.api.auth.register.$post>;

export const useSignUp = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.auth.register.$post({ json });
      if (!res.ok) throw new Error("Failed to sign up!");
      return await res.json();
    },
    onSuccess() {
      router.refresh();
      toast.success("Sign up successfully!");
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
