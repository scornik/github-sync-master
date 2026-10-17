import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Set a new password — ${BRAND.name}` },
      { name: "description", content: "Choose a new password for your account." },
      { property: "og:title", content: `Set a new password — ${BRAND.name}` },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/auth" });
  };
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-center font-display text-4xl">New password</h1>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit">Save password</Button>
      </form>
    </main>
  );
}
