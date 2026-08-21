export type CouponType = "Percentage" | "Fixed" | "Shipping";
export type CouponStoredStatus = "Active" | "Paused";
export type CouponDisplayStatus = CouponStoredStatus | "Expired";

export interface CouponDocument {
  sellerId: string;
  code: string;
  type: CouponType;
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date;
  status: CouponStoredStatus;
  createdAt: Date;
  updatedAt: Date;
}
