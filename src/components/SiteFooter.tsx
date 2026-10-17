import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  const cols = [
    ["Shop", "New Arrivals", "Dresses", "Occasionwear", "Newborn"],
    ["Help", "Shipping", "Returns", "Size Guide", "Track Order"],
    ["About", "Our Story", "Contact", "Privacy", "Terms"],
  ];
  return (
    <footer className="mt-24 border-t bg-blush/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-3xl">{BRAND.name}</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Thoughtfully chosen styles for their sweetest days. {BRAND.city}.</p>
          <form className="mt-6 flex max-w-sm border-b border-foreground" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" className="flex-1 bg-transparent py-2 text-sm outline-none" />
            <button className="eyebrow">Join</button>
          </form>
        </div>
        {cols.map(([h, ...items]) => (
          <div key={h}>
            <div className="eyebrow mb-4">{h}</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {items.map((i) => <li key={i}><Link to="/shop" className="hover:text-foreground">{i}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t px-5 py-6 text-xs text-muted-foreground">
        <span>© 2026 {BRAND.name}. Instagram · Facebook · TikTok</span>
        <span>Demo crafted by Hakeemify</span>
      </div>
    </footer>
  );
}
