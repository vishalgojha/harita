import Link from "next/link";
import { Download, FolderTree } from "lucide-react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSubmissionWorkspace } from "@/lib/data";

export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const workspace = await getSubmissionWorkspace(params.id);
  const mandatoryReady = workspace.credits
    .filter((credit) => credit.is_mandatory)
    .every((credit) => credit.status === "complete");

  return (
    <Shell
      title={`${workspace.project.name} Submission`}
      description="Only completed credits and approved documents are included in the submission pack."
      role={workspace.userRole}
      notificationCount={workspace.notifications.length}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {workspace.credits.map((credit) => (
            <Card key={credit.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                    {credit.credit_code}
                  </h3>
                  <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{credit.credit_name}</p>
                </div>
                <Badge className="border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[var(--color-green)]">
                  Ready
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {credit.documents
                  .filter((document) => document.status === "approved")
                  .map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 text-[11px]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--color-text-primary)]">
                          {document.file_name}
                        </p>
                        <p className="mt-1 text-[var(--color-text-tertiary)]">{document.doc_category}</p>
                      </div>
                      <Badge className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
                        {document.file_type}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
                <FolderTree className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-[var(--color-text-primary)]">Submission pack</h3>
                <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                  Approved files are exported under `/[credit_code]/[doc_category]/[filename]`.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-lg border p-3 text-[11px] ${
                mandatoryReady
                  ? "border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[var(--color-green)]"
                  : "border-[var(--color-amber-light)] bg-[var(--color-amber-light)] text-[var(--color-amber)]"
              }`}
            >
              {mandatoryReady
                ? "All mandatory credits are complete. Submission pack export is enabled."
                : "Mandatory credits are still pending. The ZIP export stays disabled until all mandatory requirements are complete."}
            </div>
            <Button asChild className="h-8 w-full rounded-md" variant={mandatoryReady ? "default" : "secondary"}>
              <Link
                aria-disabled={!mandatoryReady}
                href={mandatoryReady ? `/api/projects/${params.id}/submission-pack` : "#"}
                className={!mandatoryReady ? "pointer-events-none opacity-60" : ""}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download submission pack
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
