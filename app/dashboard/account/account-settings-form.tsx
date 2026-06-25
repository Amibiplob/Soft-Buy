"use client";

import { useRef, useState } from "react";
import { Camera, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AccountData } from "./page";

type NotificationKey = keyof AccountData["notificationPreferences"];

const NOTIFICATION_CONFIG: {
  key: NotificationKey;
  label: string;
  desc: string;
}[] = [
  {
    key: "orderUpdates",
    label: "Order Updates",
    desc: "Get notified about your order status changes",
  },
  {
    key: "promotions",
    label: "Promotions & Deals",
    desc: "Receive emails about sales and special offers",
  },
  {
    key: "newArrivals",
    label: "New Arrivals",
    desc: "Be the first to know about new products",
  },
  {
    key: "reviewReminders",
    label: "Review Reminders",
    desc: "Reminders to review products you've purchased",
  },
];

function getInitials(name: string) {
  if (!name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function AccountSettingsForm({
  initialData,
}: {
  initialData: AccountData;
}) {
  // Profile
  const [profile, setProfile] = useState({
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone,
    dateOfBirth: initialData.dateOfBirth,
  });
  const [image, setImage] = useState(initialData.image);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState(
    initialData.notificationPreferences,
  );
  const [togglingKey, setTogglingKey] = useState<NotificationKey | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileMessage({
          type: "error",
          text: data.error ?? "Failed to save changes",
        });
      } else {
        setProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
        });
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully",
        });
      }
    } catch {
      setProfileMessage({
        type: "error",
        text: "Something went wrong. Try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage({ type: "error", text: "Please select an image file" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Image must be under 2MB" });
      return;
    }

    setUploadingAvatar(true);
    setProfileMessage(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileMessage({
          type: "error",
          text: data.error ?? "Failed to upload photo",
        });
      } else {
        setImage(data.image);
      }
    } catch {
      setProfileMessage({ type: "error", text: "Failed to upload photo" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    const strongPassword = /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*]).{8,}$/;
    if (!strongPassword.test(passwordForm.next)) {
      setPasswordMessage({
        type: "error",
        text: "Password needs 8+ characters, an uppercase letter, and a number or special character",
      });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage({
          type: "error",
          text: data.error ?? "Failed to update password",
        });
      } else {
        setPasswordForm({ current: "", next: "", confirm: "" });
        setPasswordMessage({
          type: "success",
          text: "Password updated successfully",
        });
      }
    } catch {
      setPasswordMessage({
        type: "error",
        text: "Something went wrong. Try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleToggleNotification(key: NotificationKey) {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    setTogglingKey(key);

    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });
      if (!res.ok) {
        setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      }
    } catch {
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setTogglingKey(null);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Personal Information */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-gray-900">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage src={image || undefined} />
                  <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 text-white" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {profile.name || "Your name"}
                </p>
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
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Email Address
                </Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  type="email"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Phone Number
                </Label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  type="tel"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Date of Birth
                </Label>
                <Input
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))
                  }
                  type="date"
                  className="h-9 text-sm border-gray-200 focus-visible:ring-green-500"
                />
              </div>
            </div>

            {profileMessage && (
              <p
                className={`text-xs ${profileMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {profileMessage.text}
              </p>
            )}

            <Button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-sm mt-1"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </form>
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
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        current: e.target.value,
                      }))
                    }
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
                    value={passwordForm.next}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, next: e.target.value }))
                    }
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
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirm: e.target.value,
                      }))
                    }
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

            {passwordMessage && (
              <p
                className={`text-xs ${passwordMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {passwordMessage.text}
              </p>
            )}

            <Button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
            >
              {savingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update Password
            </Button>
          </form>
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
            {NOTIFICATION_CONFIG.map(({ key, label, desc }) => {
              const on = notifications[key];
              const isToggling = togglingKey === key;
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    disabled={isToggling}
                    onClick={() => handleToggleNotification(key)}
                    className={`mt-0.5 w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${
                      on ? "bg-green-600" : "bg-gray-300"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        on ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
