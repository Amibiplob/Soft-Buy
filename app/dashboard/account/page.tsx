"use client";

import { useState } from "react";
import { Camera, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountSettingsPage() {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-green-700 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click camera to update photo
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Full Name
                </Label>
                <Input
                  defaultValue="John Doe"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Email Address
                </Label>
                <Input
                  defaultValue="john.doe@email.com"
                  type="email"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Phone Number
                </Label>
                <Input
                  defaultValue="+1 123-456-7890"
                  type="tel"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Date of Birth
                </Label>
                <Input
                  defaultValue="1990-01-15"
                  type="date"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-sm mt-1">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-9 text-sm border-gray-200 focus-visible:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-9 text-sm border-gray-200 focus-visible:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-9 text-sm border-gray-200 focus-visible:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength hint */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">
                Password must contain:
              </p>
              <ul className="space-y-0.5 ml-2">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One number or special character</li>
              </ul>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2">
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Order Updates",
                  desc: "Get notified about your order status changes",
                  default: true,
                },
                {
                  label: "Promotions & Deals",
                  desc: "Receive emails about sales and special offers",
                  default: false,
                },
                {
                  label: "New Arrivals",
                  desc: "Be the first to know about new products",
                  default: true,
                },
                {
                  label: "Review Reminders",
                  desc: "Reminders to review products you've purchased",
                  default: false,
                },
              ].map(({ label, desc, default: on }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`mt-0.5 w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
                      on ? "bg-green-600" : "bg-gray-300"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        on ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
