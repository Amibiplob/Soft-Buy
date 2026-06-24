import { ObjectId } from "mongodb";

export type PaymentMethodType = "visa" | "mastercard" | "paypal";

export interface PaymentMethodDocument {
  _id?: ObjectId;
  userId: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  last4?: string;
  cardholderName?: string;
  expiry?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  _id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  last4?: string;
  cardholderName?: string;
  expiry?: string;
  isDefault: boolean;
}
