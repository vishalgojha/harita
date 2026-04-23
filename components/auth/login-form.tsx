"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      setError("Connect Supabase to enable sign in.");
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
        <label htmlFor="email" className="text-[11px] font-medium text-[var(--color-text-secondary)]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          required
          disabled={disabled}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="consultant@company.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[11px] font-medium text-[var(--color-text-secondary)]">
          Password
        </label>
        <Input
          id="password"
          type="password"
          required
          disabled={disabled}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="........"
        />
      </div>
      {error ? <p className="text-[11px] text-[var(--color-red)]">{error}</p> : null}
      <Button type="submit" className="h-8 w-full rounded-md" disabled={loading || disabled}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {disabled ? "Connect Supabase first" : "Sign in"}
      </Button>
    </form>
  );
}
