"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // State for displaying messages

  const router = useRouter();

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // try {
    //   // Simulate API call to send password reset email
    //   await sendPasswordResetEmail(email);
    //   setMessage("Check your inbox for a password reset link.");
    // } catch (err) {
    //   console.error(err);
    //   setMessage("Failed to send reset email. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
  };


  return (
    <div className="relative flex py-24 items-center justify-center bg-gradient-to-br from-green-100 via-emerald-300 to-green-100 px-4">
      <div className="absolute w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full top-10 left-10" />
      <div className="absolute w-72 h-72 bg-green-200/20 blur-2xl rounded-full bottom-10 right-10" />

      <Card className="relative w-full max-w-md shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">
              Forgot Password
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email to reset your password
            </p>
          </div>

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="focus-visible:ring-green-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && (
              <p
                className={`text-center ${message.includes("failed") ? "text-red-600" : "text-green-600"}`}
              >
                {message}
              </p>
            )}

            <Button
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

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
