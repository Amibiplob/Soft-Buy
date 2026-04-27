export interface Product {
  id: number;
  title: string;
  image: string;
  details: string;
  price: number;
  rating: number;
  category: string;
  added_on: string;
  key_features: string[];
  userId?: string; // from Firebase
}
