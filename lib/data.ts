import { redirect } from "next/navigation";
import { buildSeedCredits } from "@/lib/catalog";
import { categoryMeta } from "@/lib/constants";
import { getDemoWorkspace, demoProjects } from "@/lib/demo-data";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  CreditWorkspace,
  DocumentRecord,
  DocumentRequirement,
  MemberRole,
  ProjectSummary,
  ProjectWorkspace,
  RemarkRecord,
} from "@/lib/types";

type SupabaseClient = ReturnType<typeof createClient>;

function normalizeRole(role: string): MemberRole {
  return role === "owner" || role === "admin" ? role : "consultant";
}

function mapCredit(
  credit: Record<string, any>,
  documents: Record<string, any>[],
  remarks: Record<string, any>[],
): CreditWorkspace {
  return {
    id: credit.id,
    project_id: credit.project_id,
    credit_code: credit.credit_code,
    category: credit.category,
    credit_name: credit.credit_name,
    is_mandatory: credit.is_mandatory,
    documents_required: (credit.documents_required ?? []) as DocumentRequirement[],
    status: credit.status,
    blocked_by: credit.blocked_by,
    completion_pct: Number(credit.completion_pct ?? 0),
    documentation_summary: credit.documentation_summary,
    na: credit.na,
    documents: documents.filter((document) => document.credit_id === credit.id) as DocumentRecord[],
    remarks: remarks.filter((remark) => remark.credit_id === credit.id) as RemarkRecord[],
  };
}

async function getSupabaseUser(client: SupabaseClient) {
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentUser() {
  if (!env.isConfigured) {
    return { id: "demo-user", email: "consultant@haritadocs.local" };
  }

  const client = createClient();
  const user = await getSupabaseUser(client);
  return user ? { id: user.id, email: user.email ?? "" } : null;
}

export async function getDashboardProjects() {
  if (!env.isConfigured) {
    return demoProjects;
  }

  const client = createClient();
  const user = await getSupabaseUser(client);
  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await client
    .from("project_members")
    .select("project_id, role, projects(id, name, certification_type, target_rating, created_at)")
    .eq("user_id", user.id);

  const projects = memberships ?? [];

  const summaries = await Promise.all(
    projects.map(async (membership) => {
      const projectId = membership.project_id;
      const { data: credits } = await client
        .from("credits")
        .select("id, is_mandatory, status, completion_pct")
        .eq("project_id", projectId);
      const creditIds = (credits ?? []).map((credit) => credit.id);
      const [{ count: docsCount }, { count: remarksCount }] = await Promise.all([
        client.from("documents").select("*", { count: "exact", head: true }).eq("project_id", projectId),
        creditIds.length
          ? client.from("remarks").select("*", { count: "exact", head: true }).in("credit_id", creditIds)
          : Promise.resolve({ count: 0 }),
      ]);
      const creditRows = credits ?? [];
      const project = Array.isArray(membership.projects) ? membership.projects[0] : membership.projects;

      return {
        id: project.id,
        name: project.name,
        certification_type: project.certification_type,
        target_rating: project.target_rating,
        created_at: project.created_at,
        role: normalizeRole(membership.role),
        overallCompletion:
          creditRows.reduce((sum, credit) => sum + Number(credit.completion_pct ?? 0), 0) /
          Math.max(creditRows.length, 1),
        totalCredits: creditRows.length,
        uploadedDocs: docsCount ?? 0,
        mandatoryCreditsMet: creditRows.filter(
          (credit) => credit.is_mandatory && credit.status === "complete",
        ).length,
        openRemarks: remarksCount ?? 0,
      } satisfies ProjectSummary;
    }),
  );

  return summaries;
}

export async function getProjectWorkspace(projectId: string) {
  if (!env.isConfigured) {
    const project = demoProjects.find((item) => item.id === projectId) ?? demoProjects[0];
    return getDemoWorkspace(project.id, project.role);
  }

  const client = createClient();
  const user = await getSupabaseUser(client);
  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await client
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    redirect("/dashboard");
  }

  const [{ data: project }, { data: credits }, { data: documents }, { data: notifications }] =
    await Promise.all([
      client.from("projects").select("*").eq("id", projectId).single(),
      client.from("credits").select("*").eq("project_id", projectId).order("credit_code"),
      client
        .from("documents")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false }),
      client
        .from("notifications")
        .select("id, body, created_at, read_at")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);
  const creditIds = (credits ?? []).map((credit) => credit.id);
  const { data: remarks } = creditIds.length
    ? await client.from("remarks").select("*").in("credit_id", creditIds).order("created_at", { ascending: false })
    : { data: [] };

  const mappedCredits = (credits ?? []).map((credit) => mapCredit(credit, documents ?? [], remarks ?? []));

  return {
    project,
    userRole: normalizeRole(membership.role),
    credits: mappedCredits,
    notifications: notifications ?? [],
  } satisfies ProjectWorkspace;
}

export async function getSubmissionWorkspace(projectId: string) {
  const workspace = await getProjectWorkspace(projectId);
  return {
    ...workspace,
    credits: workspace.credits.filter((credit) => credit.status === "complete"),
  };
}

export function creditStats(credits: CreditWorkspace[]) {
  const total = credits.length;
  const mandatory = credits.filter((credit) => credit.is_mandatory);
  const docs = credits.reduce((sum, credit) => sum + credit.documents.length, 0);

  return {
    total,
    docs,
    categories: Object.entries(categoryMeta).map(([key, meta]) => ({
      key,
      label: meta.label,
      count: credits.filter((credit) => credit.category === key).length,
    })),
    mandatoryMet: mandatory.filter((credit) => credit.status === "complete").length,
    mandatoryTotal: mandatory.length,
  };
}

export async function createProjectForCurrentUser({
  name,
  targetRating,
}: {
  name: string;
  targetRating: string;
}) {
  if (!env.isConfigured) {
    return { id: "demo-project" };
  }

  const client = createClient();
  const user = await getSupabaseUser(client);
  if (!user) {
    redirect("/login");
  }

  const { data: project, error: projectError } = await client
    .from("projects")
    .insert({
      name,
      target_rating: targetRating,
      certification_type: "IGBC Green Interiors v2",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw projectError ?? new Error("Could not create project");
  }

  const membershipError = await client.from("project_members").insert({
    project_id: project.id,
    user_id: user.id,
    role: "consultant",
  });

  if (membershipError.error) {
    throw membershipError.error;
  }

  const { error: creditsError } = await client.from("credits").insert(buildSeedCredits(project.id));
  if (creditsError) {
    throw creditsError;
  }

  return project;
}
