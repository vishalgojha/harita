import { NextResponse } from "next/server";
import { getProjectWorkspace } from "@/lib/data";
import { buildProjectSummaryPdf } from "@/lib/exports";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const workspace = await getProjectWorkspace(params.id);
  const buffer = await buildProjectSummaryPdf(workspace);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${workspace.project.name}-summary.pdf"`,
    },
  });
}
