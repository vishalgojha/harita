import Link from "next/link";
import { redirect } from "next/navigation";
import { createProjectAction } from "@/app/actions";
import { AiGuidePanel } from "@/components/assistant/ai-guide-panel";
import { GuidedTour } from "@/components/guided-tour";
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
  if (projects.length === 0) {
    redirect("/welcome");
  }
  const hasProjects = projects.length > 0;

  const totals = {
    totalCredits: projects.reduce((sum, project) => sum + project.totalCredits, 0),
    uploadedDocs: projects.reduce((sum, project) => sum + project.uploadedDocs, 0),
    mandatoryCreditsMet: projects.reduce((sum, project) => sum + project.mandatoryCreditsMet, 0),
    openRemarks: projects.reduce((sum, project) => sum + project.openRemarks, 0),
  };
  const overallCompletion = hasProjects
    ? projects.reduce((sum, project) => sum + project.overallCompletion, 0) / projects.length
    : 0;
  const prioritizedProjects = [...projects].sort(
    (left, right) => right.openRemarks - left.openRemarks || left.overallCompletion - right.overallCompletion,
  );
  const focusProject = prioritizedProjects[0];
  const dashboardContext = {
    surface: "dashboard" as const,
    title: "Dashboard prioritization",
    currentItem: focusProject?.name,
    summary:
      projects.length === 0
        ? "No projects are listed yet. The assistant should help the user create the first workspace and explain the setup order."
        : `The dashboard contains ${projects.length} project(s), ${totals.openRemarks} open remark(s), and ${totals.mandatoryCreditsMet} mandatory items already complete.`,
    facts: [
      `Live connection: ${env.isConfigured ? "enabled" : "not configured yet"}.`,
      focusProject
        ? `Top priority project: ${focusProject.name} with ${focusProject.openRemarks} open remark(s) and ${focusProject.mandatoryCreditsMet}/${focusProject.totalCredits} checklist items complete.`
        : "No project has been created yet.",
      `Total uploaded files: ${totals.uploadedDocs}.`,
      `Ready items across projects: ${totals.mandatoryCreditsMet}.`,
    ],
    nextSteps: focusProject
      ? [
          `Start with ${focusProject.name} because it has the most open remarks.`,
          "Open the project checklist, review the blocked or incomplete items, and clear the notes first.",
          "When the must-complete items are finished, generate the submission pack.",
        ]
      : [
          "Create the first project so the workspace has an item to review.",
          "Use the assistant to decide which checklist items to add first.",
          "Connect Supabase when you want real sign-in, uploads, and persistence.",
        ],
  };
  const tourSteps = [
    {
      selector: "#dashboard-focus",
      title: "Start with the highest-risk project",
      body: "This card shows the project most likely to need action first, so you do not have to scan the whole workspace blindly.",
    },
    {
      selector: "#dashboard-create-project",
      title: "Create a new workspace",
      body: "Use this form when you need to spin up another project. The first signed-in user becomes the owner automatically.",
    },
    {
      selector: "#dashboard-projects",
      title: "Open the active workspaces",
      body: "This list keeps every project visible with progress, docs, and open notes at a glance.",
    },
    {
      selector: "#dashboard-ai-guide",
      title: "Ask for the next step",
      body: "The assistant can explain what to do first if the list feels crowded or you need a quick prioritization pass.",
    },
  ];

  return (
    <Shell
      title="Project dashboard"
      description={
        env.isConfigured
          ? `Signed in as ${user?.email ?? "unknown user"}. Projects, uploads, and submission exports are ready.`
          : "Connect Supabase to access the live workspace."
      }
      role="consultant"
      notificationCount={projects.reduce((sum, project) => sum + project.openRemarks, 0)}
    >
      {!env.isConfigured ? <SetupState /> : null}
      <GuidedTour storageKey="harita:guided-tour:dashboard" steps={tourSteps} startOnMount label="Show tour" />

      <section id="dashboard-focus" className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card overflow-hidden p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <p className="dense-label">Workspace pulse</p>
              <h2 className="mt-2 text-[20px] font-medium leading-tight text-[var(--color-text-primary)]">
                Keep the highest-risk items moving first.
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
                The dashboard groups current work by urgency, so you can see what needs attention, what is already ready, and where the next submission block is likely to be.
              </p>
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-2">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Average progress</p>
                <p className="mono mt-2 text-[24px] font-medium text-[var(--color-text-primary)]">{pct(overallCompletion)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Priority item</p>
                <p className="mt-2 truncate text-[14px] font-medium text-[var(--color-text-primary)]">
                  {focusProject?.name ?? "No project yet"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              {
                label: "Open remarks",
                value: totals.openRemarks,
                help: "Items waiting for review",
              },
              {
                label: "Mandatory ready",
                value: totals.mandatoryCreditsMet,
                help: "Useful for export readiness",
              },
              {
                label: "Uploaded files",
                value: totals.uploadedDocs,
                help: "Across every workspace",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">{item.label}</p>
                <p className="mono mt-2 text-[22px] font-medium text-[var(--color-text-primary)]">{item.value}</p>
                <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{item.help}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="dense-label">Focus now</p>
          {focusProject ? (
            <div className="mt-3 space-y-3">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">{focusProject.name}</h3>
                <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                  {focusProject.totalCredits} checklist items, {focusProject.openRemarks} open note
                  {focusProject.openRemarks === 1 ? "" : "s"}, and {focusProject.mandatoryCreditsMet} mandatory items already complete.
                </p>
              </div>
              <Progress value={focusProject.overallCompletion} />
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary)]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Role</p>
                  <p className="mt-1 font-medium text-[var(--color-text-primary)]">{roleLabels[focusProject.role]}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Completion</p>
                  <p className="mono mt-1 font-medium text-[var(--color-text-primary)]">{pct(focusProject.overallCompletion)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="h-8 rounded-full px-4 text-[12px]">
                  <Link href={`/projects/${focusProject.id}`}>Open priority project</Link>
                </Button>
                <Button asChild variant="secondary" className="h-8 rounded-full px-4 text-[12px]">
                  <Link href={`/projects/${focusProject.id}/submission`}>Prep submission</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-[12px] text-[var(--color-text-secondary)]">
              Create your first project to start tracking credits, uploads, and submission readiness.
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Projects", value: projects.length, meta: "Active workspaces" },
          { label: "Files uploaded", value: totals.uploadedDocs, meta: "Across all projects" },
          { label: "Ready items", value: totals.mandatoryCreditsMet, meta: "Useful for submission prep" },
          { label: "Needs attention", value: totals.openRemarks, meta: "Notes waiting for review" },
        ].map((item) => (
          <div key={item.label} className="surface-card p-4">
            <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">{item.label}</p>
            <p className="mono mt-2 text-[28px] font-medium leading-none text-[var(--color-text-primary)]">{item.value}</p>
            <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">{item.meta}</p>
          </div>
        ))}
      </section>

      <section id="dashboard-create-project" className="surface-card mt-4 p-4">
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
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[11px] text-[var(--color-text-secondary)]">
            If you are supporting multiple projects, this dashboard shows the ones most likely to need action first.
          </div>
        </div>
      </section>

      <div id="dashboard-ai-guide" className="mt-4">
        <AiGuidePanel
          context={dashboardContext}
          enabled={env.aiReady}
          storageKey="assistant:dashboard"
          title="AI guide for next steps"
          description="Ask what should be handled first across all projects, or ask the assistant to explain the next action in plain language."
          prompts={[
            "Which project should I work on first?",
            "What is blocking submission readiness?",
            "How should I prioritize the open notes?",
          ]}
          suggestedActions={
            focusProject
              ? [
                  {
                    label: `Open ${focusProject.name}`,
                    href: `/projects/${focusProject.id}`,
                    description: "Jump into the highest-priority workspace the assistant identified.",
                  },
                  {
                    label: "See submission prep",
                    href: `/projects/${focusProject.id}/submission`,
                    description: "Move directly to the submission checkpoint for the current priority project.",
                  },
                ]
              : []
          }
        />
      </div>

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

      <section id="dashboard-projects" className="mt-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="dense-label">Projects</p>
              <h2 className="mt-2 text-[15px] font-medium text-[var(--color-text-primary)]">Current workspaces</h2>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {hasProjects ? "Open the workspace with the most blockers first." : "No workspaces yet."}
            </p>
          </div>

          {hasProjects ? (
            <div className="mt-4 grid gap-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 hover:border-[var(--color-border-strong)]"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">{project.name}</h3>
                        <Badge className="border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[11px] text-[var(--color-green)]">
                          {project.target_rating}
                        </Badge>
                        <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-secondary)]">
                          {roleLabels[project.role]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{project.certification_type}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--color-text-secondary)]">
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1">
                          {project.totalCredits} items
                        </span>
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1">
                          {project.uploadedDocs} files
                        </span>
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1">
                          {project.mandatoryCreditsMet} ready
                        </span>
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1">
                          {project.openRemarks} notes
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
                        <Progress value={project.overallCompletion} />
                        <span className="mono text-[12px] text-[var(--color-text-secondary)]">
                          {pct(project.overallCompletion)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button asChild className="h-8 rounded-full px-4 text-[12px]">
                        <Link href={`/projects/${project.id}`}>Open checklist</Link>
                      </Button>
                      <Button asChild variant="secondary" className="h-8 rounded-full px-4 text-[12px]">
                        <Link href={`/projects/${project.id}/submission`}>Prepare submission</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-6">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">No projects yet</p>
              <p className="mt-2 max-w-[64ch] text-[12px] leading-6 text-[var(--color-text-secondary)]">
                Create the first workspace above, then use the checklist and uploads to start gathering the documentation your team needs.
              </p>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
