import { Suspense } from "react";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { env } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1280px] items-start px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:px-8">
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
        <ThemeToggle />
      </div>
      <div className="grid w-full gap-4 lg:grid-cols-[1.1fr_420px]">
        <Card className="surface-card relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(29,158,117,0.06),transparent_42%),linear-gradient(225deg,rgba(37,99,235,0.05),transparent_36%)]" />
          <CardContent className="relative flex h-full flex-col justify-between gap-10 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-green)] text-white shadow-sm shadow-[rgba(29,158,117,0.2)]">
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="block text-[15px] font-medium text-[var(--color-text-primary)]">HaritaDocs</span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  Consultant documentation workspace
                </span>
              </div>
            </div>

            <div className="max-w-[560px] space-y-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Guided project review workspace
              </p>
              <h1 className="max-w-[14ch] text-[34px] font-medium leading-[0.96] tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-[42px]">
                Review files without losing the thread.
              </h1>
              <p className="max-w-[60ch] text-[13px] leading-6 text-[var(--color-text-secondary)]">
                See what needs attention, upload supporting files in one place, and move projects forward without juggling spreadsheets, chat threads, or disconnected review notes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Projects grouped by what still needs attention",
                "One place for notes, uploads, and approvals",
                "Export a final submission pack when the work is ready",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card self-center">
          <CardHeader>
            <p className="dense-label">Workspace access</p>
            <h2 className="mt-2 text-[15px] font-medium text-[var(--color-text-primary)]">Sign in</h2>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              {env.isConfigured
                ? "Get a magic link to open your live project workspace."
                : "Connect Supabase to enable sign in and project data."
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={<div className="h-[120px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]" />}>
              <LoginForm disabled={!env.isConfigured} />
            </Suspense>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
              Real uploads, approvals, and project records require a live Supabase connection.
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-[var(--color-text-tertiary)]">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center">
                Magic link
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center">
                First owner
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center">
                Invite only
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
