import Link from "next/link";
import { AlertTriangle, DatabaseZap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SetupState() {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <DatabaseZap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Supabase setup required</h2>
          <p className="text-sm text-slate-600">
            HaritaDocs can render a demo workspace without env vars, but auth, storage, exports and
            multi-tenant data require a connected Supabase project.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally
            `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, then apply the migration in
            `supabase/migrations/`.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild={false}>
            <Link href="/dashboard">Open demo workspace</Link>
          </Button>
          <Button variant="secondary" asChild={false}>
            <Link href="https://supabase.com/docs/guides/auth/server-side/nextjs" target="_blank">
              Supabase SSR guide
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
