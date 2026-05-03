"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "card" | "paypal" | "cod";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image: string; // emoji placeholder
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_ITEMS: OrderItem[] = [
  { id: "1", name: "Wireless Headphones", qty: 1, price: 58.99, image: "🎧" },
  { id: "2", name: "Smart Watch", qty: 1, price: 89.99, image: "⌚" },
  { id: "3", name: "Running Shoes", qty: 2, price: 121.98, image: "👟" },
  { id: "4", name: "Travel Backpack", qty: 1, price: 39.99, image: "🎒" },
];

const SUBTOTAL = ORDER_ITEMS.reduce((sum, i) => sum + i.price, 0); // 310.95
const SHIPPING = 0;
const TAX = 28.08;
const TOTAL = SUBTOTAL + SHIPPING + TAX;

// ─── Card Brand Icons (inline SVG stubs) ──────────────────────────────────────

function VisaIcon() {
  return (
    <svg
      width="38"
      height="24"
      viewBox="0 0 38 24"
      fill="none"
      className="rounded"
    >
      <rect width="38" height="24" rx="4" fill="#1A1F71" />
      <text
        x="5"
        y="17"
        fontSize="12"
        fontWeight="700"
        fill="white"
        fontFamily="Arial"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg
      width="38"
      height="24"
      viewBox="0 0 38 24"
      fill="none"
      className="rounded"
    >
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg
      width="38"
      height="24"
      viewBox="0 0 38 24"
      fill="none"
      className="rounded"
    >
      <rect width="38" height="24" rx="4" fill="#2E77BC" />
      <text
        x="5"
        y="17"
        fontSize="9"
        fontWeight="700"
        fill="white"
        fontFamily="Arial"
      >
        AMEX
      </text>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <span className="font-extrabold text-lg tracking-tight">
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009CDE]">Pal</span>
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-5 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function FormField({
  label,
  id,
  children,
  className,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 md:px-8 lg:px-16">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        Checkout
      </h1>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Column 1: Shipping Information ── */}
        <SectionCard title="Shipping Information">
          <div className="flex flex-col gap-4">
            <FormField label="Full Name" id="fullName">
              <Input
                id="fullName"
                placeholder="John Doe"
                defaultValue="John Doe"
              />
            </FormField>

            <FormField label="Email" id="email">
              <Input
                id="email"
                type="email"
                placeholder="john.doe@email.com"
                defaultValue="john.doe@email.com"
              />
            </FormField>

            <FormField label="Phone" id="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="+1 123 456 7890"
                defaultValue="+1 123 456 7890"
              />
            </FormField>

            <FormField label="Address" id="address">
              <Input
                id="address"
                placeholder="123 Green Street"
                defaultValue="123 Green Street"
              />
              <Input
                id="address2"
                placeholder="Apartment, suite, etc. (optional)"
                className="mt-2"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" id="city">
                <Input
                  id="city"
                  placeholder="New York"
                  defaultValue="New York"
                />
              </FormField>
              <FormField label="State" id="state">
                <Input id="state" placeholder="NY" defaultValue="NY" />
              </FormField>
            </div>

            <FormField label="Country" id="country">
              <Select defaultValue="us">
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="bd">Bangladesh</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </SectionCard>

        {/* ── Column 2: Payment Method ── */}
        <SectionCard title="Payment Method">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="flex flex-col gap-4"
          >
            {/* Credit / Debit Card */}
            <div
              className={cn(
                "rounded-lg border p-4 transition-colors cursor-pointer",
                paymentMethod === "card"
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:border-muted-foreground/40",
              )}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer font-medium">
                    Credit / Debit Card
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <VisaIcon />
                  <MastercardIcon />
                  <AmexIcon />
                </div>
              </div>

              {/* Card Fields — visible when selected */}
              {paymentMethod === "card" && (
                <div className="mt-4 flex flex-col gap-3">
                  <FormField label="Card Number" id="cardNumber">
                    <Input
                      id="cardNumber"
                      placeholder="4243 4302 4242 4242"
                      defaultValue="4243 4302 4242 4242"
                      maxLength={19}
                    />
                  </FormField>

                  <FormField label="Name on Card" id="cardName">
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      defaultValue="John Doe"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Expiry Date" id="expiry">
                      <Input
                        id="expiry"
                        placeholder="MM / YY"
                        defaultValue="12 / 26"
                        maxLength={7}
                      />
                    </FormField>
                    <FormField label="CVC" id="cvc">
                      <Input
                        id="cvc"
                        placeholder="123"
                        defaultValue="123"
                        maxLength={4}
                      />
                    </FormField>
                  </div>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div
              className={cn(
                "rounded-lg border p-4 transition-colors cursor-pointer",
                paymentMethod === "paypal"
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:border-muted-foreground/40",
              )}
              onClick={() => setPaymentMethod("paypal")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label
                    htmlFor="paypal"
                    className="cursor-pointer font-medium"
                  >
                    PayPal
                  </Label>
                </div>
                <PayPalLogo />
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              className={cn(
                "rounded-lg border p-4 transition-colors cursor-pointer",
                paymentMethod === "cod"
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:border-muted-foreground/40",
              )}
              onClick={() => setPaymentMethod("cod")}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer font-medium">
                  Cash on Delivery
                </Label>
              </div>
            </div>
          </RadioGroup>
        </SectionCard>

        {/* ── Column 3: Order Summary ── */}
        <SectionCard title="Order Summary">
          {/* Price breakdown */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${SUBTOTAL.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <div className="text-right">
                <div className="font-medium">${SHIPPING.toFixed(2)}</div>
                <div className="text-xs text-green-600 font-medium">
                  Free shipping
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">${TAX.toFixed(2)}</span>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-green-600">${TOTAL.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Item list */}
          <div className="flex flex-col gap-3">
            {ORDER_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Image placeholder */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                    {item.image}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">x{item.qty}</p>
                  </div>
                </div>
                <span className="text-sm font-medium shrink-0">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          {/* CTA */}
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
          >
            <Lock className="h-4 w-4" />
            Place Order
          </Button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Checkout
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
