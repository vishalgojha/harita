import Link from "next/link";
import { Bell, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { roleLabels } from "@/lib/constants";
import type { MemberRole } from "@/lib/types";

export function Shell({
  title,
  description,
  role,
  notificationCount,
  children,
}: {
  title: string;
  description: string;
  role?: MemberRole;
  notificationCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-green)] text-white shadow-sm shadow-[rgba(29,158,117,0.2)]">
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <Link href="/dashboard" className="block text-[15px] font-medium leading-none text-[var(--color-text-primary)]">
                HaritaDocs
              </Link>
              <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Guided documentation workspace
              </p>
            </div>
            {role ? (
              <Badge className="hidden border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[11px] text-[var(--color-green)] sm:inline-flex">
                {roleLabels[role]}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[11px] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] sm:inline-flex"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="mono">{notificationCount ?? 0} open notes</span>
            </Link>
            <ThemeToggle />
            <span className="h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="surface-card overflow-hidden">
          <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[900px]">
              <p className="dense-label">Workspace</p>
              <h1 className="mt-2 text-[22px] font-medium leading-tight text-[var(--color-text-primary)] sm:text-[26px]">
                {title}
              </h1>
              <p className="mt-2 max-w-[72ch] text-[13px] leading-6 text-[var(--color-text-secondary)]">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
              {role ? (
                <span className="rounded-full border border-[var(--color-green-light)] bg-[var(--color-green-light)] px-3 py-1.5 font-medium text-[var(--color-green)]">
                  {roleLabels[role]}
                </span>
              ) : null}
              {typeof notificationCount === "number" ? (
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 font-medium text-[var(--color-text-secondary)]">
                  {notificationCount} open note{notificationCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}
