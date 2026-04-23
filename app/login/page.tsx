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
        <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardContent className="flex h-full flex-col justify-between gap-10 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-green)] text-white">
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <span className="text-[15px] font-medium text-[var(--color-text-primary)]">HaritaDocs</span>
            </div>

            <div className="max-w-[560px] space-y-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Guided project review workspace
              </p>
              <h1 className="text-[15px] font-medium leading-6 text-[var(--color-text-primary)]">
                A simpler way for consultants and project teams to review files, track progress, and finish submissions.
              </h1>
              <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                See what needs attention, upload supporting files in one place, and move projects forward without juggling spreadsheets and chat threads.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Projects grouped by what still needs attention",
                "One place for notes, uploads, and approvals",
                "Export a final submission pack when the work is ready",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="self-center">
          <CardHeader>
            <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">Sign in</h2>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              {env.isConfigured
                ? "Sign in to open your live project workspace."
                : "Connect Supabase to enable sign in and project data."
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm disabled={!env.isConfigured} />
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
              Real uploads, approvals, and project records require a live Supabase connection.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
