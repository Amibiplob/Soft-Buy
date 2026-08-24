import { ObjectId } from "mongodb";

export type PayoutMethod = "Bank Transfer" | "PayPal";

export interface BankAccountDocument {
  _id?: ObjectId;
  sellerId: string;
  method: PayoutMethod;
  bankName: string;
  accountHolder: string;
  last4: string;
  routingNumber?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutStatus = "Processing" | "Completed" | "Failed";

export interface PayoutDocument {
  _id?: ObjectId;
  sellerId: string;
  payoutId: string;
  amount: number;
  method: PayoutMethod;
  accountLabel: string;
  status: PayoutStatus;
  createdAt: Date;
}
