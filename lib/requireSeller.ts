import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Use at the top of any /api/seller/* route.
 * Returns the session only if the caller is logged in AND has role "seller".
 */
export async function getSellerSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role !== "seller") {
    return {
      session: null,
      error: "Seller account required",
      status: 403 as const,
    };
  }

  return { session, error: null, status: 200 as const };
}
