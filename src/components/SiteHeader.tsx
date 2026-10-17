import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, img } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const NAV = [
  { label: "New Arrivals", search: { sort: "newest" as const } },
  { label: "Baby Girl", search: { gender: "girl" } },
  { label: "Baby Boy", search: { gender: "boy" } },
  { label: "Newborn", search: { category: "newborn" } },
  { label: "Dresses", search: { category: "dresses" } },
  { label: "Occasionwear", search: { category: "occasionwear" } },
];

export function SiteHeader() {
  const { cart, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const count = cart.reduce((s, l) => s + l.qty, 0);

  useEffect(() => {
    setSignedIn(false);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q } });
    setSearchOpen(false); setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="eyebrow bg-primary py-2 text-center text-primary-foreground">{BRAND.announcement}</div>
      <div className="relative border-b bg-background/90 backdrop-blur" onMouseLeave={() => setMega(false)}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <Link to="/" className="font-display text-2xl tracking-wide">{BRAND.name}</Link>
          <nav className="hidden flex-1 items-center gap-6 text-sm lg:flex" onMouseEnter={() => setMega(true)}>
            {NAV.map((n) => (
              <Link key={n.label} to="/shop" search={n.search} className="transition-colors hover:text-muted-foreground">{n.label}</Link>
            ))}
            <Link to="/shop" search={{ sale: true }} className="text-destructive">Sale</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="Search" onClick={() => setSearchOpen((s) => !s)}><Search className="h-5 w-5" /></button>
            <Link to="/" aria-label={signedIn ? "Account" : "Sign in"} className="hidden sm:block"><User className={`h-5 w-5 ${signedIn ? "fill-blush" : ""}`} /></Link>
            <Link to="/shop" search={{ wishlist: true }} aria-label="Wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-blush px-1 text-[10px]">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="relative" aria-label={`Bag, ${count} items`}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <form onSubmit={submit} className="mx-auto flex max-w-7xl items-center gap-3 border-t px-5 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dresses, rompers, newborn…" className="flex-1 bg-transparent py-1 outline-none" />
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X className="h-4 w-4" /></button>
          </form>
        )}
        {mega && (
          <div className="absolute inset-x-0 top-full hidden border-b bg-background shadow-soft lg:block animate-in fade-in slide-in-from-top-2">
            <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-5 py-8">
              {CATEGORIES.map((c) => (
                <Link key={c.id} to="/shop" search={{ category: c.id }} onClick={() => setMega(false)} className="group">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={img(c.image)} alt={c.label} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-2 font-display text-xl">{c.label}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 bg-background">
          <SheetTitle className="font-display text-2xl">{BRAND.name}</SheetTitle>
          <form onSubmit={submit} className="mt-6 flex items-center gap-2 border-b pb-2">
            <Search className="h-4 w-4" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none" />
          </form>
          <nav className="mt-6 flex flex-col">
            {NAV.map((n) => (
              <Link key={n.label} to="/shop" search={n.search} onClick={() => setOpen(false)} className="border-b py-4 font-display text-xl">{n.label}</Link>
            ))}
            <Link to="/shop" search={{ sale: true }} onClick={() => setOpen(false)} className="border-b py-4 font-display text-xl text-destructive">Sale</Link>
            <Link to="/" onClick={() => setOpen(false)} className="py-4 text-sm">{signedIn ? "My account" : "Sign in / Register"}</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
