"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log({ email, password });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative flex py-24 items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full top-10 left-10" />
      <div className="absolute w-72 h-72 bg-green-200/20 blur-2xl rounded-full bottom-10 right-10" />

      <Card className="relative w-full max-w-md shadow-2xl border-white/10 bg-white/95 backdrop-blur">
        <CardContent className="pt-6">
          {/* Branding inside */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">SoftBuy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Continue your shopping journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Your Password"
                className="focus-visible:ring-green-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between text-sm">
              <a href="#" className="hover:text-green-700 hover:underline">
                Forgot password?
              </a>
              <a
                href="/register"
                className="hover:text-green-700 hover:underline"
              >
                Sign up
              </a>
            </div>

            <Button
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue to SoftBuy"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social login */}
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
