"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Lock, ShieldCheck, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "card" | "paypal" | "cod";

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  country: string;
}

interface CardForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
}

interface SavedCard {
  _id: string;
  brand: string; // "visa" | "mastercard" | "amex" | ...
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
}

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

function BrandIcon({ brand }: { brand: string }) {
  switch (brand?.toLowerCase()) {
    case "visa":
      return <VisaIcon />;
    case "mastercard":
      return <MastercardIcon />;
    case "amex":
      return <AmexIcon />;
    default:
      return <VisaIcon />;
  }
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
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeItem } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Saved default card
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [useSavedCard, setUseSavedCard] = useState(true);

  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    country: "us",
  });

  const [card, setCard] = useState<CardForm>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    async function fetchDefaultCard() {
      try {
        const res = await fetch("/api/payment-methods");
        if (!res.ok) return;
        const data = await res.json();
        const cards: SavedCard[] = data.paymentMethods ?? [];
        const defaultCard = cards.find((c) => c.isDefault) ?? cards[0] ?? null;
        setSavedCard(defaultCard);
        setUseSavedCard(!!defaultCard);
      } catch {
        // No saved card available — falls back to manual entry below.
      } finally {
        setLoadingCard(false);
      }
    }
    fetchDefaultCard();
  }, []);

  const updateShipping = (field: keyof ShippingForm, value: string) =>
    setShipping((prev) => ({ ...prev, [field]: value }));

  const updateCard = (field: keyof CardForm, value: string) =>
    setCard((prev) => ({ ...prev, [field]: value }));

  const SHIPPING_COST = 0;
  const SUBTOTAL = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const TAX = SUBTOTAL * 0.09;
  const TOTAL = SUBTOTAL + SHIPPING_COST + TAX;

  async function handlePlaceOrder() {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (
      !shipping.fullName ||
      !shipping.email ||
      !shipping.address ||
      !shipping.city
    ) {
      toast.error("Please fill in your shipping details");
      return;
    }

    const usingNewCard =
      paymentMethod === "card" && !(useSavedCard && savedCard);

    if (usingNewCard) {
      const digitsOnly = card.cardNumber.replace(/\s/g, "");
      if (
        digitsOnly.length < 12 ||
        !card.cardName ||
        !card.expiry ||
        !card.cvc
      ) {
        toast.error("Please complete your card details");
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const digitsOnly = card.cardNumber.replace(/\s/g, "");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: shipping,
          paymentMethod,
          // Card data never leaves the browser beyond a reference —
          // either the saved card's id, or just the last 4 of a new card.
          ...(paymentMethod === "card" && useSavedCard && savedCard
            ? { paymentMethodId: savedCard._id, cardLast4: savedCard.last4 }
            : paymentMethod === "card"
              ? { cardLast4: digitsOnly.slice(-4) }
              : {}),
          subtotal: SUBTOTAL,
          shippingCost: SHIPPING_COST,
          tax: TAX,
          totalAmount: TOTAL,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Remove only the ordered products from the cart, not the whole cart —
      // in case items were added after this order was placed in another tab.
      items.forEach((item) => removeItem(item.id));

      toast.success(`Order #${data.orderId} placed successfully`);
      router.push(`/dashboard/orders/${data.orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  }

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
                placeholder="Full Name"
                value={shipping.fullName}
                onChange={(e) => updateShipping("fullName", e.target.value)}
              />
            </FormField>

            <FormField label="Email" id="email">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={shipping.email}
                onChange={(e) => updateShipping("email", e.target.value)}
              />
            </FormField>

            <FormField label="Phone" id="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="+1 123 456 7890"
                value={shipping.phone}
                onChange={(e) => updateShipping("phone", e.target.value)}
              />
            </FormField>

            <FormField label="Address" id="address">
              <Input
                id="address"
                placeholder="123 Green Street"
                value={shipping.address}
                onChange={(e) => updateShipping("address", e.target.value)}
              />
              <Input
                id="address2"
                placeholder="Apartment, suite, etc. (optional)"
                className="mt-2"
                value={shipping.address2}
                onChange={(e) => updateShipping("address2", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" id="city">
                <Input
                  id="city"
                  placeholder="New York"
                  value={shipping.city}
                  onChange={(e) => updateShipping("city", e.target.value)}
                />
              </FormField>
              <FormField label="State" id="state">
                <Input
                  id="state"
                  placeholder="NY"
                  value={shipping.state}
                  onChange={(e) => updateShipping("state", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Country" id="country">
              <Select
                value={shipping.country}
                onValueChange={(v) => updateShipping("country", v)}
              >
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

              {paymentMethod === "card" && (
                <div
                  className="mt-4 flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {loadingCard ? (
                    <div className="h-16 animate-pulse rounded-lg bg-muted" />
                  ) : useSavedCard && savedCard ? (
                    /* ── Saved default card ── */
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                      <div className="flex items-center gap-3">
                        <BrandIcon brand={savedCard.brand} />
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium">
                            •••• •••• •••• {savedCard.last4}
                            {savedCard.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Default
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {savedCard.cardholderName} · Expires{" "}
                            {String(savedCard.expiryMonth).padStart(2, "0")}/
                            {String(savedCard.expiryYear).slice(-2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => setUseSavedCard(false)}
                      >
                        <Pencil className="h-3 w-3" />
                        Use a different card
                      </Button>
                    </div>
                  ) : (
                    /* ── Manual card entry ── */
                    <>
                      {savedCard && (
                        <button
                          type="button"
                          onClick={() => setUseSavedCard(true)}
                          className="self-start text-xs font-medium text-green-700 hover:underline"
                        >
                          Use saved card ending in {savedCard.last4}
                        </button>
                      )}

                      <FormField label="Card Number" id="cardNumber">
                        <Input
                          id="cardNumber"
                          placeholder="4243 4302 4242 4242"
                          value={card.cardNumber}
                          onChange={(e) =>
                            updateCard("cardNumber", e.target.value)
                          }
                          maxLength={19}
                        />
                      </FormField>

                      <FormField label="Name on Card" id="cardName">
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={card.cardName}
                          onChange={(e) =>
                            updateCard("cardName", e.target.value)
                          }
                        />
                      </FormField>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Expiry Date" id="expiry">
                          <Input
                            id="expiry"
                            placeholder="MM / YY"
                            value={card.expiry}
                            onChange={(e) =>
                              updateCard("expiry", e.target.value)
                            }
                            maxLength={7}
                          />
                        </FormField>
                        <FormField label="CVC" id="cvc">
                          <Input
                            id="cvc"
                            placeholder="123"
                            value={card.cvc}
                            onChange={(e) => updateCard("cvc", e.target.value)}
                            maxLength={4}
                          />
                        </FormField>
                      </div>
                    </>
                  )}
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
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${SUBTOTAL.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <div className="text-right">
                <div className="font-medium">${SHIPPING_COST.toFixed(2)}</div>
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

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover border"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      x{item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <Button
            size="lg"
            disabled={items.length === 0 || isPlacingOrder}
            onClick={handlePlaceOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Place Order
              </>
            )}
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
