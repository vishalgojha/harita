"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function UploadDocumentForm({
  projectId,
  creditId,
  docTypes,
  disabled,
}: {
  projectId: string;
  creditId: string;
  docTypes: string[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docType, setDocType] = useState(docTypes[0] ?? "Narrative");
  const accept = useMemo(() => ".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.dwg,.mp4,.mov", []);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    if (!(file instanceof File)) {
      setError("Choose a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const filePath = `${projectId}/${creditId}/${docType}/${crypto.randomUUID()}-${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: false });

      if (storageError) {
        throw storageError;
      }

      const { error: dbError } = await supabase.from("documents").insert({
        credit_id: creditId,
        project_id: projectId,
        file_name: file.name,
        file_path: filePath,
        file_type: extension,
        doc_category: docType,
        status: "uploaded",
      });

      if (dbError) {
        throw dbError;
      }

      event.currentTarget.reset();
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onUpload} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <UploadCloud className="h-4 w-4 text-primary" />
        Upload owner evidence
      </div>
      <select
        value={docType}
        onChange={(event) => setDocType(event.target.value)}
        className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      >
        {docTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <input
        required
        name="file"
        type="file"
        accept={accept}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:font-medium"
      />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading || disabled}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Upload document
      </Button>
    </form>
  );
}
