import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintableParentForm } from "@/components/parents/forms/PrintableParentForm";

function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body > *:not(#parent-form-print-root) { display: none !important; }
        #parent-form-print { display: block !important; }
        .print-actions { display: none !important; }
        @page { size: A4; margin: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

export function PrintableParentFormPage() {
  usePrintStyles();
  const navigate = useNavigate();

  return (
    <div id="parent-form-print-root">
      <div className="print-actions mb-4 flex items-center gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" />Print Form
        </Button>
      </div>
      <PrintableParentForm />
    </div>
  );
}
