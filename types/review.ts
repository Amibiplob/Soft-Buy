import { ObjectId } from "mongodb";

export type ReviewStatus = "Published" | "Pending";

export interface ReviewDocument {
  _id?: ObjectId;
  sellerId: string;
  productId: string;
  productName: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
}
