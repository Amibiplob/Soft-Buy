import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

interface StoreProfile {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  logo: string;
}
interface StoreSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  website: string;
}
interface StoreBusiness {
  type: string;
  address: string;
  country: string;
  currency: string;
}

const emptyProfile: StoreProfile = {
  name: "",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  logo: "",
};
const emptySocial: StoreSocial = {
  facebook: "",
  instagram: "",
  twitter: "",
  website: "",
};
const emptyBusiness: StoreBusiness = {
  type: "Individual / Sole Trader",
  address: "",
  country: "United States",
  currency: "USD",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const store = (user.store ?? {}) as {
    profile?: Partial<StoreProfile>;
    social?: Partial<StoreSocial>;
    business?: Partial<StoreBusiness>;
  };

  return NextResponse.json({
    profile: {
      ...emptyProfile,
      name: user.storeName ?? "",
      email: user.email ?? "",
      ...store.profile,
    },
    social: { ...emptySocial, ...store.social },
    business: { ...emptyBusiness, ...store.business },
  });
}

const ALLOWED_SECTIONS = ["profile", "social", "business"] as const;
type Section = (typeof ALLOWED_SECTIONS)[number];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const section = body?.section as Section;
  const data = body?.data;

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const update: Record<string, unknown> = {
    [`store.${section}`]: data,
  };

  // storeName is read elsewhere (become-seller flow, dashboard), keep it in sync.
  if (
    section === "profile" &&
    typeof (data as StoreProfile).name === "string" &&
    (data as StoreProfile).name.trim()
  ) {
    update.storeName = (data as StoreProfile).name.trim();
  }

  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(session.user.id) }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
