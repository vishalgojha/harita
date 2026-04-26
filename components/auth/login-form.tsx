"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "signin" | "signup";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") ? value : "/welcome";
}

function normalizeAuthError(message: string, mode: AuthMode) {
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Check your email and confirm the account before signing in.";
  }

  if (/user already registered/i.test(message)) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (/password should be at least 6 characters/i.test(message)) {
    return "Use a password with at least 6 characters.";
  }

  return mode === "signin" ? "Could not sign in right now." : "Could not create the account right now.";
}

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const nextPath = safeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      setError("Connect Supabase to enable sign in.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (signInError) {
        setError(normalizeAuthError(signInError.message || "", mode));
        return;
      }

      router.replace(nextPath);
      router.refresh();
      return;
    }

    const emailRedirectTo = new URL("/auth/callback", window.location.origin);
    emailRedirectTo.searchParams.set("next", nextPath);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: emailRedirectTo.toString(),
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(normalizeAuthError(signUpError.message || "", mode));
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email to confirm it, then sign in.");
    setMode("signin");
  }

  async function onResetPassword() {
    if (disabled) {
      setError("Connect Supabase to enable password recovery.");
      return;
    }

    if (!email.trim()) {
      setError("Enter your email first so we know where to send the reset link.");
      return;
    }

    setResettingPassword(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", "/reset-password");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo.toString(),
    });

    setResettingPassword(false);

    if (resetError) {
      setError(resetError.message || "Could not send the password reset email.");
      return;
    }

    setMessage("Password reset email sent. Open the link in your email to choose a new password.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
        <Button
          type="button"
          variant={mode === "signin" ? "default" : "ghost"}
          className="h-8 rounded-lg"
          onClick={() => {
            setMode("signin");
            setError("");
            setMessage("");
          }}
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "default" : "ghost"}
          className="h-8 rounded-lg"
          onClick={() => {
            setMode("signup");
            setError("");
            setMessage("");
          }}
        >
          Create account
        </Button>
      </div>

      {authError ? (
        <div className="rounded-2xl border border-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_8%,transparent)] p-4 text-[12px] text-[var(--color-red)]">
          Sign-in could not finish. Try again with your email and password.
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[11px] font-medium text-[var(--color-text-secondary)]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          required
          disabled={disabled || loading}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="consultant@company.com"
          autoComplete={mode === "signin" ? "email" : "username"}
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
          minLength={6}
          disabled={disabled || loading}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={mode === "signin" ? "Enter your password" : "Create a password"}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
      </div>

      <p className="text-[11px] leading-5 text-[var(--color-text-tertiary)]">
        {mode === "signin"
          ? "Use the email and password for your Harita workspace account. If this account was created with the old magic-link flow, reset the password once and then sign in normally."
          : "Create the first account to claim the workspace, then invite the rest of the team."}
      </p>

      {error ? <p className="text-[11px] text-[var(--color-red)]">{error}</p> : null}
      {message ? <p className="text-[11px] text-[var(--color-green)]">{message}</p> : null}

      {mode === "signin" ? (
        <Button
          type="button"
          variant="ghost"
          className="h-auto justify-start rounded-none py-0 text-[11px]"
          disabled={resettingPassword || loading || disabled}
          onClick={() => void onResetPassword()}
        >
          {resettingPassword ? "Sending reset link..." : "Forgot password?"}
        </Button>
      ) : null}

      <Button type="submit" className="h-8 w-full rounded-md" disabled={loading || resettingPassword || disabled}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {disabled ? "Connect Supabase first" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
