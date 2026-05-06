"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Clock,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  color: string;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 59.99,
    quantity: 1,
    emoji: "🎧",
    color: "bg-slate-100",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 89.99,
    quantity: 1,
    emoji: "⌚",
    color: "bg-zinc-100",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 60.99,
    quantity: 2,
    emoji: "👟",
    color: "bg-stone-100",
  },
  {
    id: 4,
    name: "Travel Backpack",
    price: 39.99,
    quantity: 1,
    emoji: "🎒",
    color: "bg-slate-100",
  },
];

const TAX_RATE = 0.09;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductThumbnail({ emoji, color }: { emoji: string; color: string }) {
  return (
    <div
      className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-2xl shrink-0 border border-black/[0.06]`}
    >
      {emoji}
    </div>
  );
}

function QuantityControl({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-input bg-white shadow-sm">
      <button
        onClick={onDecrement}
        disabled={value <= 1}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-lg transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="w-9 h-9 rounded-full border border-input flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span className="text-[11px] text-muted-foreground font-medium leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateQty = (id: number, delta: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  // ── Derived totals ─────────────────────────────────────────────────────────

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Cart</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight mb-7">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ── Cart Table ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_100px_140px_100px_60px] px-6 py-3.5 bg-neutral-50 border-b border-black/[0.07] text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Product</span>
              <span className="text-right">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            {/* Items */}
            <div className="divide-y divide-black/[0.05]">
              {items.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="grid sm:grid-cols-[1fr_100px_140px_100px_60px] grid-cols-1 items-center gap-4 px-6 py-5 group hover:bg-neutral-50/60 transition-colors"
                  >
                    {/* Product */}
                    <div className="flex items-center gap-3.5">
                      <ProductThumbnail emoji={item.emoji} color={item.color} />
                      <span className="font-medium text-sm leading-snug">
                        {item.name}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="sm:text-right flex sm:block justify-between items-center">
                      <span className="sm:hidden text-xs text-muted-foreground">
                        Price
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {fmt(item.price)}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="sm:flex sm:justify-center flex justify-between items-center">
                      <span className="sm:hidden text-xs text-muted-foreground">
                        Quantity
                      </span>
                      <QuantityControl
                        value={item.quantity}
                        onDecrement={() => updateQty(item.id, -1)}
                        onIncrement={() => updateQty(item.id, +1)}
                      />
                    </div>

                    {/* Total */}
                    <div className="sm:text-right flex sm:block justify-between items-center">
                      <span className="sm:hidden text-xs text-muted-foreground">
                        Total
                      </span>
                      <span className="text-sm font-semibold">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="sm:flex sm:justify-center flex justify-end">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="sm:hidden">Remove</span>
                        <Trash2 className="hidden sm:block w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/[0.07] bg-neutral-50/50">
              <Button
                variant="outline"
                asChild
                className="gap-2 text-sm rounded-lg h-9"
              >
                <Link href="/products">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Order Summary ───────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
              <h2 className="text-base font-bold mb-5 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <div className="text-right">
                    <div className="font-medium">{fmt(shipping)}</div>
                    <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                      Free shipping
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{fmt(tax)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-lg text-emerald-600">
                  {fmt(total)}
                </span>
              </div>

              <Button
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/25 hover:-translate-y-px active:translate-y-0"
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <TrustBadge
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Secure Checkout"
                />
                <TrustBadge
                  icon={<RotateCcw className="w-4 h-4" />}
                  label="Easy Returns"
                />
                <TrustBadge
                  icon={<Clock className="w-4 h-4" />}
                  label="24/7 Support"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
