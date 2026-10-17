import rose from "@/assets/dress-rose.jpg";
import lavender from "@/assets/dress-lavender.jpg";
import butter from "@/assets/dress-butter.jpg";
import sage from "@/assets/romper-sage.jpg";
import boy from "@/assets/outfit-boy.jpg";
import newborn from "@/assets/newborn-set.jpg";

export const IMAGES: Record<string, string> = { rose, lavender, butter, sage, boy, newborn };
export const img = (k: string) => IMAGES[k] ?? rose;

export const SIZES = ["Newborn", "0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "2-3Y", "3-4Y"];
export const CATEGORIES = [
  { id: "dresses", label: "Dresses", image: "rose" },
  { id: "occasionwear", label: "Occasionwear", image: "lavender" },
  { id: "outfits", label: "Outfits", image: "boy" },
  { id: "newborn", label: "Newborn", image: "newborn" },
];

export type Variant = { id: string; color: string; color_hex: string; size: string; stock: number };
export type Product = {
  id: string; slug: string; name: string; sku: string; description: string;
  category: string; gender: string; occasion: string; fabric: string;
  price: number; sale_price: number | null; image_key: string; alt_image_key: string;
  is_new: boolean; is_bestseller: boolean; popularity: number; created_at: string;
  product_variants: Variant[];
};

export const formatBDT = (n: number) => `৳${n.toLocaleString("en-BD")}`;
export const effectivePrice = (p: Pick<Product, "price" | "sale_price">) => p.sale_price ?? p.price;
export const totalStock = (p: Product) => p.product_variants.reduce((s, v) => s + v.stock, 0);
export const colorsOf = (p: Product) => {
  const m = new Map<string, string>();
  p.product_variants.forEach((v) => m.set(v.color, v.color_hex));
  return [...m].map(([name, hex]) => ({ name, hex }));
};

export type Filters = {
  category?: string; gender?: string; age?: string; size?: string; color?: string;
  fabric?: string; occasion?: string; inStock?: boolean; min?: number; max?: number;
  q?: string; sort?: "featured" | "newest" | "price-asc" | "price-desc" | "popular";
};

export function applyFilters(list: Product[], f: Filters): Product[] {
  const size = f.size ?? f.age;
  const out = list.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.gender && p.gender !== f.gender && p.gender !== "unisex") return false;
    if (f.fabric && p.fabric !== f.fabric) return false;
    if (f.occasion && p.occasion !== f.occasion) return false;
    const price = effectivePrice(p);
    if (f.min != null && price < f.min) return false;
    if (f.max != null && price > f.max) return false;
    if (f.q && !`${p.name} ${p.category} ${p.fabric}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    const vs = p.product_variants.filter(
      (v) => (!size || v.size === size) && (!f.color || v.color === f.color),
    );
    if ((size || f.color) && vs.length === 0) return false;
    if (f.inStock && !(size || f.color ? vs : p.product_variants).some((v) => v.stock > 0)) return false;
    return true;
  });
  const s = f.sort ?? "featured";
  const by: Record<string, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || b.popularity - a.popularity,
    newest: (a, b) => b.created_at.localeCompare(a.created_at),
    "price-asc": (a, b) => effectivePrice(a) - effectivePrice(b),
    "price-desc": (a, b) => effectivePrice(b) - effectivePrice(a),
    popular: (a, b) => b.popularity - a.popularity,
  };
  return [...out].sort(by[s]);
}
