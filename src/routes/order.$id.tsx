import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { formatBDT } from "@/lib/catalog";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Tracking — Little Petal" },
      { name: "description", content: "Track your Little Petal order and delivery progress." },
      { property: "og:title", content: "Order Tracking — Little Petal" },
      { property: "og:description", content: "Track your order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const STEPS = ["Order placed", "Confirmed", "Packed", "Handed to courier", "In transit", "Out for delivery", "Delivered"];

type Order = { id: string; name: string; district: string; address: string; total: number; fee: number; pay: string; status: string; lines: { variantId: string; name: string; qty: number; size: string; color: string }[] };

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    const all: Order[] = JSON.parse(localStorage.getItem("lp-orders") ?? "[]");
    setOrder(all.find((o) => o.id === id) ?? null);
  }, [id]);

  if (order === undefined) return <div className="py-32" />;
  if (!order)
    return <div className="py-32 text-center"><h1 className="font-display text-3xl">Order not found</h1><Link to="/shop" className="underline">Back to shop</Link></div>;

  const at = STEPS.indexOf(order.status);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <span className="eyebrow">Thank you, {order.name.split(" ")[0]}</span>
      <h1 className="mt-2 font-display text-section">Order {order.id}</h1>
      <p className="mt-3 text-muted-foreground">
        Delivering to {order.address}, {order.district}. Total {formatBDT(order.total)} · {order.pay === "cod" ? "Cash on Delivery" : `${order.pay} (demo)`}
      </p>
      <ol className="mt-10 space-y-5 border-l pl-6">
        {STEPS.map((s, i) => (
          <li key={s} className="relative">
            <span className={`absolute -left-[33px] grid h-4 w-4 place-items-center rounded-full border ${i <= at ? "bg-primary text-primary-foreground" : "bg-background"}`}>
              {i <= at && <Check className="h-3 w-3" />}
            </span>
            <span className={i <= at ? "" : "text-muted-foreground"}>{s}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-10 divide-y border-y text-sm">
        {order.lines.map((l) => <li key={l.variantId} className="py-3">{l.name} — {l.color} · {l.size} × {l.qty}</li>)}
      </ul>
      <Link to="/shop" className="eyebrow mt-10 inline-block bg-primary px-8 py-4 text-primary-foreground">Keep shopping</Link>
    </div>
  );
}
