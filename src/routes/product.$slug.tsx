import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { colorsOf, effectivePrice, formatBDT, img, SIZES } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const list = await context.queryClient.ensureQueryData(productsQuery);
    const p = list.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Little Petal` : "Product — Little Petal" },
      { name: "description", content: loaderData?.description ?? "Baby fashion by Little Petal." },
      { property: "og:title", content: loaderData?.name ?? "Little Petal" },
      { property: "og:description", content: loaderData?.description ?? "Baby fashion by Little Petal." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productsQuery);
  const p = data.find((x) => x.slug === slug)!;
  const colors = colorsOf(p);
  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(p.image_key);
  const { addToCart, toggleWish, wishlist } = useStore();
  const variant = p.product_variants.find((v) => v.color === color && v.size === size);
  const related = useMemo(() => data.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4), [data, p]);
  const wished = wishlist.includes(p.id);

  const add = () => {
    if (!variant || variant.stock < 1) { toast.error("Please choose an available size"); return; }
    addToCart({ productId: p.id, variantId: variant.id, name: p.name, color, size: variant.size, price: effectivePrice(p), image: p.image_key, qty: Math.min(qty, variant.stock) });
    toast.success(`${p.name} added to bag`, { description: `${color} · ${variant.size}` });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <nav className="eyebrow mb-6 text-muted-foreground">
        <Link to="/">Home</Link> / <Link to="/shop" search={{ category: p.category }}>{p.category}</Link> / {p.name}
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="group relative aspect-[4/5] overflow-hidden bg-muted">
            <img src={img(shot)} alt={p.name} width={896} height={1152}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[p.image_key, p.alt_image_key].map((k) => (
              <button key={k} onClick={() => setShot(k)} aria-label="View image"
                className={`aspect-square overflow-hidden border-2 ${shot === k ? "border-foreground" : "border-transparent"}`}>
                <img src={img(k)} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="pb-24 md:pb-0">
          {p.is_new && <span className="eyebrow">New arrival</span>}
          <h1 className="mt-2 font-display text-section">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">SKU {p.sku}</p>
          <div className="mt-4 flex items-baseline gap-3 text-xl">
            {formatBDT(effectivePrice(p))}
            {p.sale_price && <span className="text-base text-muted-foreground line-through">{formatBDT(p.price)}</span>}
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>

          <div className="mt-8">
            <div className="eyebrow mb-3">Colour — {color}</div>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c.name} aria-label={c.name} onClick={() => { setColor(c.name); setSize(null); }}
                  className={`h-9 w-9 rounded-full border-2 ${color === c.name ? "border-foreground" : "border-border"}`} style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="eyebrow mb-3">Size</div>
            <div className="grid grid-cols-4 gap-2">
              {SIZES.map((s) => {
                const v = p.product_variants.find((x) => x.color === color && x.size === s);
                const out = !v || v.stock < 1;
                return (
                  <button key={s} disabled={out} onClick={() => setSize(s)}
                    className={`border py-2.5 text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "hover:border-foreground"} disabled:cursor-not-allowed disabled:text-muted-foreground disabled:line-through`}>
                    {s}
                  </button>
                );
              })}
            </div>
            {variant && variant.stock <= 3 && <p className="mt-2 text-sm text-destructive">Only {variant.stock} left</p>}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t bg-background p-3 md:static md:mt-8 md:border-0 md:p-0">
            <div className="flex items-center border">
              <button aria-label="Decrease" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center">{qty}</span>
              <button aria-label="Increase" className="p-3" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={add} className="eyebrow flex-1 bg-primary py-4 text-primary-foreground transition hover:opacity-90">
              {size ? "Add to bag" : "Select a size"}
            </button>
            <button aria-label="Wishlist" onClick={() => toggleWish(p.id)} className="border px-4">
              <Heart className={`h-5 w-5 ${wished ? "fill-foreground" : ""}`} />
            </button>
          </div>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="fabric"><AccordionTrigger>Fabric & care</AccordionTrigger>
              <AccordionContent>Made from soft {p.fabric}. Hand wash cold, dry flat in shade, cool iron on reverse.</AccordionContent></AccordionItem>
            <AccordionItem value="size"><AccordionTrigger>Size guide</AccordionTrigger>
              <AccordionContent>
                Newborn up to 4kg · 0-3M 4–6kg · 3-6M 6–8kg · 6-12M 8–10kg · 12-18M 10–11kg · 18-24M 11–12.5kg · 2-3Y 12.5–14kg · 3-4Y 14–16kg
              </AccordionContent></AccordionItem>
            <AccordionItem value="delivery"><AccordionTrigger>Delivery & returns</AccordionTrigger>
              <AccordionContent>Inside Dhaka ৳70 (1–2 days), outside Dhaka ৳130 (2–4 days). Free over ৳5,000. Easy 7-day exchange.</AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-3xl">You may also love</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
