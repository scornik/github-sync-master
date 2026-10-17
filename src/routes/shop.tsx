import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ProductCard } from "@/components/ProductCard";
import { applyFilters, CATEGORIES, SIZES, type Filters } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { useStore } from "@/lib/store";

type Search = Filters & { sale?: boolean; wishlist?: boolean };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const str = (k: string) => (typeof s[k] === "string" && s[k] ? (s[k] as string) : undefined);
    const num = (k: string) => (s[k] != null && !isNaN(Number(s[k])) ? Number(s[k]) : undefined);
    const bool = (k: string) => (s[k] === true || s[k] === "true" ? true : undefined);
    const out = {
      category: str("category"), gender: str("gender"), size: str("size"), color: str("color"),
      fabric: str("fabric"), occasion: str("occasion"), q: str("q"),
      sort: str("sort") as Search["sort"], min: num("min"), max: num("max"),
      inStock: bool("inStock"), sale: bool("sale"), wishlist: bool("wishlist"),
    };
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as Search;
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Shop Baby Dresses & Outfits — Little Petal" },
      { name: "description", content: "Browse baby dresses, occasionwear, rompers and newborn sets. Filter by age, size, color, fabric and price in BDT." },
      { property: "og:title", content: "Shop — Little Petal" },
      { property: "og:description", content: "Baby dresses, occasionwear and newborn essentials, delivered across Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const LABELS: Record<string, string> = { category: "Category", gender: "Gender", size: "Age / Size", color: "Color", fabric: "Fabric", occasion: "Occasion", q: "Search", min: "Min", max: "Max", inStock: "In stock", sale: "Sale", wishlist: "Wishlist" };

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data } = useSuspenseQuery(productsQuery);
  const { wishlist } = useStore();
  const [shown, setShown] = useState(8);
  const [drawer, setDrawer] = useState(false);

  const opts = useMemo(() => {
    const u = (f: (p: (typeof data)[number]) => string[]) => [...new Set(data.flatMap(f))].sort();
    return {
      color: u((p) => p.product_variants.map((v) => v.color)),
      fabric: u((p) => [p.fabric]),
      occasion: u((p) => [p.occasion]),
    };
  }, [data]);

  const results = useMemo(() => {
    let r = applyFilters(data, search);
    if (search.sale) r = r.filter((p) => p.sale_price != null);
    if (search.wishlist) r = r.filter((p) => wishlist.includes(p.id));
    return r;
  }, [data, search, wishlist]);

  const set = (k: keyof Search, v: unknown) => { setShown(8); navigate({ search: (s) => ({ ...s, [k]: v || undefined }) }); };
  const active = Object.entries(search).filter(([k, v]) => v != null && k !== "sort");

  const Group = ({ k, title, values }: { k: keyof Search; title: string; values: { id: string; label: string }[] }) => (
    <fieldset className="border-b py-5">
      <legend className="eyebrow mb-3">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const on = search[k] === v.id;
          return (
            <button key={v.id} onClick={() => set(k, on ? undefined : v.id)} aria-pressed={on}
              className={`border px-3 py-1.5 text-xs capitalize transition ${on ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground"}`}>
              {v.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
  const toOpts = (a: string[]) => a.map((x) => ({ id: x, label: x }));

  const filters = (
    <div>
      <Group k="category" title="Category" values={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} />
      <Group k="gender" title="Gender" values={[{ id: "girl", label: "Baby Girl" }, { id: "boy", label: "Baby Boy" }]} />
      <Group k="size" title="Age / Size" values={toOpts(SIZES)} />
      <Group k="color" title="Color" values={toOpts(opts.color)} />
      <Group k="fabric" title="Fabric" values={toOpts(opts.fabric)} />
      <Group k="occasion" title="Occasion" values={toOpts(opts.occasion)} />
      <fieldset className="border-b py-5">
        <legend className="eyebrow mb-3">Price (BDT)</legend>
        <div className="flex items-center gap-2 text-sm">
          <input type="number" placeholder="Min" defaultValue={search.min} onBlur={(e) => set("min", e.target.value ? Number(e.target.value) : undefined)} className="w-24 border bg-transparent px-2 py-1.5" />
          <span>–</span>
          <input type="number" placeholder="Max" defaultValue={search.max} onBlur={(e) => set("max", e.target.value ? Number(e.target.value) : undefined)} className="w-24 border bg-transparent px-2 py-1.5" />
        </div>
      </fieldset>
      <label className="flex items-center gap-2 py-5 text-sm">
        <input type="checkbox" checked={!!search.inStock} onChange={(e) => set("inStock", e.target.checked)} /> In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-10">
        <div className="eyebrow text-muted-foreground">Collection</div>
        <h1 className="text-section mt-2">{search.wishlist ? "Your Wishlist" : search.category ? CATEGORIES.find((c) => c.id === search.category)?.label : "All Little Styles"}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-y py-3">
        <button className="flex items-center gap-2 text-sm lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
        <span className="text-sm text-muted-foreground">{results.length} {results.length === 1 ? "piece" : "pieces"}</span>
        <div className="flex flex-wrap gap-2">
          {active.map(([k, v]) => (
            <button key={k} onClick={() => set(k as keyof Search, undefined)} className="flex items-center gap-1 bg-blush px-2 py-1 text-xs">
              {LABELS[k]}: {String(v)} <X className="h-3 w-3" />
            </button>
          ))}
          {active.length > 0 && <Link to="/shop" className="text-xs underline">Clear all</Link>}
        </div>
        <select aria-label="Sort" value={search.sort ?? "featured"} onChange={(e) => set("sort", e.target.value)} className="ml-auto border bg-transparent px-2 py-1.5 text-sm">
          <option value="featured">Featured</option><option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
          <option value="popular">Popular</option>
        </select>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-3xl">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or two.</p>
              <Link to="/shop" className="eyebrow mt-6 inline-block border-b border-foreground pb-1">Clear filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {results.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              {shown < results.length && (
                <div className="mt-12 text-center">
                  <button onClick={() => setShown((s) => s + 8)} className="eyebrow border border-foreground px-8 py-3 hover:bg-primary hover:text-primary-foreground">Load more</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-background">
          <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
          {filters}
          <button onClick={() => setDrawer(false)} className="eyebrow mb-4 w-full bg-primary py-3 text-primary-foreground">Show {results.length} results</button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
