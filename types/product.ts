export interface Product {
  _id: string;
  id: number;
  title: string;
  description: string;
  details: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  image: string;
  images?: string[];
  key_features: string[];
  added_on: string;
  userId?: string;
  active?: boolean;
}
