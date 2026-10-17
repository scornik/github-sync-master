import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Current auth session (null until hydrated / when signed out). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!userId) return setIsAdmin(false);
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [userId]);
  return isAdmin;
}
