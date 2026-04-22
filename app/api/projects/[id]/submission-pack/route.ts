import { NextResponse } from "next/server";
import { getSubmissionWorkspace } from "@/lib/data";
import { buildSubmissionZip } from "@/lib/exports";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const workspace = await getSubmissionWorkspace(params.id);
  const mandatoryReady = workspace.credits
    .filter((credit) => credit.is_mandatory)
    .every((credit) => credit.status === "complete");

  if (!mandatoryReady) {
    return NextResponse.json(
      { error: "All mandatory credits must be complete before generating the submission pack." },
      { status: 400 },
    );
  }

  const zip = await buildSubmissionZip(workspace);
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${workspace.project.name}-submission-pack.zip"`,
    },
  });
}
