import { AlertTriangle } from "lucide-react";

export function SetupState() {
  return (
    <div className="mb-4 flex min-h-[40px] items-center justify-between gap-3 rounded-md border border-[var(--color-amber-light)] bg-[var(--color-surface)] px-3 text-[11px] text-[var(--color-text-secondary)]">
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--color-amber)]" />
        <p className="truncate">
          Connect Supabase to turn on sign-in, file uploads, exports, and real project data.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href="https://supabase.com/docs/guides/auth/server-side/nextjs"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[var(--color-blue)] hover:text-[var(--color-text-primary)]"
        >
          Setup guide
        </a>
      </div>
    </div>
  );
}
