"use client";

import { useEffect, useState } from "react";
import { Save, Camera, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

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

async function saveSection(
  section: "profile" | "social" | "business",
  data: Record<string, unknown>,
) {
  const res = await fetch("/api/seller/store", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to save");
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<StoreProfile>(emptyProfile);
  const [social, setSocial] = useState<StoreSocial>(emptySocial);
  const [business, setBusiness] = useState<StoreBusiness>(emptyBusiness);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savedFlag, setSavedFlag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/seller/store")
      .then((res) => res.json())
      .then((json) => {
        setProfile({ ...emptyProfile, ...json.profile });
        setSocial({ ...emptySocial, ...json.social });
        setBusiness({ ...emptyBusiness, ...json.business });
      })
      .catch(() => setError("Failed to load store settings"))
      .finally(() => setLoading(false));
  }, []);

  const flash = (key: string) => {
    setSavedFlag(key);
    setTimeout(() => setSavedFlag(null), 2000);
  };

  const handleSaveProfile = async () => {
    setError(null);
    setSavingProfile(true);
    try {
      await saveSection("profile", profile);
      flash("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSocial = async () => {
    setError(null);
    setSavingSocial(true);
    try {
      await saveSection("social", social);
      flash("social");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingSocial(false);
    }
  };

  const handleSaveBusiness = async () => {
    setError(null);
    setSavingBusiness(true);
    try {
      await saveSection("business", business);
      flash("business");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingBusiness(false);
    }
  };

  const updateLogo = () => {
    const url = window.prompt(
      "Paste an image URL for your store logo:",
      profile.logo,
    );
    if (url !== null) setProfile({ ...profile, logo: url.trim() });
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-96 bg-gray-100 rounded-xl" />
          <div className="h-96 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Store Profile */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Store Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage src={profile.logo || undefined} />
                  <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={updateLogo}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-green-700"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {profile.name || "Your Store"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click camera to update logo
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Tagline</Label>
                <Input
                  value={profile.tagline}
                  onChange={(e) =>
                    setProfile({ ...profile, tagline: e.target.value })
                  }
                  placeholder="Quality products, fast delivery"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Description</Label>
                <textarea
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
                  }
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  type="email"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="h-9 text-sm border-gray-200"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className={`w-full text-sm gap-2 ${
                savedFlag === "profile"
                  ? "bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savedFlag === "profile" ? "Saved!" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          {/* Social Links */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Social & Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  {
                    key: "facebook",
                    icon: FaFacebook,
                    label: "Facebook Page",
                    placeholder: "https://facebook.com/yourpage",
                    color: "text-blue-600",
                  },
                  {
                    key: "instagram",
                    icon: FaInstagram,
                    label: "Instagram",
                    placeholder: "https://instagram.com/youraccount",
                    color: "text-pink-500",
                  },
                  {
                    key: "twitter",
                    icon: FaTwitter,
                    label: "Twitter / X",
                    placeholder: "https://twitter.com/yourhandle",
                    color: "text-sky-500",
                  },
                  {
                    key: "website",
                    icon: Globe,
                    label: "Website (optional)",
                    placeholder: "https://yourwebsite.com",
                    color: "text-gray-500",
                  },
                ] as const
              ).map(({ key, icon: Icon, label, placeholder, color }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    {label}
                  </Label>
                  <Input
                    value={social[key]}
                    onChange={(e) =>
                      setSocial({ ...social, [key]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="h-9 text-sm border-gray-200"
                  />
                </div>
              ))}
              <Button
                onClick={handleSaveSocial}
                disabled={savingSocial}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
              >
                {savingSocial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savedFlag === "social" ? "Saved!" : "Save Links"}
              </Button>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Business Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Type</Label>
                <select
                  value={business.type}
                  onChange={(e) =>
                    setBusiness({ ...business, type: e.target.value })
                  }
                  className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option>Individual / Sole Trader</option>
                  <option>Small Business (LLC)</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Address</Label>
                <Input
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({ ...business, address: e.target.value })
                  }
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Country</Label>
                  <select
                    value={business.country}
                    onChange={(e) =>
                      setBusiness({ ...business, country: e.target.value })
                    }
                    className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Currency</Label>
                  <select
                    value={business.currency}
                    onChange={(e) =>
                      setBusiness({ ...business, currency: e.target.value })
                    }
                    className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleSaveBusiness}
                disabled={savingBusiness}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
              >
                {savingBusiness ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savedFlag === "business" ? "Saved!" : "Save Business Info"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
