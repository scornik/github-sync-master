import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import { useIsAdmin, useSession } from "@/lib/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Sign in — ${BRAND.name}` },
      { name: "description", content: `Sign in or create your ${BRAND.name} account to save favourites and track orders.` },
      { property: "og:title", content: `Sign in — ${BRAND.name}` },
      { property: "og:description", content: `Your ${BRAND.name} account.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const session = useSession();
  const isAdmin = useIsAdmin(session?.user.id);
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="eyebrow text-muted-foreground">My account</p>
        <h1 className="mt-3 font-display text-4xl">Hello again</h1>
        <p className="mt-3 text-sm text-muted-foreground">{session.user.email}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild><Link to="/shop">Continue shopping</Link></Button>
          {isAdmin && <p className="text-xs text-muted-foreground">You have admin access.</p>}
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </main>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Account created — you are signed in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="eyebrow text-center text-muted-foreground">{BRAND.name}</p>
      <h1 className="mt-3 text-center font-display text-4xl">
        {mode === "in" ? "Welcome back" : mode === "up" ? "Create account" : "Reset password"}
      </h1>
      {mode !== "forgot" && (
        <div className="mt-8 flex flex-col gap-3">
          <Button variant="outline" onClick={() => social("google")}>Continue with Google</Button>
          <button type="button" className="lovable-auth-button" onClick={() => social("lovable")}>Continue with Lovable</button>
          <div className="my-2 text-center text-xs text-muted-foreground">or with email</div>
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {mode !== "forgot" && (
          <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        )}
        <Button type="submit" disabled={busy}>{mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}</Button>
      </form>
      <div className="mt-6 flex justify-between text-sm text-muted-foreground">
        <button onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Create account" : "Have an account? Sign in"}</button>
        {mode === "in" && <button onClick={() => setMode("forgot")}>Forgot password?</button>}
      </div>
    </main>
  );
}
