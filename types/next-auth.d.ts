import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "buyer" | "seller";
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: "buyer" | "seller";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "buyer" | "seller";
  }
}
