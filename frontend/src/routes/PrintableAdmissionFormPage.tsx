import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PrintableAdmissionForm } from "@/components/students/forms/PrintableAdmissionForm";
import { Button } from "@/components/ui/button";

/* Inject @media print CSS so only #admission-form-print is visible when printing.
   Cleans up the style tag on unmount. */
function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        @page { size: A4; margin: 12mm; }
        body > * { visibility: hidden !important; }
        #admission-form-print,
        #admission-form-print * { visibility: visible !important; }
        #admission-form-print {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          background: #fff !important;
        }
        .print-actions { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

export function PrintableAdmissionFormPage() {
  usePrintStyles();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="print-actions flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground">
          Click Print to generate a blank admission form for manual completion.
        </p>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" />
          Print Form
        </Button>
      </div>

      {/* ── Form preview ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <PrintableAdmissionForm />
      </div>
    </div>
  );
}
