import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatBDT } from "@/lib/catalog";
import { couponDiscount, deliveryFee, DISTRICTS, isValidBDPhone, PAYMENT_METHODS } from "@/lib/checkout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Little Petal" },
      { name: "description", content: "Fast checkout with Cash on Delivery across Bangladesh." },
      { property: "og:title", content: "Checkout — Little Petal" },
      { property: "og:description", content: "Cash on Delivery across Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const field = "w-full border bg-background px-4 py-3 outline-none focus:border-foreground";

function Checkout() {
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", phone: "", district: "Dhaka", address: "", note: "" });
  const [pay, setPay] = useState<string>("cod");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = couponDiscount(applied, subtotal);
  const fee = deliveryFee(f.district, subtotal - discount);
  const total = subtotal - discount + fee;

  if (cart.length === 0)
    return <div className="py-32 text-center"><p>Your bag is empty.</p><Link to="/shop" className="underline">Shop now</Link></div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.address.trim()) { toast.error("Please fill in your name and address"); return; }
    if (!isValidBDPhone(f.phone)) { toast.error("Enter a valid Bangladeshi mobile number (01XXXXXXXXX)"); return; }
    const id = `LP${Date.now().toString().slice(-7)}`;
    const order = { id, ...f, pay, lines: cart, subtotal, discount, fee, total, createdAt: new Date().toISOString(), status: "Order placed" };
    const all = JSON.parse(localStorage.getItem("lp-orders") ?? "[]");
    localStorage.setItem("lp-orders", JSON.stringify([order, ...all]));
    clearCart();
    navigate({ to: "/order/$id", params: { id } });
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-[1fr_380px] md:px-8">
      <div className="space-y-8">
        <h1 className="font-display text-section">Checkout</h1>
        <section className="space-y-3">
          <h2 className="eyebrow">Delivery details</h2>
          <input className={field} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={field} placeholder="Mobile (01XXXXXXXXX)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <select className={field} value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <textarea className={field} rows={3} placeholder="House, road, area" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          <input className={field} placeholder="Note for courier (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </section>
        <section className="space-y-3">
          <h2 className="eyebrow">Payment</h2>
          {PAYMENT_METHODS.map((m) => (
            <label key={m.id} className={`flex cursor-pointer items-center gap-3 border p-4 ${pay === m.id ? "border-foreground" : ""}`}>
              <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} />
              <span className="flex-1">{m.label}</span>
              <span className="text-xs text-muted-foreground">{m.note}</span>
            </label>
          ))}
        </section>
      </div>
      <aside className="h-fit space-y-3 bg-muted p-6">
        <h2 className="eyebrow">Order summary</h2>
        {cart.map((l) => (
          <div key={l.variantId} className="flex justify-between text-sm"><span>{l.name} × {l.qty}<br /><span className="text-muted-foreground">{l.color} · {l.size}</span></span><span>{formatBDT(l.price * l.qty)}</span></div>
        ))}
        <div className="flex gap-2 pt-2">
          <input className={field} placeholder="Coupon (try PETAL10)" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" className="border border-foreground px-4 text-sm"
            onClick={() => { if (couponDiscount(code, subtotal) > 0) { setApplied(code); toast.success("Coupon applied"); } else toast.error("Coupon not valid for this order"); }}>Apply</button>
        </div>
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{formatBDT(discount)}</span></div>}
          <div className="flex justify-between"><span>Delivery ({f.district === "Dhaka" ? "inside" : "outside"} Dhaka)</span><span>{fee ? formatBDT(fee) : "Free"}</span></div>
          <div className="flex justify-between pt-2 text-lg"><span>Total</span><span>{formatBDT(total)}</span></div>
        </div>
        <button className="eyebrow w-full bg-primary py-4 text-primary-foreground">Place order</button>
      </aside>
    </form>
  );
}
