import { useRef, useState } from "react";
import { Upload, X, FileText, Image, Sheet, File } from "lucide-react";
import type { MessageAttachment } from "@/data/messagesData";

function getFileType(name: string): MessageAttachment["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext))                           return "PDF";
  if (["png","jpg","jpeg","gif","webp"].includes(ext)) return "Image";
  if (["xlsx","xls","csv"].includes(ext))              return "Spreadsheet";
  return "Document";
}

const TYPE_ICON: Record<MessageAttachment["type"], React.ElementType> = {
  PDF:         FileText,
  Image:       Image,
  Spreadsheet: Sheet,
  Document:    File,
};

interface Props {
  attachments: MessageAttachment[];
  onChange:    (a: MessageAttachment[]) => void;
}

export function MessageAttachmentUploader({ attachments, onChange }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  let nextId = attachments.length + 100;

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newItems: MessageAttachment[] = Array.from(files).map((f) => ({
      id:   nextId++,
      name: f.name,
      type: getFileType(f.name),
      size: f.size < 1024 * 1024
        ? `${Math.round(f.size / 1024)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    onChange([...attachments, ...newItems]);
  }

  function remove(id: number) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e)  => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors
          ${dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-[13px] font-medium text-foreground">Drop files here or click to upload</p>
        <p className="text-[11px] text-muted-foreground">PDF, Images, Documents, Spreadsheets</p>
        <input ref={inputRef} type="file" multiple hidden
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xlsx,.xls,.csv,.doc,.docx"
          onChange={(e) => addFiles(e.target.files)} />
      </div>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((a) => {
            const Icon = TYPE_ICON[a.type];
            return (
              <li key={a.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-[13px] text-foreground">{a.name}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{a.size}</span>
                <button type="button" onClick={() => remove(a.id)}
                  className="shrink-0 text-muted-foreground hover:text-rose-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
