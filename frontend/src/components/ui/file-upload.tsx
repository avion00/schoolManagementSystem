import { UploadCloud, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FileUpload({
  onFilesSelected,
  accept,
  multiple = false,
  files,
  onRemove,
  className,
}: {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  files?: { name: string; size: string }[];
  onRemove?: (index: number) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    onFilesSelected(Array.from(e.dataTransfer.files));
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/60 px-6 py-8 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="text-[12.5px] font-medium text-foreground">Drag & drop files here, or click to browse</p>
        {accept && <p className="text-[11px] text-muted-foreground">Accepted: {accept}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && onFilesSelected(Array.from(e.target.files))}
        />
      </div>

      {files && files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-[12px]">
              <span className="truncate text-foreground">{f.name}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">{f.size}</span>
              {onRemove && (
                <Button variant="ghost" size="icon" className="ml-2 h-6 w-6 shrink-0" onClick={() => onRemove(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
