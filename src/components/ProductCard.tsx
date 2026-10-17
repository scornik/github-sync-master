import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { colorsOf, effectivePrice, formatBDT, img, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const { toggleWish, wishlist, addToCart } = useStore();
  const wished = wishlist.includes(p.id);
  const firstInStock = p.product_variants.find((v) => v.stock > 0);
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link to="/product/$slug" params={{ slug: p.slug }} aria-label={p.name} className="absolute inset-0 z-[1]" />
        <img src={img(p.image_key)} alt={p.name} loading="lazy" width={896} height={1152}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
        <img src={img(p.alt_image_key)} alt="" loading="lazy" width={896} height={1152}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 z-[2] flex gap-1">
          {p.is_new && <span className="eyebrow bg-background px-2 py-1">New</span>}
          {p.sale_price && <span className="eyebrow bg-blush px-2 py-1">Sale</span>}
        </div>
        <button aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWish(p.id)}
          className="absolute right-3 top-3 z-[2] grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background">
          <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
        </button>
        <button
          disabled={!firstInStock}
          onClick={() => {
            if (!firstInStock) return;
            addToCart({ productId: p.id, variantId: firstInStock.id, name: p.name, color: firstInStock.color, size: firstInStock.size, price: effectivePrice(p), image: p.image_key, qty: 1 });
            toast.success(`${p.name} added to bag`, { description: `${firstInStock.color} · ${firstInStock.size}` });
          }}
          className="eyebrow absolute z-[2] inset-x-3 bottom-3 translate-y-2 bg-primary py-3 text-primary-foreground opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 disabled:bg-muted-foreground max-md:translate-y-0 max-md:opacity-100">
          {firstInStock ? "Quick Add" : "Sold out"}
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="font-display text-xl leading-tight hover:underline"><h3>{p.name}</h3></Link>
        <div className="text-right text-sm">
          <div>{formatBDT(effectivePrice(p))}</div>
          {p.sale_price && <div className="text-muted-foreground line-through">{formatBDT(p.price)}</div>}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        {colorsOf(p).map((c) => (
          <span key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border" style={{ background: c.hex }} />
        ))}
      </div>
    </article>
  );
}
