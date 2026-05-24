"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    setMessage("Password updated successfully");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="relative flex py-24 items-center justify-center bg-gradient-to-br from-green-100 via-emerald-300 to-green-100 px-4">
      {/* Background Blur Effects */}
      <div className="absolute w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full top-10 left-10" />
      <div className="absolute w-72 h-72 bg-green-200/20 blur-2xl rounded-full bottom-10 right-10" />

      <Card className="relative w-full max-w-md shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardContent className="pt-6">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">
              Reset Password
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>

              <Input
                type="password"
                placeholder="Enter new password"
                className="focus-visible:ring-green-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>

              <Input
                type="password"
                placeholder="Confirm new password"
                className="focus-visible:ring-green-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Button */}
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? "Updating Password..." : "Change Password"}
            </Button>
          </form>

          {/* Back */}
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-green-700 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
