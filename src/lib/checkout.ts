// Bangladesh delivery + coupon rules (demo values).
export const DISTRICTS = [
  "Dhaka", "Gazipur", "Narayanganj", "Chattogram", "Cox's Bazar", "Sylhet", "Rajshahi",
  "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla", "Bogura", "Jessore", "Noakhali",
];
export const INSIDE_DHAKA_FEE = 70;
export const OUTSIDE_DHAKA_FEE = 130;
export const FREE_DELIVERY_FROM = 5000;

export const deliveryFee = (district: string, subtotal: number) =>
  subtotal >= FREE_DELIVERY_FROM ? 0 : district === "Dhaka" ? INSIDE_DHAKA_FEE : OUTSIDE_DHAKA_FEE;

export const COUPONS: Record<string, { type: "pct" | "flat"; value: number; min: number }> = {
  PETAL10: { type: "pct", value: 10, min: 0 },
  EID500: { type: "flat", value: 500, min: 3000 },
};

export function couponDiscount(code: string, subtotal: number): number {
  const c = COUPONS[code.trim().toUpperCase()];
  if (!c || subtotal < c.min) return 0;
  return c.type === "pct" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
}

export const isValidBDPhone = (p: string) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ""));

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", note: "Pay when your parcel arrives" },
  { id: "bkash", label: "bKash", note: "Demo simulation — no real charge" },
  { id: "nagad", label: "Nagad", note: "Demo simulation — no real charge" },
  { id: "card", label: "Card", note: "Demo simulation — no real charge" },
] as const;
