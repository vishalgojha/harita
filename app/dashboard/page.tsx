import Link from "next/link";
import { createProjectAction } from "@/app/actions";
import { SetupState } from "@/components/setup-state";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      title="Project dashboard"
      description={
        env.isConfigured
          ? `Signed in as ${user?.email ?? "unknown user"}. Projects, uploads, and submission exports are ready.`
          : "Demo mode is active. The seeded project list is visible until the live workspace connection is completed."
      }
      role="consultant"
      notificationCount={projects.reduce((sum, project) => sum + project.openRemarks, 0)}
    >
      {!env.isConfigured ? <SetupState /> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Projects", value: projects.length, meta: "Active workspaces" },
          { label: "Files uploaded", value: totals.uploadedDocs, meta: "Across all projects" },
          { label: "Ready items", value: totals.mandatoryCreditsMet, meta: "Useful for submission prep" },
          { label: "Needs attention", value: totals.openRemarks, meta: "Notes waiting for review" },
        ].map((item) => (
          <div key={item.label} className="surface-card p-4">
            <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
              {item.label}
            </p>
            <p className="mono mt-2 text-[28px] font-medium leading-none text-[var(--color-text-primary)]">
              {item.value}
            </p>
            <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">{item.meta}</p>
          </div>
        ))}
      </section>

      <section className="surface-card mt-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="dense-label">How to use this</p>
            <h2 className="mt-2 text-[13px] font-medium text-[var(--color-text-primary)]">
              Start with the project that has the most open notes.
            </h2>
            <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
              Open the checklist, add or review files, resolve notes, and then generate the submission pack when the project is ready.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
            If you are supporting multiple projects, this dashboard shows the ones most likely to need action first.
          </div>
        </div>
      </section>

      <section className="surface-card mt-4 p-4">
        <form action={createProjectAction} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
          <Input name="name" placeholder="New project name" required />
          <select
            name="target_rating"
            className="h-[34px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-strong)]"
            defaultValue="Gold"
          >
            {["Certified", "Silver", "Gold", "Platinum"].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-[34px] rounded-md px-4">
            Create project
          </Button>
        </form>
      </section>

      <section className="mt-4 grid gap-3">
        {projects.map((project) => (
          <article key={project.id} className="surface-card flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
                  {project.name}
                </h2>
                <Badge className="border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[11px] text-[var(--color-green)]">
                  {project.target_rating}
                </Badge>
                <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-secondary)]">
                  {roleLabels[project.role]}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{project.certification_type}</p>
              <p className="mt-3 text-[12px] text-[var(--color-text-secondary)]">
                {project.totalCredits} checklist items - {project.uploadedDocs} files - {project.mandatoryCreditsMet} ready - {project.openRemarks} notes
              </p>
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
                <Progress value={project.overallCompletion} />
                <span className="mono text-[12px] text-[var(--color-text-secondary)]">
                  {pct(project.overallCompletion)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:justify-end">
              <Button asChild className="rounded-md px-3 text-[12px]">
                <Link href={`/projects/${project.id}`}>Open checklist</Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-md px-3 text-[12px]">
                <Link href={`/projects/${project.id}/submission`}>Prepare submission</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </Shell>
  );
}
