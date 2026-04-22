import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileCheck2, MessageSquareMore, Plus } from "lucide-react";
import { createProjectAction } from "@/app/actions";
import { SetupState } from "@/components/setup-state";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { env } from "@/lib/env";
import { getCurrentUser, getDashboardProjects } from "@/lib/data";
import { roleLabels } from "@/lib/constants";
import { pct } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, projects] = await Promise.all([getCurrentUser(), getDashboardProjects()]);

  const totals = {
    totalCredits: projects.reduce((sum, project) => sum + project.totalCredits, 0),
    uploadedDocs: projects.reduce((sum, project) => sum + project.uploadedDocs, 0),
    mandatoryCreditsMet: projects.reduce((sum, project) => sum + project.mandatoryCreditsMet, 0),
    openRemarks: projects.reduce((sum, project) => sum + project.openRemarks, 0),
  };

  return (
    <Shell
      title="Consultant Dashboard"
      description={
        env.isConfigured
          ? `Signed in as ${user?.email ?? "unknown user"}. All project trackers, review actions and exports are live.`
          : "Demo mode is active. The UI is using the seeded CCIL-style catalog until Supabase is configured."
      }
      role="consultant"
      notificationCount={projects.reduce((sum, project) => sum + project.openRemarks, 0)}
    >
      {!env.isConfigured ? <SetupState /> : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tracked credits", value: totals.totalCredits, icon: BriefcaseBusiness },
            { label: "Docs uploaded", value: totals.uploadedDocs, icon: FileCheck2 },
            { label: "Mandatory met", value: totals.mandatoryCreditsMet, icon: FileCheck2 },
            { label: "Open remarks", value: totals.openRemarks, icon: MessageSquareMore },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Create a new project</h3>
                <p className="text-sm text-slate-600">
                  New projects automatically seed the full IGBC Green Interiors v2 credit library.
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={createProjectAction} className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <Input name="name" placeholder="Project name" required />
              <select
                name="target_rating"
                className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                defaultValue="Gold"
              >
                {["Certified", "Silver", "Gold", "Platinum"].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
              <Button type="submit">Create project</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_240px] lg:items-center">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <Badge className="bg-primary/10 text-primary">{project.target_rating}</Badge>
                  <Badge className="bg-slate-100 text-slate-700">{roleLabels[project.role]}</Badge>
                </div>
                <p className="text-sm text-slate-600">{project.certification_type}</p>
                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                  <div>Total credits: {project.totalCredits}</div>
                  <div>Docs uploaded: {project.uploadedDocs}</div>
                  <div>Mandatory met: {project.mandatoryCreditsMet}</div>
                  <div>Open remarks: {project.openRemarks}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall completion</span>
                    <span className="font-semibold text-slate-800">{pct(project.overallCompletion)}</span>
                  </div>
                  <Progress value={project.overallCompletion} />
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <Button asChild>
                  <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-2">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={`/projects/${project.id}/submission`}>Submission pack</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
