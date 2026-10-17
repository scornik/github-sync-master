import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { formatBDT, img } from "@/lib/catalog";
import { FREE_DELIVERY_FROM } from "@/lib/checkout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Little Petal" },
      { name: "description", content: "Review the baby dresses and outfits in your Little Petal bag." },
      { property: "og:title", content: "Your Bag — Little Petal" },
      { property: "og:description", content: "Review your bag and check out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, removeLine } = useStore();
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const left = FREE_DELIVERY_FROM - subtotal;

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-section">Your bag is empty</h1>
        <Link to="/shop" className="eyebrow mt-8 inline-block bg-primary px-8 py-4 text-primary-foreground">Start shopping</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-[1fr_340px] md:px-8">
      <div>
        <h1 className="font-display text-section">Your bag</h1>
        <ul className="mt-8 divide-y border-y">
          {cart.map((l) => (
            <li key={l.variantId} className="flex gap-4 py-5">
              <img src={img(l.image)} alt={l.name} className="h-32 w-24 object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <h2 className="font-display text-xl">{l.name}</h2>
                  <button aria-label="Remove" onClick={() => removeLine(l.variantId)}><X className="h-4 w-4" /></button>
                </div>
                <p className="text-sm text-muted-foreground">{l.color} · {l.size}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border">
                    <button aria-label="Decrease" className="p-2" onClick={() => setQty(l.variantId, l.qty - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button aria-label="Increase" className="p-2" onClick={() => setQty(l.variantId, l.qty + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                  <span>{formatBDT(l.price * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit bg-muted p-6">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(subtotal)}</span></div>
        <p className="mt-2 text-sm text-muted-foreground">
          {left > 0 ? `Add ${formatBDT(left)} more for free delivery` : "You've unlocked free delivery"}
        </p>
        <Link to="/checkout" className="eyebrow mt-6 block bg-primary py-4 text-center text-primary-foreground">Checkout</Link>
        <Link to="/shop" className="mt-4 block text-center text-sm underline">Continue shopping</Link>
      </aside>
    </div>
  );
}
