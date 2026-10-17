import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, img, SIZES } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import rose from "@/assets/dress-rose.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Little Petal — Luxury Baby Dresses in Bangladesh" },
      { name: "description", content: "Little moments, beautifully dressed. Premium baby dresses, occasionwear and newborn sets delivered across Bangladesh." },
      { property: "og:title", content: "Little Petal — Little Moments. Beautifully Dressed." },
      { property: "og:description", content: "Premium baby fashion for their sweetest days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(productsQuery);
  const newArrivals = data.filter((p) => p.is_new).slice(0, 8);
  const best = data.filter((p) => p.is_bestseller).slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[85vh] max-w-7xl items-center gap-8 px-5 py-16 md:grid-cols-2">
          <div className="relative z-10">
            <div className="eyebrow text-muted-foreground">The Soft Beginnings Collection</div>
            <h1 className="text-hero mt-6">Little Moments.<br /><em>Beautifully</em> Dressed.</h1>
            <p className="mt-6 max-w-md text-muted-foreground">Thoughtfully chosen styles for their sweetest days.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className="eyebrow bg-primary px-8 py-4 text-primary-foreground transition hover:opacity-90">Explore Collection</Link>
              <Link to="/shop" search={{ category: "dresses" }} className="eyebrow border border-foreground px-8 py-4 transition hover:bg-foreground hover:text-background">Shop Baby Dresses</Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-8 rounded-full bg-blush blur-3xl" />
            <img src={rose} alt="Rose Petal Dress floating" width={896} height={1152} className="animate-float relative mx-auto max-h-[70vh] w-auto mix-blend-multiply" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-section mb-10">Shop by Little Moments</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.id }} className="group relative aspect-[3/4] overflow-hidden bg-muted">
              <img src={img(c.image)} alt={c.label} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute bottom-4 left-4 bg-background/85 px-3 py-1 font-display text-xl backdrop-blur">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-section">New Arrivals</h2>
          <Link to="/shop" search={{ sort: "newest" }} className="eyebrow border-b border-foreground pb-1">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {newArrivals.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="bg-sage/60 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-section mb-8">Shop by Age</h2>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((s) => (
              <Link key={s} to="/shop" search={{ size: s, inStock: true }} className="border border-foreground px-5 py-3 text-sm transition hover:bg-foreground hover:text-background">{s}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-section mb-10">Bestsellers</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {best.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </>
  );
}
