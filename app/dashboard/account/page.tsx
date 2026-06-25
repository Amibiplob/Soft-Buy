import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import clientPromise from "@/lib/db";
import AccountSettingsForm from "./account-settings-form";

export interface AccountData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  image: string;
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
    reviewReminders: boolean;
  };
}

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const client = await clientPromise
  const db = client.db();

  const user = await db.collection("users").findOne(
    { email: session.user.email },
    {
      projection: {
        name: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        image: 1,
        notificationPreferences: 1,
      },
    },
  );

  if (!user) {
    redirect("/login");
  }

  const initialData: AccountData = {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    image: user.image ?? "",
    notificationPreferences: {
      orderUpdates: user.notificationPreferences?.orderUpdates ?? true,
      promotions: user.notificationPreferences?.promotions ?? false,
      newArrivals: user.notificationPreferences?.newArrivals ?? true,
      reviewReminders: user.notificationPreferences?.reviewReminders ?? false,
    },
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      <AccountSettingsForm initialData={initialData} />
    </div>
  );
}
