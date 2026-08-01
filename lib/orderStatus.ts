export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Out of Stock",
  "Packaging",
  "On the Way",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Which statuses a seller can move an order to FROM its current status
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Packaging", "Out of Stock", "Cancelled"],
  "Out of Stock": ["Confirmed", "Cancelled"], // restock -> back to Confirmed
  Packaging: ["On the Way", "Cancelled"],
  "On the Way": ["Delivered"],
  Delivered: [], // terminal
  Cancelled: [], // terminal
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Out of Stock": "bg-red-100 text-red-700 border-red-200",
  Packaging: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "On the Way": "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};
