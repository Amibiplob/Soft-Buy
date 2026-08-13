<div align="center">

<img src="public/logo.png" alt="SoftBuy logo" width="120" />

# SoftBuy

**A full-stack e-commerce platform built with Next.js, MongoDB, and NextAuth.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## About

SoftBuy is a two-sided e-commerce platform with a full **buyer storefront** (browsing, cart, checkout, order tracking, wishlist, account management) and a **seller dashboard** for managing products, orders, and store performance. It's built entirely on the Next.js App Router with the native MongoDB driver (no ORM) and JWT-based auth via NextAuth.

## Features

### 🛍️ Storefront
- Product catalog with category pages and product detail views
- Cart with quantity management, persisted client-side via React Context
- Wishlist synced to MongoDB (`$addToSet` / `$pull`) per logged-in user
- Multi-step checkout supporting **Cash on Delivery** and **card** payment
- Atomic, sequential, human-readable order IDs (`SB10011`, `SB10012`, …) generated via a MongoDB `counters` collection

### 👤 Buyer Dashboard
- Order history and order detail pages
- Saved shipping addresses with a default address flag
- Saved payment methods with a default card flag
- Account settings (profile, password, notification preferences)

### 🏪 Seller Dashboard
- Orders page wired to a live API with status updates, search, and tab-based filtering
- Enforced order status workflow (see below) — a seller can only move an order to a valid next state
- Additional dashboard sections for products, analytics, earnings, payouts, coupons, reviews, and store settings

### 🔐 Auth & Accounts
- Email/password authentication via NextAuth (JWT sessions)
- Registration, login, forgot-password, and reset-password flows
- Passwords hashed with `bcryptjs`
- Role-aware sessions (`user` vs seller-facing routes)

## Order Status Workflow

Orders move through a fixed set of statuses, with only specific forward/backward transitions allowed:

```
Pending → Confirmed → Packaging → On the Way → Delivered
             ↓            ↓
        Out of Stock   Cancelled
             ↓
         Confirmed (restock)
```

Defined centrally in [`lib/orderStatus.ts`](lib/orderStatus.ts) as `ORDER_STATUSES` and `STATUS_TRANSITIONS`, so the same rules are enforced anywhere an order status is changed.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (`radix-nova` style), [Radix UI](https://www.radix-ui.com/) |
| Language | TypeScript |
| Database | MongoDB (native driver, no Mongoose) |
| Auth | NextAuth v4 (Credentials provider, JWT sessions) |
| Icons | lucide-react, react-icons |
| Email | [Resend](https://resend.com/) |
| Notifications | Sonner (toasts) |

## Project Structure

```
Soft-Buy-main/
├─ app/
│  ├─ (auth)/            # login, register, forgot/reset password
│  ├─ (shop)/             # cart, checkout, products, category pages
│  ├─ dashboard/          # buyer account: orders, addresses, payment methods, wishlist
│  ├─ seller-dashboard/   # seller-facing: orders, products, analytics, earnings, payouts…
│  ├─ api/
│  │  ├─ auth/            # NextAuth handler, register, forgot/reset password
│  │  ├─ orders/          # place order, list orders, order detail
│  │  ├─ seller/orders/   # seller order list + status updates
│  │  ├─ products/        # product listing + creation
│  │  ├─ wishlist/        # wishlist add/remove
│  │  ├─ addresses/       # address CRUD + default address
│  │  ├─ payment-methods/ # payment method CRUD + default card
│  │  └─ account/         # profile, password, notification settings
│  └─ page.tsx            # homepage (banner, features, discounts, reviews)
├─ components/
│  ├─ layout/             # Navbar, Footer, MobileMenu, NavAuthSection
│  ├─ home/                # Banner, Features, Discount, Reviews
│  └─ ui/                  # shadcn/ui primitives
├─ context/                # CartContext, WishlistContext (React Context + reducers)
├─ lib/
│  ├─ db.ts                # MongoDB client singleton (dev-safe global caching)
│  ├─ auth.ts               # NextAuth authOptions (Credentials + JWT callbacks)
│  ├─ orderStatus.ts        # Order status enum, transitions, badge styles
│  └─ data/products.ts      # Server-side product data helpers
└─ types/                   # Shared TypeScript interfaces (Product, Address, PaymentMethod…)
```

## Getting Started

### Prerequisites
- Node.js 20+
- [pnpm](https://pnpm.io/)
- A MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Resend](https://resend.com/) API key (for transactional emails, e.g. password reset)

### Installation

```bash
git clone https://github.com/AmiBiplob/Soft-Buy.git
cd Soft-Buy
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Resend (transactional email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Run the dev server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
pnpm build   # production build
pnpm start   # run the production build
pnpm lint    # run ESLint
```

## Roadmap / Known Gaps

- Several seller-dashboard sections (analytics, earnings, payouts, coupons, reviews, store settings) currently render static/mock data and aren't yet wired to MongoDB — the **orders** page is the first to be fully live.
- Server-side price/stock revalidation at checkout is an active area of hardening to prevent client-supplied totals from being trusted as-is.
- Product creation currently ties a product to the authenticated user but doesn't yet gate the storefront's seller-only actions by role.

## License

This project currently has no license file — all rights reserved by the author unless stated otherwise.

## Author

**Biplob** — [GitHub](https://github.com/AmiBiplob) · [Portfolio](https://amibiplob.vercel.app) · [LinkedIn](https://linkedin.com/in/amibiplob)
