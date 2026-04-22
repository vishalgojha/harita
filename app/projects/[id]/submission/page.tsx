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
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {workspace.credits.map((credit) => (
            <Card key={credit.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{credit.credit_code}</h3>
                  <p className="text-sm text-slate-600">{credit.credit_name}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {credit.documents
                  .filter((document) => document.status === "approved")
                  .map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between rounded-2xl border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{document.file_name}</p>
                        <p className="mt-1 text-slate-500">{document.doc_category}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">{document.file_type}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Submission pack</h3>
                <p className="text-sm text-slate-600">
                  Approved documents are zipped under `/[credit_code]/[doc_category]/[filename]`.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`rounded-2xl p-4 text-sm ${mandatoryReady ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {mandatoryReady
                ? "All mandatory credits are complete. Submission pack export is enabled."
                : "Mandatory credits are still pending. The ZIP export stays disabled until all mandatory requirements are complete."}
            </div>
            <Button asChild className="w-full" variant={mandatoryReady ? "default" : "secondary"}>
              <Link
                aria-disabled={!mandatoryReady}
                href={mandatoryReady ? `/api/projects/${params.id}/submission-pack` : "#"}
                className={!mandatoryReady ? "pointer-events-none opacity-60" : ""}
              >
                <Download className="mr-2 h-4 w-4" />
                Download submission pack
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
