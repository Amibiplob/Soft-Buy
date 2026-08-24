<div align="center">

<img src="public/logo.png" alt="SoftBuy logo" width="120" />

# SoftBuy

A full-stack, two-sided e-commerce platform — buyer storefront plus seller dashboard — built on the Next.js App Router with MongoDB and NextAuth.

**Live:** https://soft-buy.vercel.app
**Author:** Biplob — [GitHub](https://github.com/AmiBiplob) · [Portfolio](https://amibiplob.vercel.app) · [LinkedIn](https://linkedin.com/in/amibiplob)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## About

SoftBuy is a two-sided marketplace: a **buyer storefront** (browsing, cart, checkout, order tracking, wishlist, account management) and a **seller dashboard** (orders, products, store performance). Built entirely on the Next.js App Router with the native MongoDB driver (no ORM) and JWT-based auth via NextAuth.

## Current Status

This project is actively developed. Here's what's real today versus what's still in progress, so anyone reviewing the code knows exactly what to expect:

**Live and fully wired to the database:**
- Registration, login, forgot/reset password (NextAuth, JWT sessions, bcrypt-hashed passwords)
- Product catalog, cart, wishlist (MongoDB `$addToSet`/`$pull`)
- Checkout flow (Cash on Delivery + card), with atomic human-readable order IDs (`SB10011`, `SB10012`, …) via a MongoDB `counters` collection
- Buyer dashboard: order history/detail, saved addresses, saved payment methods, account settings
- Seller orders page: live API, status updates, search, tab-based filtering
- Centralized order-status state machine (`lib/orderStatus.ts`) — enforces valid transitions everywhere an order changes state

**Known gaps (in progress):**
- Several seller-dashboard sections (analytics, earnings, payouts, coupons, reviews, store settings) currently render static/mock data — not yet wired to MongoDB
- Server-side price/stock revalidation at checkout is an active area of hardening, to stop client-supplied totals from being trusted as-is
- Product creation ties a product to its authenticated owner but doesn't yet gate storefront seller-only actions by role

## Order Status Workflow

```
Pending → Confirmed → Packaging → On the Way → Delivered
             ↓            ↓
        Out of Stock   Cancelled
             ↓
         Confirmed (restock)
```

Defined centrally as `ORDER_STATUSES` and `STATUS_TRANSITIONS` in `lib/orderStatus.ts`, so the same rules apply everywhere an order's status changes.

## Tech Stack

| Layer         | Technology                                                              |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | Next.js 16 (App Router)                                                  |
| UI            | React 19, Tailwind CSS v4, shadcn/ui (`radix-nova`), Radix UI            |
| Language      | TypeScript                                                                |
| Database      | MongoDB (native driver, no Mongoose)                                     |
| Auth          | NextAuth v4 — Credentials provider, JWT sessions, bcrypt password hashing |
| Icons         | lucide-react, react-icons                                                 |
| Email         | Resend (transactional — password reset)                                  |
| Notifications | Sonner (toasts)                                                          |

## Project Structure

```
Soft-Buy-main/
├─ app/
│  ├─ (auth)/            # login, register, forgot/reset password
│  ├─ (shop)/            # cart, checkout, products, category pages
│  ├─ dashboard/         # buyer account: orders, addresses, payment methods, wishlist
│  ├─ seller-dashboard/  # seller-facing: orders, products, analytics, earnings, payouts…
│  ├─ api/
│  │  ├─ auth/            # NextAuth handler, register, forgot/reset password
│  │  ├─ orders/          # place order, list orders, order detail
│  │  ├─ seller/orders/   # seller order list + status updates
│  │  ├─ products/        # product listing + creation
│  │  ├─ wishlist/        # wishlist add/remove
│  │  ├─ addresses/       # address CRUD + default address
│  │  ├─ payment-methods/ # payment method CRUD + default card
│  │  └─ account/         # profile, password, notification settings
│  └─ page.tsx            # homepage
├─ components/
│  ├─ layout/             # Navbar, Footer, MobileMenu, NavAuthSection
│  ├─ home/                # Banner, Features, Discount, Reviews
│  └─ ui/                  # shadcn/ui primitives
├─ context/                # CartContext, WishlistContext
├─ lib/
│  ├─ db.ts                # MongoDB client singleton
│  ├─ auth.ts               # NextAuth authOptions (Credentials + JWT callbacks)
│  ├─ orderStatus.ts        # Order status enum, transitions, badge styles
│  └─ data/products.ts      # Server-side product data helpers
└─ types/                   # Shared TypeScript interfaces
```

## Getting Started

**Prerequisites:** Node.js 20+, [pnpm](https://pnpm.io/), a MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas)), a [Resend](https://resend.com/) API key.

```bash
git clone https://github.com/AmiBiplob/Soft-Buy.git
cd Soft-Buy
pnpm install
```

Create `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

```bash
pnpm dev     # http://localhost:3000
pnpm build   # production build
pnpm start   # run production build
pnpm lint    # ESLint
```

## Roadmap

- [ ] Wire remaining seller-dashboard sections (analytics, earnings, payouts, coupons, reviews, store settings) to MongoDB
- [ ] Server-side price/stock revalidation at checkout
- [ ] Role-gate storefront seller-only actions

## License

No license file yet — all rights reserved by the author unless stated otherwise.