"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Could not update the password.");
      return;
    }

    setMessage("Password updated. Redirecting to the workspace...");
    window.setTimeout(() => {
      router.replace("/welcome");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1080px] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
        <ThemeToggle />
      </div>
      <div className="grid w-full gap-4 lg:grid-cols-[1.1fr_420px]">
        <Card className="surface-card relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(29,158,117,0.06),transparent_42%),linear-gradient(225deg,rgba(37,99,235,0.05),transparent_36%)]" />
          <CardContent className="relative flex h-full flex-col justify-between gap-10 p-6 lg:p-8">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Password recovery
              </p>
              <h1 className="max-w-[14ch] text-[34px] font-medium leading-[0.96] tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-[42px]">
                Set a new password.
              </h1>
              <p className="max-w-[60ch] text-[13px] leading-6 text-[var(--color-text-secondary)]">
                This is the one-time handoff for accounts that came from the earlier email-link sign-in flow. After this, you can come back and sign in with email and password normally.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Password sign-in ready", "Works for older magic-link accounts", "Keeps the same workspace access"].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card self-center">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-green-light)] text-[var(--color-green)]">
                {message ? <CheckCircle2 className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </div>
              <div>
                <p className="dense-label">Account access</p>
                <h2 className="mt-1 text-[15px] font-medium text-[var(--color-text-primary)]">Choose a new password</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!ready ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-[12px] text-[var(--color-text-secondary)]">
                Open this page from the reset link in your email so we can verify the recovery session.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                    New password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                    Confirm password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the password"
                    autoComplete="new-password"
                  />
                </div>

                {error ? <p className="text-[11px] text-[var(--color-red)]">{error}</p> : null}
                {message ? <p className="text-[11px] text-[var(--color-green)]">{message}</p> : null}

                <Button type="submit" className="h-8 w-full rounded-md" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            )}

            <Button type="button" variant="secondary" className="h-8 w-full rounded-md" onClick={() => router.replace("/login")}>
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
