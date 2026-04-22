"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demoMode) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="consultant@company.com"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input
          type="password"
          required={!demoMode}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={demoMode ? "Skipped in demo mode" : "••••••••"}
        />
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {demoMode ? "Open demo workspace" : "Sign in"}
      </Button>
    </form>
  );
}
