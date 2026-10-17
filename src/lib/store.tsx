import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = { productId: string; variantId: string; name: string; color: string; size: string; price: number; image: string; qty: number };
type Store = {
  cart: CartLine[]; wishlist: string[];
  addToCart: (l: CartLine) => void; removeLine: (variantId: string) => void;
  toggleWish: (id: string) => void;
  setQty: (variantId: string, qty: number) => void; clearCart: () => void;
};
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("lp-cart") ?? "[]"));
      setWish(JSON.parse(localStorage.getItem("lp-wish") ?? "[]"));
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("lp-cart", JSON.stringify(cart)); }, [cart, ready]);
  useEffect(() => { if (ready) localStorage.setItem("lp-wish", JSON.stringify(wishlist)); }, [wishlist, ready]);

  return (
    <Ctx.Provider value={{
      cart, wishlist,
      addToCart: (l) => setCart((c) => {
        const ex = c.find((x) => x.variantId === l.variantId);
        return ex ? c.map((x) => (x.variantId === l.variantId ? { ...x, qty: x.qty + l.qty } : x)) : [...c, l];
      }),
      removeLine: (id) => setCart((c) => c.filter((x) => x.variantId !== id)),
      setQty: (id, q) => setCart((c) => c.map((x) => (x.variantId === id ? { ...x, qty: Math.max(1, q) } : x))),
      clearCart: () => setCart([]),
      toggleWish: (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    }}>{children}</Ctx.Provider>
  );
}
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
};
