import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.auth)["logout"]["$post"]
>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.auth["logout"].$post();
      if (!res.ok) throw new Error("Failed to logout!");
      return await res.json();
    },
    onSuccess() {
      router.push("/sign-in");
      router.refresh();
      toast.success("Logged out successfully!");
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
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
