import { createSessionClient } from "@/lib/appwrite";

export async function getCurrent() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch (error) {
    console.log("error", error);
    return null;
  }
}
