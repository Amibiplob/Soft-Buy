import { ObjectId } from "mongodb";

export interface AddressDocument {
  _id?: ObjectId;
  userId: string;
  label: string;
  name: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}
