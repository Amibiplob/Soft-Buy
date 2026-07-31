"use client";

import { useState } from "react";
import {
  Save,
  Camera,
  Globe,

} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function StoreSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Store Profile */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Store Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage src="/store-logo.png" />
                  <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                    SB
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-green-700">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  John's Store
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
                  defaultValue="John's Store"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Tagline</Label>
                <Input
                  defaultValue="Quality products, fast delivery"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Description</Label>
                <textarea
                  defaultValue="We sell premium electronics, fashion and home goods sourced directly from top manufacturers."
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Store Email</Label>
                <Input
                  defaultValue="store@johnsstore.com"
                  type="email"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  defaultValue="+1 123-456-7890"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              className={`w-full text-sm gap-2 ${saved ? "bg-green-700" : "bg-green-600 hover:bg-green-700"} text-white`}
            >
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Changes"}
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
              {[
                {
                  icon: FaFacebook,
                  label: "Facebook Page",
                  placeholder: "https://facebook.com/yourpage",
                  color: "text-blue-600",
                },
                {
                  icon: FaInstagram,
                  label: "Instagram",
                  placeholder: "https://instagram.com/youraccount",
                  color: "text-pink-500",
                },
                {
                  icon: FaTwitter,
                  label: "Twitter / X",
                  placeholder: "https://twitter.com/yourhandle",
                  color: "text-sky-500",
                },
                {
                  icon: Globe,
                  label: "Website (optional)",
                  placeholder: "https://yourwebsite.com",
                  color: "text-gray-500",
                },
              ].map(({ icon: Icon, label, placeholder, color }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    {label}
                  </Label>
                  <Input
                    placeholder={placeholder}
                    className="h-9 text-sm border-gray-200"
                  />
                </div>
              ))}
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
              >
                <Save className="w-4 h-4" /> Save Links
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
                <select className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30">
                  <option>Individual / Sole Trader</option>
                  <option>Small Business (LLC)</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Address</Label>
                <Input
                  defaultValue="123 Green Street, New York, NY"
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Country</Label>
                  <select className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Currency</Label>
                  <select className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
              >
                <Save className="w-4 h-4" /> Save Business Info
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
