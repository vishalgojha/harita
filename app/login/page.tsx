import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1280px] items-center px-4 py-10 sm:px-6 lg:px-8">
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
                IGBC Documentation Workspace
              </p>
              <h1 className="text-[15px] font-medium leading-6 text-[var(--color-text-primary)]">
                Dense review tooling for consultants managing certification evidence all day.
              </h1>
              <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                Track credits, review uploads, resolve remarks, and prepare submission packs without
                running parallel spreadsheets and chat threads.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "47 seeded IGBC credits from the CCIL tracker",
                "Consultant review and owner upload modes",
                "Tracker XLSX, PDF summary, and submission ZIP exports",
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
                : "The live workspace is not connected yet, so sign in opens the seeded demo workspace."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm demoMode={!env.isConfigured} />
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
              Demo mode is for UI review only. Real uploads, approvals, and project records require the
              live database connection to be completed.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
