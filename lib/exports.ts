import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { CreditWorkspace, ProjectWorkspace } from "@/lib/types";

function trackerRows(credits: CreditWorkspace[]) {
  const rows: (string | number)[][] = [
    [],
    [
      "Criteria",
      "Credit ",
      "Remarks /Documents Required",
      "Narrative",
      "Tech Specs",
      "Certificates/ Declaration",
      "Drawings",
      "Calculations & Tables",
      "Invoices",
      "Pic/Video",
      "% Completion",
      "Remark",
    ],
    [],
  ];

  let currentCategory = "";
  for (const credit of credits) {
    if (currentCategory !== credit.category) {
      currentCategory = credit.category;
      rows.push([credit.category, "", "", "", "", "", "", "", "", "", "", ""]);
    }

    const requirementMap = new Map(credit.documents_required.map((doc) => [doc.type, doc.required ? "Required" : "NA"]));
    rows.push([
      credit.credit_code.replace(" C", " Credit ").replace(" MR", " Mandatory Requirement "),
      credit.credit_name,
      credit.documentation_summary ?? "",
      requirementMap.get("Narrative") ?? "NA",
      requirementMap.get("Tech Spec") ?? "NA",
      requirementMap.get("Certificate/Declaration") ?? "NA",
      requirementMap.get("Drawing") ?? "NA",
      requirementMap.get("Calculation & Tables") ?? "NA",
      requirementMap.get("Invoice") ?? "NA",
      requirementMap.get("Pic/Video") ?? "NA",
      Number((credit.completion_pct / 100).toFixed(2)),
      credit.remarks[0]?.body ?? "",
    ]);
  }

  return rows;
}

export function buildTrackerWorkbook(workspace: ProjectWorkspace) {
  const workbook = XLSX.utils.book_new();
  const trackerSheet = XLSX.utils.aoa_to_sheet(trackerRows(workspace.credits));
  trackerSheet["!cols"] = [
    { wch: 18 },
    { wch: 34 },
    { wch: 80 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 12 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, trackerSheet, "Document tracker");

  const dashboardRows = [
    ["Section", "Total Credits", "Completed (%)", "In Progress", "Required", "NA"],
    ...workspace.credits.map((credit) => [
      credit.credit_code,
      1,
      Number((credit.completion_pct / 100).toFixed(2)),
      credit.status === "in_progress" ? 1 : 0,
      credit.documents_required.filter((item) => item.required).length,
      credit.documents_required.filter((item) => !item.required).length,
    ]),
  ];
  const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardRows);
  dashboardSheet["!cols"] = Array.from({ length: 6 }, () => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, "Dashboard");
  return workbook;
}

export async function buildProjectSummaryPdf(workspace: ProjectWorkspace) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 48;
  const right = 48;
  const top = 540;
  const bottom = 48;
  const rowHeight = 18;
  const rowsPerPage = Math.floor((top - bottom - 24) / rowHeight);

  function drawHeader(page: import("pdf-lib").PDFPage) {
    page.drawText("HaritaDocs Project Summary", {
      x: left,
      y: top,
      size: 22,
      font: bold,
      color: rgb(0.09, 0.35, 0.27),
    });
    page.drawText(`${workspace.project.name} • ${workspace.project.target_rating}`, {
      x: left,
      y: 514,
      size: 11,
      font,
      color: rgb(0.29, 0.37, 0.34),
    });
    page.drawLine({
      start: { x: left, y: 500 },
      end: { x: pageWidth - right, y: 500 },
      thickness: 0.75,
      color: rgb(0.85, 0.87, 0.86),
    });
  }

  function addPage() {
    const page = pdf.addPage([pageWidth, pageHeight]);
    drawHeader(page);
    return page;
  }

  let page = addPage();
  let y = 478;
  let rowIndexOnPage = 0;

  for (const credit of workspace.credits) {
    if (rowIndexOnPage >= rowsPerPage) {
      page = addPage();
      y = 478;
      rowIndexOnPage = 0;
    }

    page.drawText(credit.credit_code, { x: left, y, size: 10, font: bold });
    page.drawText(credit.credit_name.slice(0, 44), { x: 130, y, size: 10, font });
    page.drawText(`${Math.round(credit.completion_pct)}%`, { x: 460, y, size: 10, font });
    page.drawText(credit.status, { x: 540, y, size: 10, font });
    y -= rowHeight;
    rowIndexOnPage += 1;
  }

  return Buffer.from(await pdf.save());
}

export async function buildSubmissionZip(workspace: ProjectWorkspace) {
  const zip = new JSZip();
  const client = env.isConfigured ? createClient() : null;

  for (const credit of workspace.credits) {
    const approvedDocs = credit.documents.filter((document) => document.status === "approved");
    for (const document of approvedDocs) {
      const folder = zip.folder(`${credit.credit_code}/${document.doc_category}`);
      if (!folder) {
        continue;
      }

      if (client) {
        const { data, error } = await client.storage.from("project-documents").download(document.file_path);
        if (!error && data) {
          const bytes = Buffer.from(await data.arrayBuffer());
          folder.file(document.file_name, bytes);
          continue;
        }
      }

      folder.file(document.file_name, `Placeholder for ${document.file_name}`);
    }
  }

  return zip.generateAsync({ type: "nodebuffer" });
}
