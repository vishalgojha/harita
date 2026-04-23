export type MemberRole = "owner" | "consultant" | "admin";
export type CreditStatus = "pending" | "in_progress" | "blocked" | "complete";
export type DocumentStatus = "uploaded" | "approved" | "rejected";

export type DocumentRequirement = {
  type: string;
  label: string;
  requirement: "Required" | "NA";
  required: boolean;
};

export type CatalogCredit = {
  category: string;
  credit_label: string;
  credit_code: string;
  credit_name: string;
  is_mandatory: boolean;
  na: boolean;
  documentation_summary: string;
  documents_required: DocumentRequirement[];
};

export type DocumentRecord = {
  id: string;
  credit_id: string;
  project_id: string;
  uploaded_by?: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  doc_category: string;
  status: DocumentStatus;
  uploaded_at: string;
};

export type RemarkRecord = {
  id: string;
  credit_id: string;
  document_id?: string | null;
  author_id?: string | null;
  role: "consultant" | "owner";
  body: string;
  created_at: string;
};

export type CreditWorkspace = {
  id: string;
  project_id: string;
  credit_code: string;
  category: string;
  credit_name: string;
  is_mandatory: boolean;
  documents_required: DocumentRequirement[];
  status: CreditStatus;
  blocked_by?: string | null;
  completion_pct: number;
  documentation_summary?: string | null;
  na: boolean;
  documents: DocumentRecord[];
  remarks: RemarkRecord[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  certification_type: string;
  target_rating: string;
  created_at: string;
  role: MemberRole;
  overallCompletion: number;
  totalCredits: number;
  uploadedDocs: number;
  mandatoryCreditsMet: number;
  openRemarks: number;
};

export type ProjectInviteRecord = {
  id: string;
  project_id: string;
  email: string;
  role: Exclude<MemberRole, "owner">;
  token: string;
  created_by?: string | null;
  accepted_by?: string | null;
  accepted_at?: string | null;
  created_at: string;
};

export type ProjectMemberRecord = {
  id: string;
  project_id: string;
  user_id: string;
  member_email?: string | null;
  role: MemberRole;
  created_at: string;
};

export type ProjectWorkspace = {
  project: {
    id: string;
    name: string;
    certification_type: string;
    target_rating: string;
    created_at: string;
    created_by?: string | null;
  };
  userRole: MemberRole;
  credits: CreditWorkspace[];
  members: ProjectMemberRecord[];
  invites: ProjectInviteRecord[];
  notifications: {
    id: string;
    body: string;
    created_at: string;
    read_at?: string | null;
  }[];
};
