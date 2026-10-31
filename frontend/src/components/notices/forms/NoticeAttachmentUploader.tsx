import { useRef, useState } from "react";
import { Paperclip, Upload, X, FileText, Image, Sheet } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import { mapAttachment } from "@/api/notices";
import type { NoticeAttachment } from "@/api/types/notices";

interface Props {
  attachments: NoticeAttachment[];
  onChange:    (a: NoticeAttachment[]) => void;
}

const TYPE_ICON: Record<string, React.FC<{ className?: string }>> = {
  PDF:         FileText,
  Image:       Image,
  Document:    FileText,
  Spreadsheet: Sheet,
};

export function NoticeAttachmentUploader({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);

  // Files upload straight away (validated by the server) and attach on save.
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    const added: NoticeAttachment[] = [];
    for (const f of list) {
      try {
        added.push(mapAttachment(await uploadFile(f)));
      } catch (e) {
        toast.error(`${f.name}: ${errorMessage(e)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (added.length) onChange([...attachments, ...added]);
  }

  function remove(id: string) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
          ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-[13px] font-medium text-foreground">Drop files here or click to browse</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {uploading > 0 ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…` : "PDF, images, documents and spreadsheets"}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((a) => {
            const Icon = TYPE_ICON[a.type] ?? FileText;
            return (
              <div key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{[a.type, a.size].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  <button type="button" onClick={() => remove(a.id)}
                    className="rounded p-0.5 hover:bg-rose-100">
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center">No attachments added yet.</p>
      )}
    </div>
  );
}
