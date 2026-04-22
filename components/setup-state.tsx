import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function SetupState() {
  return (
    <div className="mb-4 flex min-h-[40px] items-center justify-between gap-3 rounded-md border border-[var(--color-amber-light)] bg-[var(--color-surface)] px-3 text-[11px] text-[var(--color-text-secondary)]">
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--color-amber)]" />
        <p className="truncate">
          Demo mode is active. Connect the live project database to enable login, file uploads, exports,
          and real project data.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link href="/dashboard" className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-green)]">
          Open demo
        </Link>
        <Link
          href="https://supabase.com/docs/guides/auth/server-side/nextjs"
          target="_blank"
          className="font-medium text-[var(--color-blue)] hover:text-[var(--color-text-primary)]"
        >
          Setup guide
        </Link>
      </div>
    </div>
  );
}
