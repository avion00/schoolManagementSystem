import { useState } from "react";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOCUMENTS = [
  { id: "birth_cert",      name: "Birth Certificate",    required: true  },
  { id: "transfer_cert",   name: "Transfer Certificate", required: false },
  { id: "prev_marksheet",  name: "Previous Marksheet",   required: false },
  { id: "student_photo",   name: "Student Photo",        required: true  },
  { id: "parent_id",       name: "Parent / Guardian ID", required: true  },
  { id: "medical_form",    name: "Medical Form",         required: false },
  { id: "address_proof",   name: "Address Proof",        required: false },
];

export function DocumentChecklist() {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setUploaded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const uploadedCount = Object.values(uploaded).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
        <p className="text-xs font-semibold text-foreground">
          {uploadedCount} / {DOCUMENTS.length} documents uploaded
        </p>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(uploadedCount / DOCUMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Document rows */}
      {DOCUMENTS.map((doc) => {
        const isUploaded = uploaded[doc.id] ?? false;
        return (
          <div
            key={doc.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
              isUploaded
                ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10"
                : "border-border/60 bg-muted/20",
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                isUploaded ? "bg-emerald-500/15" : "bg-muted",
              )}
            >
              {isUploaded ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{doc.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {doc.required ? "Required" : "Optional"}
                {" · "}
                <span
                  className={cn(
                    "font-semibold",
                    isUploaded
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                >
                  {isUploaded ? "Uploaded" : "Not uploaded"}
                </span>
              </p>
            </div>

            {/* Action */}
            <Button
              type="button"
              variant={isUploaded ? "outline" : "secondary"}
              size="sm"
              className={cn(
                "shrink-0 gap-1.5 text-xs",
                isUploaded &&
                  "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20",
              )}
              onClick={() => toggle(doc.id)}
            >
              {isUploaded ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  Remove
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
