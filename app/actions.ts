"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectForCurrentUser, getCurrentUser, getProjectWorkspace } from "@/lib/data";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function pathFor(projectId: string) {
  return [`/dashboard`, `/projects/${projectId}`, `/projects/${projectId}/submission`];
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
  const role = String(formData.get("role")) === "owner" ? "owner" : "consultant";
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return;
  }

  const { error } = await client.from("remarks").insert({
    credit_id: creditId,
    author_id: user.id,
    role,
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

  const { error } = await client.from("documents").update({ status }).eq("id", documentId);
  if (error) {
    return;
  }

  if (status === "rejected" && rejectionRemark && user) {
    await client.from("remarks").insert({
      credit_id: creditId,
      document_id: documentId,
      author_id: user.id,
      role: "consultant",
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

  if (action === "complete") {
    const workspace = await getProjectWorkspace(projectId);
    const credit = workspace.credits.find((item) => item.id === creditId);
    if (!credit || credit.documents_required.some((doc) => doc.required && !credit.documents.some((file) => file.doc_category === doc.type && file.status === "approved"))) {
      return;
    }
    const { error } = await client
      .from("credits")
      .update({ status: "complete", blocked_by: null })
      .eq("id", creditId);
    if (error) {
      return;
    }
  }

  if (action === "blocked") {
    const blockedBy = String(formData.get("blocked_by") ?? "consultant");
    const { error } = await client
      .from("credits")
      .update({ status: "blocked", blocked_by: blockedBy })
      .eq("id", creditId);
    if (error) {
      return;
    }
  }

  pathFor(projectId).forEach((path) => revalidatePath(path));
}
