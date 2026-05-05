import { withAuth } from "next-auth/middleware";

export default withAuth();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/api/products/:path*",
  ],
};
