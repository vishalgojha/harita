import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden bg-[#15352d] text-white">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">HaritaDocs</p>
              <h1 className="max-w-lg text-4xl font-extrabold tracking-tight sm:text-5xl">
                IGBC documentation operations for real consultant workflows.
              </h1>
              <p className="max-w-xl text-base text-white/75">
                Track every credit, validate every document type, and export a clean submission pack
                without maintaining parallel trackers across email and WhatsApp.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/6 p-4">47 seeded IGBC credits from the CCIL tracker</div>
              <div className="rounded-2xl bg-white/6 p-4">Consultant review and owner upload modes</div>
              <div className="rounded-2xl bg-white/6 p-4">Tracker XLSX, PDF summary, and submission ZIP exports</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass self-center">
          <CardHeader>
            <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">
              {env.isConfigured
                ? "Use Supabase email/password auth to enter your project workspace."
                : "Supabase is not configured yet, so the sign-in button opens the seeded demo workspace."}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <LoginForm demoMode={!env.isConfigured} />
            <div className="rounded-2xl bg-muted p-4 text-sm text-slate-600">
              Demo mode is useful for UI review only. Real uploads, auth, storage, and approvals require
              Supabase env configuration and the migration in this repo.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
