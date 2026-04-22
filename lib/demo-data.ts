import { addDays, subDays } from "date-fns";
import { igbcCreditCatalog } from "@/lib/catalog";
import type {
  CreditWorkspace,
  DocumentStatus,
  ProjectSummary,
  ProjectWorkspace,
} from "@/lib/types";

const projectId = "demo-project";

function creditId(code: string) {
  return `credit-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const demoCredits: CreditWorkspace[] = igbcCreditCatalog.map((credit, index) => {
  const id = creditId(credit.credit_code);
  const requiredDocs = credit.documents_required.filter((doc) => doc.required);
  const approvedCount =
    index % 7 === 0 ? requiredDocs.length : index % 4 === 0 ? Math.max(1, requiredDocs.length - 1) : 0;
  const documents = requiredDocs.slice(0, Math.max(approvedCount, 1)).map((doc, docIndex) => ({
    id: `${id}-doc-${docIndex}`,
    credit_id: id,
    project_id: projectId,
    uploaded_by: "demo-user",
    file_name: `${doc.type.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_${docIndex + 1}.pdf`,
    file_path: `${projectId}/${id}/${doc.type}/sample-${docIndex + 1}.pdf`,
    file_type: "pdf",
    doc_category: doc.type,
    status: (docIndex < approvedCount ? "approved" : "uploaded") as DocumentStatus,
    uploaded_at: subDays(new Date(), index + docIndex).toISOString(),
  }));
  const completionPct = requiredDocs.length
    ? (approvedCount / requiredDocs.length) * 100
    : 100;
  const status = credit.na
    ? "complete"
    : completionPct === 100
      ? "complete"
      : completionPct > 0
        ? "in_progress"
        : index % 9 === 0
          ? "blocked"
          : "pending";

  return {
    id,
    project_id: projectId,
    credit_code: credit.credit_code,
    category: credit.credit_code.split(" ")[0],
    credit_name: credit.credit_name,
    is_mandatory: credit.is_mandatory,
    documents_required: credit.documents_required,
    status,
    blocked_by: status === "blocked" ? "owner" : null,
    completion_pct: completionPct,
    documentation_summary: credit.documentation_summary,
    na: credit.na,
    documents,
    remarks: index % 5 === 0
      ? [
          {
            id: `${id}-remark-1`,
            credit_id: id,
            author_id: "demo-consultant",
            role: "consultant" as const,
            body:
              status === "blocked"
                ? "Waiting on owner-side supporting evidence before review can continue."
                : "Initial review completed. Please close the remaining evidence gaps.",
            created_at: subDays(new Date(), index).toISOString(),
          },
        ]
      : [],
  };
});

export const demoProjects: ProjectSummary[] = [
  {
    id: projectId,
    name: "CCIL Gurgaon Experience Centre",
    certification_type: "IGBC Green Interiors v2",
    target_rating: "Gold",
    created_at: subDays(new Date(), 18).toISOString(),
    role: "consultant",
    overallCompletion:
      demoCredits.reduce((sum, credit) => sum + credit.completion_pct, 0) / demoCredits.length,
    totalCredits: demoCredits.length,
    uploadedDocs: demoCredits.reduce((sum, credit) => sum + credit.documents.length, 0),
    mandatoryCreditsMet: demoCredits.filter(
      (credit) => credit.is_mandatory && credit.status === "complete",
    ).length,
    openRemarks: demoCredits.reduce((sum, credit) => sum + credit.remarks.length, 0),
  },
  {
    id: "demo-owner-project",
    name: "Pune Delivery Hub Fit-out",
    certification_type: "IGBC Green Interiors v2",
    target_rating: "Silver",
    created_at: subDays(new Date(), 7).toISOString(),
    role: "owner",
    overallCompletion: 36,
    totalCredits: demoCredits.length,
    uploadedDocs: 29,
    mandatoryCreditsMet: 2,
    openRemarks: 6,
  },
];

export function getDemoWorkspace(projectIdArg: string, role = "consultant"): ProjectWorkspace {
  return {
    project: {
      id: projectIdArg,
      name:
        projectIdArg === "demo-owner-project"
          ? "Pune Delivery Hub Fit-out"
          : "CCIL Gurgaon Experience Centre",
      certification_type: "IGBC Green Interiors v2",
      target_rating: projectIdArg === "demo-owner-project" ? "Silver" : "Gold",
      created_at: subDays(new Date(), 20).toISOString(),
    },
    userRole: role as "owner" | "consultant" | "admin",
    credits: demoCredits.map((credit) => ({
      ...credit,
      project_id: projectIdArg,
      documents: credit.documents.map((document) => ({
        ...document,
        project_id: projectIdArg,
        file_path: `${projectIdArg}/${document.credit_id}/${document.doc_category}/${document.file_name}`,
      })),
    })),
    notifications: [
      {
        id: "demo-notification-1",
        body: "WC C1 has one rejected plumbing fixture invoice pending owner re-upload.",
        created_at: addDays(new Date(), -1).toISOString(),
        read_at: null,
      },
    ],
  };
}
