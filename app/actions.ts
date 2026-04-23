"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectForCurrentUser, getCurrentUser, getProjectWorkspace } from "@/lib/data";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function pathFor(projectId: string) {
  return [`/dashboard`, `/projects/${projectId}`, `/projects/${projectId}/submission`];
}

function calculateCompletionPct(credit: {
  na: boolean;
  documents_required: { required: boolean }[];
  documents: { doc_category: string; status: string }[];
}) {
  if (credit.na) {
    return 100;
  }

  const requiredDocCount = credit.documents_required.filter((doc) => doc.required).length;
  if (requiredDocCount === 0) {
    return 100;
  }

  const approvedDocCount = new Set(
    credit.documents.filter((file) => file.status === "approved").map((file) => file.doc_category),
  ).size;

  return Math.round((approvedDocCount / requiredDocCount) * 10000) / 100;
}

export async function createProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const targetRating = String(formData.get("target_rating") ?? "Gold");
  if (!name) {
    return;
  }

  const project = await createProjectForCurrentUser({ name, targetRating });
  pathFor(project.id).forEach((path) => revalidatePath(path));
  redirect(`/projects/${project.id}`);
}

export async function createProjectInviteAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const projectId = String(formData.get("project_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "consultant");
  if (!projectId || !email || (role !== "consultant" && role !== "admin")) {
    return;
  }

  const workspace = await getProjectWorkspace(projectId);
  if (workspace.userRole !== "owner") {
    return;
  }

  const { error } = await client.from("project_invites").insert({
    project_id: projectId,
    email,
    role,
    token: randomUUID().replaceAll("-", ""),
    created_by: user.id,
  });

  if (error) {
    return;
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}

export async function revokeProjectInviteAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const projectId = String(formData.get("project_id") ?? "");
  const token = String(formData.get("token") ?? "").trim();
  if (!projectId || !token) {
    return;
  }

  const workspace = await getProjectWorkspace(projectId);
  if (workspace.userRole !== "owner") {
    return;
  }

  const { error } = await client.from("project_invites").delete().eq("token", token).eq("project_id", projectId);
  if (error) {
    return;
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}

export async function acceptProjectInviteAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return;
  }

  const { data: invite, error } = await client
    .from("project_invites")
    .select("id, project_id, email, role, accepted_at")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return;
  }

  if (invite.accepted_at) {
    redirect(`/projects/${invite.project_id}`);
  }

  if ((user.email ?? "").toLowerCase() !== invite.email.toLowerCase()) {
    return;
  }

  const { error: membershipError } = await client.from("project_members").insert({
    project_id: invite.project_id,
    user_id: user.id,
    member_email: user.email ?? null,
    role: invite.role,
  });

  if (membershipError && !String(membershipError.message ?? "").toLowerCase().includes("duplicate")) {
    return;
  }

  const { error: updateError } = await client
    .from("project_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq("token", token);

  if (updateError) {
    return;
  }

  pathFor(invite.project_id).forEach((path) => revalidatePath(path));
  redirect(`/projects/${invite.project_id}`);
}

export async function addRemarkAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const projectId = String(formData.get("project_id"));
  const creditId = String(formData.get("credit_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return;
  }

  const workspace = await getProjectWorkspace(projectId);
  const credit = workspace.credits.find((item) => item.id === creditId);
  if (!credit) {
    return;
  }

  const { error } = await client.from("remarks").insert({
    credit_id: creditId,
    author_id: user.id,
    role: workspace.userRole === "owner" ? "owner" : "consultant",
    body,
  });

  if (error) {
    return;
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}

export async function setDocumentStatusAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const projectId = String(formData.get("project_id"));
  const documentId = String(formData.get("document_id"));
  const status = String(formData.get("status"));
  const rejectionRemark = String(formData.get("rejection_remark") ?? "").trim();
  const creditId = String(formData.get("credit_id"));
  const user = await getCurrentUser();
  const workspace = await getProjectWorkspace(projectId);
  const credit = workspace.credits.find((item) => item.id === creditId);
  const document = credit?.documents.find((item) => item.id === documentId);

  if (!credit || !document) {
    return;
  }

  const { error } = await client.from("documents").update({ status }).eq("id", documentId);
  if (error) {
    return;
  }

  if (status === "rejected" && rejectionRemark && user) {
    await client.from("remarks").insert({
      credit_id: creditId,
      document_id: documentId,
      author_id: user.id,
      role: workspace.userRole === "owner" ? "owner" : "consultant",
      body: rejectionRemark,
    });
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}

export async function setCreditStateAction(formData: FormData) {
  if (!env.isConfigured) {
    return;
  }

  const client = createClient();
  const projectId = String(formData.get("project_id"));
  const creditId = String(formData.get("credit_id"));
  const action = String(formData.get("action"));
  const workspace = await getProjectWorkspace(projectId);
  const credit = workspace.credits.find((item) => item.id === creditId);

  if (!credit) {
    return;
  }

  if (action === "complete") {
    if (credit.documents_required.some((doc) => doc.required && !credit.documents.some((file) => file.doc_category === doc.type && file.status === "approved"))) {
      return;
    }
    const { error } = await client
      .from("credits")
      .update({ status: "complete", blocked_by: null, completion_pct: 100 })
      .eq("id", creditId);
    if (error) {
      return;
    }
  }

  if (action === "blocked") {
    const blockedBy = String(formData.get("blocked_by") ?? "consultant");
    const completionPct = calculateCompletionPct(credit);
    const { error } = await client
      .from("credits")
      .update({ status: "blocked", blocked_by: blockedBy, completion_pct: completionPct })
      .eq("id", creditId);
    if (error) {
      return;
    }
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}
