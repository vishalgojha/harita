import Link from "next/link";
import { Bell, Leaf, LogOut, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto min-h-screen max-w-[1560px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="glass rounded-[1.75rem] border border-white/80 shadow-panel">
        <header className="flex flex-col gap-4 border-b border-border/80 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="text-lg font-extrabold tracking-tight">
                  HaritaDocs
                </Link>
                {role ? (
                  <Badge className="bg-primary/10 text-primary">{roleLabels[role]}</Badge>
                ) : null}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">
              <Bell className="mr-1 h-3.5 w-3.5" />
              {notificationCount ?? 0} alerts
            </Badge>
            <Button variant="ghost" className="gap-2" asChild>
              <Link href="/dashboard">
                <Settings2 className="h-4 w-4" />
                Workspace
              </Link>
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="secondary" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <main className="p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
