import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PrintableTeacherForm } from "@/components/teachers/forms/PrintableTeacherForm";
import { Button } from "@/components/ui/button";

function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        @page { size: A4; margin: 12mm; }
        body > * { visibility: hidden !important; }
        #teacher-form-print,
        #teacher-form-print * { visibility: visible !important; }
        #teacher-form-print {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          background: #fff !important;
        }
        .teacher-print-actions { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

export function PrintableTeacherFormPage() {
  usePrintStyles();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="teacher-print-actions flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground">
          Click Print to generate a blank staff registration form for manual completion.
        </p>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" />
          Print Form
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <PrintableTeacherForm />
      </div>
    </div>
  );
}
