"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const nextPath = searchParams.get("next") ?? "/welcome";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      setError("Connect Supabase to enable magic-link sign in.");
      return;
    }

    setLoading(true);
    setError("");
    setSent(false);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo.toString(),
      },
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Could not send the magic link.");
      return;
    }

    setSent(true);
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
      <p className="text-[11px] leading-5 text-[var(--color-text-tertiary)]">
        We will send a magic link to this email. The first signed-in user can create the workspace and become its owner.
      </p>
      {error ? <p className="text-[11px] text-[var(--color-red)]">{error}</p> : null}
      {sent ? <p className="text-[11px] text-[var(--color-green)]">Check your email for the magic link.</p> : null}
      <Button type="submit" className="h-8 w-full rounded-md" disabled={loading || disabled}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {disabled ? "Connect Supabase first" : "Send magic link"}
      </Button>
    </form>
  );
}
