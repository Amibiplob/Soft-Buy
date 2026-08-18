import type { OrderStatus } from "@/lib/orderStatus";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sellerId?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
}

export type PaymentMethod = "card" | "paypal" | "cod";

export interface OrderDocument {
  orderId: string;

  userId: string;

  // Seller responsible for this order.
  sellerId: string;

  customerName: string;

  items: OrderItem[];

  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;

  // Keep this compatible with seller workflow.
  status: OrderStatus;

  statusHistory: StatusHistoryEntry[];

  shippingAddress: ShippingAddress;

  paymentMethod: PaymentMethod;

  cardLast4?: string;

  createdAt: Date;
  updatedAt: Date;
}
