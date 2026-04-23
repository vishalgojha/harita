import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, Download, FileWarning, ShieldCheck } from "lucide-react";
import { addRemarkAction, setCreditStateAction, setDocumentStatusAction } from "@/app/actions";
import { AiGuidePanel } from "@/components/assistant/ai-guide-panel";
import { UploadDocumentForm } from "@/components/project/upload-document-form";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categoryMeta, creditStatuses } from "@/lib/constants";
import { env } from "@/lib/env";
import { creditStats, getProjectWorkspace } from "@/lib/data";
import { pct } from "@/lib/utils";

type PageProps = {
  params: { id: string };
  searchParams?: {
    category?: string;
    status?: string;
    credit?: string;
  };
};

const docAbbreviations: Record<string, string> = {
  Narrative: "NAR",
  "Tech Spec": "SPEC",
  "Certificate/Declaration": "CERT",
  Drawing: "DWG",
  "Calculation & Tables": "CALC",
  Invoice: "INV",
  "Pic/Video": "PHOTO",
};

function queryString(params: Record<string, string | undefined>) {
  const nextParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      nextParams.set(key, value);
    }
  });
  const stringValue = nextParams.toString();
  return stringValue ? `?${stringValue}` : "";
}

function mandatoryCode(creditCode: string, mandatory: boolean) {
  if (!mandatory || creditCode.includes("MR")) {
    return creditCode;
  }
  const parts = creditCode.split(" ");
  return `${parts[0]} MR ${parts.slice(1).join(" ")}`.trim();
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const workspace = await getProjectWorkspace(params.id);
  const stats = creditStats(workspace.credits);
  const selectedCredit =
    workspace.credits.find((credit) => credit.id === searchParams?.credit) ?? workspace.credits[0];
  const filteredCredits = workspace.credits.filter((credit) => {
    const categoryOk = searchParams?.category ? credit.category === searchParams.category : true;
    const statusOk = searchParams?.status ? credit.status === searchParams.status : true;
    return categoryOk && statusOk;
  });
  const hasFilteredCredits = filteredCredits.length > 0;
  const mandatoryCredits = workspace.credits.filter((credit) => credit.is_mandatory);
  const mandatoryComplete = mandatoryCredits.filter((credit) => credit.status === "complete").length;
  const completionPct = mandatoryCredits.length ? Math.round((mandatoryComplete / mandatoryCredits.length) * 100) : 0;
  const assistantContext = {
    surface: "project" as const,
    title: workspace.project.name,
    currentItem: selectedCredit.credit_name,
    summary: `Project ${workspace.project.name} is on ${workspace.project.target_rating} target rating with ${mandatoryComplete}/${mandatoryCredits.length} mandatory items complete.`,
    facts: [
      `Selected item: ${selectedCredit.credit_name} (${selectedCredit.status.replace("_", " ")}).`,
      `Files needed for this item: ${selectedCredit.documents_required.length}.`,
      `Uploaded files on this item: ${selectedCredit.documents.length}.`,
      `Notes on this item: ${selectedCredit.remarks.length}.`,
      selectedCredit.blocked_by ? `Blocked by: ${selectedCredit.blocked_by}.` : "This item is not currently blocked.",
    ],
    nextSteps: [
      selectedCredit.documents_required.some((doc) => doc.required)
        ? "Review the required files first and upload anything still missing."
        : "No required files are listed, so focus on notes and status updates first.",
      selectedCredit.status === "blocked"
        ? `Resolve the blocker with ${selectedCredit.blocked_by ?? "the relevant owner"} before moving the item forward.`
        : "If the item is in progress, finish the supporting files and then mark it complete.",
      mandatoryComplete < mandatoryCredits.length
        ? "Keep working through the mandatory items before preparing the submission pack."
        : "The mandatory checklist is complete, so move toward export and submission packaging.",
    ],
  };

  return (
    <Shell
      title={workspace.project.name}
      description={`${workspace.project.certification_type} - Target ${workspace.project.target_rating} - Track uploads, notes, and progress in one view.`}
      role={workspace.userRole}
      notificationCount={workspace.notifications.filter((item) => !item.read_at).length}
    >
      <section className="surface-card overflow-hidden p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_280px] lg:items-end">
          <div className="max-w-[900px]">
            <p className="dense-label">Project workspace</p>
            <h2 className="mt-2 text-[20px] font-medium leading-tight text-[var(--color-text-primary)]">
              {workspace.project.name}
            </h2>
            <p className="mt-2 max-w-[70ch] text-[13px] leading-6 text-[var(--color-text-secondary)]">
              Review credits, upload evidence, and resolve notes from one screen. The selected item stays in focus while the rest of the checklist stays easy to scan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[11px] text-[var(--color-green)]">
                {workspace.project.target_rating}
              </Badge>
              <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-secondary)]">
                {workspace.project.certification_type}
              </Badge>
              <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-secondary)]">
                {workspace.credits.length} items
              </Badge>
              <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-secondary)]">
                {mandatoryCredits.length} mandatory
              </Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Mandatory progress</p>
                <p className="mono mt-2 text-[26px] font-medium text-[var(--color-text-primary)]">{completionPct}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Selected item</p>
                <p className="mt-2 max-w-[10rem] truncate text-[14px] font-medium text-[var(--color-text-primary)]">
                  {selectedCredit.credit_name}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Open notes</p>
                <p className="mono mt-1 text-[18px] font-medium text-[var(--color-text-primary)]">
                  {workspace.credits.reduce((sum, credit) => sum + credit.remarks.length, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Files uploaded</p>
                <p className="mono mt-1 text-[18px] font-medium text-[var(--color-text-primary)]">
                  {workspace.credits.reduce((sum, credit) => sum + credit.documents.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="rounded-xl border-r border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-4">
          <div className="border-b border-[var(--color-border)] px-2 pb-3">
            <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
              {workspace.project.name}
            </p>
            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{workspace.project.target_rating}</p>
          </div>

          <div className="mt-3">
            <p className="dense-label px-2">Browse by topic</p>
            <nav className="mt-2 space-y-1">
              <Link
                href={`/projects/${params.id}${queryString({
                  status: searchParams?.status,
                  credit: searchParams?.credit,
                })}`}
                className={`flex items-center justify-between rounded-md px-[14px] py-[7px] text-[12px] ${
                  !searchParams?.category
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] ring-1 ring-inset ring-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-text-tertiary)]" />
                  All items
                </span>
                <span className="mono rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px]">
                  {workspace.credits.length}
                </span>
              </Link>
              {stats.categories.map((item) => {
                const meta = categoryMeta[item.key as keyof typeof categoryMeta];
                const active = searchParams?.category === item.key;
                return (
                  <Link
                    key={item.key}
                    href={`/projects/${params.id}${queryString({
                      category: item.key,
                      status: searchParams?.status,
                      credit: searchParams?.credit,
                    })}`}
                    className={`flex items-center justify-between rounded-md border-r-2 px-[14px] py-[7px] text-[12px] ${
                      active
                        ? "border-[var(--color-green)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-[7px] w-[7px] rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <span className="mono rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px]">
                      {item.count}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-4">
            <p className="dense-label px-2">Progress</p>
            <div className="mt-2 space-y-1">
              {Object.entries(creditStatuses).map(([status, classes]) => {
                const active = searchParams?.status === status;
                return (
                  <Link
                    key={status}
                    href={`/projects/${params.id}${queryString({
                      category: searchParams?.category,
                      status,
                      credit: searchParams?.credit,
                    })}`}
                    className={`flex items-center justify-between rounded-md px-[14px] py-[7px] text-[12px] ${
                      active
                        ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] ring-1 ring-inset ring-[var(--color-border)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <span>{status.replace("_", " ")}</span>
                    <Badge className={classes}>{workspace.credits.filter((credit) => credit.status === status).length}</Badge>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--color-red)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Must-complete items
            </div>
            <p className="mono mt-2 text-[12px] text-[var(--color-text-primary)]">
              {mandatoryComplete}/{mandatoryCredits.length} finished
            </p>
          </div>
        </aside>

        <section className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[13px] font-medium text-[var(--color-text-primary)]">Project checklist</h2>
                <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                  Review items, upload files, and resolve notes without leaving the page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" asChild className="rounded-md px-3">
                <Link href={`/api/projects/${params.id}/tracker`}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export XLSX
                </Link>
              </Button>
              <Button variant="secondary" asChild className="rounded-md px-3">
                <Link href={`/api/projects/${params.id}/summary`}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  PDF summary
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[12px]">
              <thead className="sticky top-0 z-10 bg-[var(--color-surface-2)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    Item code
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    Item
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    Needed files
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    % done
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    Progress
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                    Latest note
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasFilteredCredits ? (
                  filteredCredits.map((credit) => {
                  const selected = credit.id === selectedCredit.id;
                  const category = categoryMeta[credit.category as keyof typeof categoryMeta];
                  const displayCode = mandatoryCode(credit.credit_code, credit.is_mandatory);
                  const preview = credit.remarks[0]?.body ?? credit.documentation_summary ?? "No notes yet";
                  return (
                    <tr
                      key={credit.id}
                      className={`h-10 border-b border-[var(--color-border)] transition-colors duration-100 ${
                        selected
                          ? "bg-[var(--color-green-light)]"
                          : "hover:bg-[var(--color-surface-2)]"
                      }`}
                    >
                      <td className="px-3 py-2 align-middle">
                        <Link
                          href={`/projects/${params.id}${queryString({
                            category: searchParams?.category,
                            status: searchParams?.status,
                            credit: credit.id,
                          })}`}
                          className={`mono inline-flex min-w-[68px] items-center justify-center rounded-md border px-2 py-1 text-[10px] ${
                            credit.is_mandatory ? "border-[var(--color-red-light)] bg-[var(--color-red-light)] text-[var(--color-red)]" : category.color
                          }`}
                        >
                          {displayCode}
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 align-middle text-[13px] text-[var(--color-text-primary)]">
                        {credit.credit_name}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {credit.documents_required.map((doc) => (
                            <span
                              key={doc.type}
                              className={`inline-flex rounded-[3px] px-[5px] py-[2px] text-[9px] ${
                                doc.required
                                  ? "border border-[var(--color-green)] bg-[var(--color-green-light)] text-[var(--color-green)]"
                                  : "bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]"
                              }`}
                            >
                              {docAbbreviations[doc.type] ?? doc.label.slice(0, 4).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="mono px-3 py-2 text-right align-middle text-[12px] text-[var(--color-text-secondary)]">
                        {pct(credit.completion_pct)}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <Badge className={creditStatuses[credit.status]}>{credit.status.replace("_", " ")}</Badge>
                      </td>
                      <td
                        className={`max-w-[260px] truncate px-3 py-2 align-middle text-[11px] ${
                          credit.remarks[0]?.body
                            ? "italic text-[var(--color-text-secondary)]"
                            : "text-[var(--color-text-tertiary)]"
                        }`}
                      >
                        {preview}
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)]">No items match these filters</p>
                      <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                        Clear the category or status filters to see the full checklist again.
                      </p>
                      <div className="mt-4">
                        <Button asChild variant="secondary" className="h-8 rounded-full px-4 text-[12px]">
                          <Link href={`/projects/${params.id}`}>Reset filters</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="sticky top-4 h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                  {selectedCredit.credit_name}
                </h2>
                <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                  {selectedCredit.category} / {mandatoryCode(selectedCredit.credit_code, selectedCredit.is_mandatory)}
                </p>
              </div>
              <Badge className={creditStatuses[selectedCredit.status]}>
                {selectedCredit.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <AiGuidePanel
              context={assistantContext}
              enabled={env.aiReady}
              storageKey={`assistant:project:${params.id}:${selectedCredit.id}`}
              title="AI guide for this item"
              description="Ask what is missing, which file to add next, or how to move this credit toward completion."
              prompts={[
                "What should I do next for this item?",
                "Which files are still missing?",
                "How do I clear this blocker?",
              ]}
              suggestedActions={[
                {
                  label: "Show this item only",
                  href: `/projects/${params.id}?credit=${selectedCredit.id}`,
                  description: "Keep the current item in focus and hide the rest of the checklist context.",
                },
                {
                  label: "Filter blocked items",
                  href: `/projects/${params.id}?status=blocked`,
                  description: "Jump to the items that are currently blocked so you can clear them first.",
                },
                {
                  label: "Open submission view",
                  href: `/projects/${params.id}/submission`,
                  description: "Go to the export checkpoint when you are ready to package the work.",
                },
              ]}
            />

            {selectedCredit.status === "blocked" ? (
              <div className="rounded-lg border border-[var(--color-red-light)] bg-[var(--color-red-light)] p-3 text-[11px] text-[var(--color-red)]">
                <div className="flex items-center gap-2 font-medium">
                  <FileWarning className="h-3.5 w-3.5" />
                  Waiting on {selectedCredit.blocked_by ?? "consultant"}
                </div>
                <p className="mt-1 text-[var(--color-text-secondary)]">
                  {selectedCredit.remarks[0]?.body ?? "A note is pending before this item can move forward."}
                </p>
              </div>
            ) : null}

            <section>
              <p className="dense-label">Files needed</p>
              <div className="mt-2 space-y-2">
                {selectedCredit.documents_required.map((doc) => {
                  const approved = selectedCredit.documents.some(
                    (file) => file.doc_category === doc.type && file.status === "approved",
                  );
                  const short = docAbbreviations[doc.type] ?? doc.label.slice(0, 4).toUpperCase();
                  return (
                    <div key={doc.type} className="flex h-7 items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[var(--color-surface-2)] text-[9px] font-medium text-[var(--color-text-secondary)]">
                        {short}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] text-[var(--color-text-primary)]">{doc.label}</p>
                        <p className="truncate text-[10px] text-[var(--color-text-tertiary)]">
                          {doc.required ? "Needed to continue" : "Optional for this item"}
                        </p>
                      </div>
                      {doc.required ? (
                        approved ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-green)]" />
                        ) : (
                          <Circle className="h-4 w-4 text-[var(--color-border-strong)]" />
                        )
                      ) : (
                        <span className="mono text-[10px] text-[var(--color-text-tertiary)]">NA</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <p className="dense-label">Uploaded files</p>
              <div className="mt-2 space-y-2">
                {selectedCredit.documents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--color-border)] px-3 py-4 text-center">
                    <p className="text-[11px] text-[var(--color-text-primary)]">No files uploaded yet</p>
                    <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                      Add the first file to start review.
                    </p>
                  </div>
                ) : (
                  selectedCredit.documents.map((document) => (
                    <div key={document.id} className="rounded-lg border border-[var(--color-border)] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-[var(--color-text-primary)]">
                            {document.file_name}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                            {document.doc_category}
                          </p>
                        </div>
                        <Badge
                          className={
                            document.status === "approved"
                              ? "border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[var(--color-green)]"
                              : document.status === "rejected"
                                ? "border border-[var(--color-red-light)] bg-[var(--color-red-light)] text-[var(--color-red)]"
                                : "border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
                          }
                        >
                          {document.status}
                        </Badge>
                      </div>

                      {workspace.userRole !== "owner" ? (
                        <div className="mt-3 space-y-2">
                          <form action={setDocumentStatusAction}>
                            <input type="hidden" name="project_id" value={params.id} />
                            <input type="hidden" name="credit_id" value={selectedCredit.id} />
                            <input type="hidden" name="document_id" value={document.id} />
                            <input type="hidden" name="status" value="approved" />
                            <Button type="submit" className="h-7 w-full rounded-md text-[11px]">
                              Approve
                            </Button>
                          </form>
                          <form action={setDocumentStatusAction} className="space-y-2">
                            <input type="hidden" name="project_id" value={params.id} />
                            <input type="hidden" name="credit_id" value={selectedCredit.id} />
                            <input type="hidden" name="document_id" value={document.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              name="rejection_remark"
                              placeholder="Reason for rejection"
                              className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[11px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-strong)]"
                            />
                            <Button type="submit" variant="danger" className="h-7 w-full rounded-md text-[11px]">
                              Reject
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            {workspace.userRole === "owner" ? (
              <UploadDocumentForm
                projectId={params.id}
                creditId={selectedCredit.id}
                docTypes={selectedCredit.documents_required.filter((doc) => doc.required).map((doc) => doc.type)}
                disabled={!selectedCredit.documents_required.some((doc) => doc.required)}
              />
            ) : null}

            <section>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-amber)]" />
                <p className="dense-label">Notes</p>
              </div>
              <div className="mt-2 space-y-2">
                {selectedCredit.remarks.length === 0 ? (
                  <div className="rounded-lg border border-[var(--color-border)] px-3 py-3 text-[11px] text-[var(--color-text-tertiary)]">
                    No notes yet.
                  </div>
                ) : (
                  selectedCredit.remarks.map((remark) => (
                    <div
                      key={remark.id}
                      className={`rounded-lg border border-[var(--color-border)] px-3 py-3 text-[11px] ${
                        remark.body ? "border-l-2 border-l-[var(--color-amber)]" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                        <span>{remark.role}</span>
                        <span>{new Date(remark.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">{remark.body}</p>
                    </div>
                  ))
                )}
              </div>
              <form action={addRemarkAction} className="mt-2 space-y-2">
                <input type="hidden" name="project_id" value={params.id} />
                <input type="hidden" name="credit_id" value={selectedCredit.id} />
                <input type="hidden" name="role" value={workspace.userRole === "owner" ? "owner" : "consultant"} />
                <Textarea name="body" placeholder="Add a note for the team" />
                <Button type="submit" className="h-8 w-full rounded-md">
                  Add note
                </Button>
              </form>
            </section>

            {workspace.userRole !== "owner" ? (
              <section className="space-y-2 border-t border-[var(--color-border)] pt-4">
                <form action={setCreditStateAction}>
                  <input type="hidden" name="project_id" value={params.id} />
                  <input type="hidden" name="credit_id" value={selectedCredit.id} />
                  <input type="hidden" name="action" value="complete" />
                  <Button type="submit" className="h-8 w-full rounded-md">
                    Mark as complete
                  </Button>
                </form>
                <form action={setCreditStateAction} className="space-y-2">
                  <input type="hidden" name="project_id" value={params.id} />
                  <input type="hidden" name="credit_id" value={selectedCredit.id} />
                  <input type="hidden" name="action" value="blocked" />
                  <select
                    name="blocked_by"
                    className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[11px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-strong)]"
                    defaultValue="owner"
                  >
                    <option value="owner">Waiting on owner</option>
                    <option value="consultant">Waiting on consultant</option>
                    <option value="igbc">Waiting on IGBC</option>
                  </select>
                  <Button type="submit" variant="danger" className="h-8 w-full rounded-md">
                    Put on hold
                  </Button>
                </form>
              </section>
            ) : null}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
