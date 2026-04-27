"use client";

import { useState } from "react";

type Item = {
  id: number;
  title: string;
  image: string;
  details: string;
  price: number;
  rating: number;
  category: string;
  added_on: string;
  key_features: string[];
};

const categories = [
  "Electronics",
  "Accessories",
  "Fashion",
  "Sports",
  "Furniture",
];

export default function AddProductsPage() {
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    details: "",
    price: "",
    rating: "",
    category: "",
    key_features: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Item = {
      id: Date.now(),
      title: formData.title,
      image: formData.image,
      details: formData.details,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating) || 0,
      category: formData.category,
      added_on: new Date().toISOString().split("T")[0],
      key_features: formData.key_features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    console.log("✅ New Item:", newItem);
    setMessage("✅ Item added successfully!");

    setFormData({
      title: "",
      image: "",
      details: "",
      price: "",
      rating: "",
      category: "",
      key_features: "",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Title */}
        <div>
          <label className="block font-medium">Title *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium">Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block font-medium">Rating (0–5)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block font-medium">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Key Features */}
        <div className="md:col-span-2">
          <label className="block font-medium">
            Key Features (comma separated)
          </label>
          <input
            name="key_features"
            value={formData.key_features}
            onChange={handleChange}
            placeholder="Portable, Wireless, Deep Bass"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Full Description */}
        <div className="md:col-span-2">
          <label className="block font-medium">Full Description *</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded h-32"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Submit Item
          </button>
        </div>
      </form>
    </div>
  );
}
