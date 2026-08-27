"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AccountData {
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

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AccountData | null>(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch("/api/account");

        if (!res.ok) {
          throw new Error("Failed to load account.");
        }

        const account = await res.json();
        setData(account);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load account.",
        );
      } finally {
        setLoadingAccount(false);
      }
    }

    loadAccount();
  }, []);

  async function handleBecomeSeller(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!storeName.trim()) {
      setError("Please enter a store name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/account/become-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName: storeName.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to become a seller.");
      }

      await update({
        role: "seller",
      });

      router.push("/seller-dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingAccount) {
    return <div className="p-6">Loading account...</div>;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={data.name}
              readOnly
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              value={data.email}
              readOnly
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              value={data.phone}
              readOnly
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Date of Birth
            </label>
            <input
              value={data.dateOfBirth}
              readOnly
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      )}

      {session.user.role === "buyer" && (
        <div className="rounded-lg border border-gray-200 p-5">
          <h2 className="mb-2 text-lg font-semibold">Become a Seller</h2>

          <p className="mb-4 text-sm text-gray-600">
            Create your store and start selling.
          </p>

          <form onSubmit={handleBecomeSeller} className="space-y-4">
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store name"
              disabled={loading}
              className="w-full rounded-md border px-3 py-2"
            />

            <button
              type="submit"
              disabled={loading || !storeName.trim()}
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Creating store..." : "Become a Seller"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
