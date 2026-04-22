import Link from "next/link";
import { Bell, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex min-h-[56px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-green)] text-white">
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <Link href="/dashboard" className="text-[15px] font-medium text-[var(--color-text-primary)]">
              HaritaDocs
            </Link>
            {role ? (
              <Badge className="border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[11px] text-[var(--color-green)]">
                {roleLabels[role]}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-[var(--color-text-primary)]">
              <Bell className="h-3.5 w-3.5" />
              <span className="mono text-[11px]">{notificationCount ?? 0}</span>
            </Link>
            <span className="h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-1">
          <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">{title}</h1>
          <p className="text-[12px] text-[var(--color-text-secondary)]">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
