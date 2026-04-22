import Link from "next/link";
import { CheckCircle2, Circle, Download, FileWarning, Filter, ShieldCheck } from "lucide-react";
import { addRemarkAction, setCreditStateAction, setDocumentStatusAction } from "@/app/actions";
import { UploadDocumentForm } from "@/components/project/upload-document-form";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { categoryMeta, creditStatuses } from "@/lib/constants";
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

  return (
    <Shell
      title={workspace.project.name}
      description={`${workspace.project.certification_type} • Target ${workspace.project.target_rating}`}
      role={workspace.userRole}
      notificationCount={workspace.notifications.filter((item) => !item.read_at).length}
    >
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_380px]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Filter className="h-4 w-4 text-primary" />
                Filters
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryMeta).map(([key, meta]) => (
                    <Link
                      key={key}
                      href={`/projects/${params.id}?category=${key}`}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${meta.color}`}
                    >
                      {key}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(creditStatuses).map(([status, classes]) => (
                    <Link
                      key={status}
                      href={`/projects/${params.id}?status=${status}`}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${classes}`}
                    >
                      {status.replace("_", " ")}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold">Project health</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mandatory credits</span>
                  <span className="font-semibold">
                    {stats.mandatoryMet}/{stats.mandatoryTotal}
                  </span>
                </div>
                <Progress value={(stats.mandatoryMet / Math.max(stats.mandatoryTotal, 1)) * 100} />
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                {stats.categories.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">Credit tracker</h3>
              <p className="text-sm text-slate-600">
                Required chips mirror the CCIL tracker. Consultants can approve/reject; owners stay in upload mode.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" asChild>
                <Link href={`/api/projects/${params.id}/tracker`}>
                  <Download className="mr-2 h-4 w-4" />
                  Export XLSX
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={`/api/projects/${params.id}/summary`}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF summary
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Credit</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Doc Types</th>
                  <th className="px-4 py-3">% Complete</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remark preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredits.map((credit) => (
                  <tr key={credit.id} className="border-t border-border align-top hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${params.id}?credit=${credit.id}`} className="font-semibold">
                        {credit.credit_code}
                      </Link>
                      {credit.is_mandatory ? (
                        <Badge className="mt-2 block w-fit bg-rose-100 text-rose-700">Mandatory</Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{credit.credit_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {credit.documents_required.map((doc) => (
                          <Badge
                            key={doc.type}
                            className={
                              doc.required
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-500"
                            }
                          >
                            {doc.label}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 space-y-2">
                        <div className="font-semibold text-slate-800">{pct(credit.completion_pct)}</div>
                        <Progress value={credit.completion_pct} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={creditStatuses[credit.status]}>
                        {credit.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      {credit.remarks[0]?.body ?? credit.documentation_summary?.slice(0, 120) ?? "No remarks yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="sticky top-4 max-h-[calc(100vh-4rem)] overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={categoryMeta[selectedCredit.category as keyof typeof categoryMeta]?.color}>
                    {selectedCredit.category}
                  </Badge>
                  {selectedCredit.is_mandatory ? (
                    <Badge className="bg-rose-100 text-rose-700">Mandatory</Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-xl font-bold">{selectedCredit.credit_code}</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedCredit.credit_name}</p>
              </div>
              <Badge className={creditStatuses[selectedCredit.status]}>
                {selectedCredit.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto">
            {selectedCredit.status === "blocked" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <div className="flex items-center gap-2 font-semibold">
                  <FileWarning className="h-4 w-4" />
                  Blocked by {selectedCredit.blocked_by ?? "consultant"}
                </div>
                <p className="mt-2">{selectedCredit.remarks[0]?.body ?? "A blocking remark is pending."}</p>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  Document checklist
                </h4>
                <span className="text-sm font-semibold">{pct(selectedCredit.completion_pct)}</span>
              </div>
              {selectedCredit.documents_required.map((doc) => {
                const approved = selectedCredit.documents.some(
                  (file) => file.doc_category === doc.type && file.status === "approved",
                );
                return (
                  <div key={doc.type} className="flex items-center justify-between rounded-2xl border border-border p-3">
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-slate-500">{doc.required ? "Required" : "NA"}</p>
                    </div>
                    {doc.required ? (
                      approved ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500">NA</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Uploaded files
              </h4>
              {selectedCredit.documents.length === 0 ? (
                <div className="rounded-2xl bg-muted p-4 text-sm text-slate-600">No files uploaded yet.</div>
              ) : (
                selectedCredit.documents.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{document.file_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{document.doc_category}</p>
                      </div>
                      <Badge className={document.status === "approved" ? "bg-emerald-100 text-emerald-700" : document.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}>
                        {document.status}
                      </Badge>
                    </div>
                    {workspace.userRole !== "owner" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <form action={setDocumentStatusAction}>
                          <input type="hidden" name="project_id" value={params.id} />
                          <input type="hidden" name="credit_id" value={selectedCredit.id} />
                          <input type="hidden" name="document_id" value={document.id} />
                          <input type="hidden" name="status" value="approved" />
                          <Button type="submit" className="h-9 px-3 text-xs">
                            Approve
                          </Button>
                        </form>
                        <form action={setDocumentStatusAction} className="flex flex-1 gap-2">
                          <input type="hidden" name="project_id" value={params.id} />
                          <input type="hidden" name="credit_id" value={selectedCredit.id} />
                          <input type="hidden" name="document_id" value={document.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <input
                            name="rejection_remark"
                            placeholder="Reason for rejection"
                            className="min-w-0 flex-1 rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-primary"
                          />
                          <Button type="submit" variant="danger" className="h-9 px-3 text-xs">
                            Reject
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            {workspace.userRole === "owner" ? (
              <UploadDocumentForm
                projectId={params.id}
                creditId={selectedCredit.id}
                docTypes={selectedCredit.documents_required.filter((doc) => doc.required).map((doc) => doc.type)}
                disabled={!selectedCredit.documents_required.some((doc) => doc.required)}
              />
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  Remarks thread
                </h4>
              </div>
              <div className="space-y-3">
                {selectedCredit.remarks.map((remark) => (
                  <div key={remark.id} className="rounded-2xl bg-muted p-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-[0.2em]">{remark.role}</span>
                      <span>{new Date(remark.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{remark.body}</p>
                  </div>
                ))}
              </div>
              <form action={addRemarkAction} className="space-y-3">
                <input type="hidden" name="project_id" value={params.id} />
                <input type="hidden" name="credit_id" value={selectedCredit.id} />
                <input type="hidden" name="role" value={workspace.userRole === "owner" ? "owner" : "consultant"} />
                <Textarea name="body" placeholder="Add a new remark or validation note" />
                <Button type="submit" className="w-full">
                  Add remark
                </Button>
              </form>
            </div>

            {workspace.userRole !== "owner" ? (
              <div className="space-y-3 border-t border-border pt-4">
                <form action={setCreditStateAction}>
                  <input type="hidden" name="project_id" value={params.id} />
                  <input type="hidden" name="credit_id" value={selectedCredit.id} />
                  <input type="hidden" name="action" value="complete" />
                  <Button type="submit" className="w-full">
                    Mark complete
                  </Button>
                </form>
                <form action={setCreditStateAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="project_id" value={params.id} />
                  <input type="hidden" name="credit_id" value={selectedCredit.id} />
                  <input type="hidden" name="action" value="blocked" />
                  <select
                    name="blocked_by"
                    className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    defaultValue="owner"
                  >
                    <option value="owner">Blocked by owner</option>
                    <option value="consultant">Blocked by consultant</option>
                    <option value="igbc">Blocked by IGBC</option>
                  </select>
                  <Button type="submit" variant="danger">
                    Set blocked
                  </Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
