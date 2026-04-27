"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signUp } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signUp(name, email, password);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex py-24 items-center justify-center bg-gradient-to-br from-green-100 via-emerald-300 to-green-100 px-4">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full top-10 left-10" />
      <div className="absolute w-72 h-72 bg-green-200/20 blur-2xl rounded-full bottom-10 right-10" />

      <Card className="relative w-full max-w-md shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardContent className="pt-6">
          {/* Branding */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">SoftBuy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create your account to start shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                className="focus-visible:ring-green-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Create password"
                className="focus-visible:ring-green-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                className="focus-visible:ring-green-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Links */}
            <div className="flex justify-end text-sm">
              <Link
                href="/login"
                className="hover:text-green-700 hover:underline"
              >
                Already have an account?
              </Link>
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full hover:bg-green-50">
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
