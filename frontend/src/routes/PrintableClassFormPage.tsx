import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintableClassForm } from "@/components/classes/forms/PrintableClassForm";

function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body > *:not(#class-form-print-root) { display: none !important; }
        #class-form-print { display: block !important; }
        .print-actions { display: none !important; }
        @page { size: A4; margin: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

export function PrintableClassFormPage() {
  usePrintStyles();
  const navigate = useNavigate();
  return (
    <div id="class-form-print-root">
      <div className="print-actions mb-4 flex items-center gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" />Print Form
        </Button>
      </div>
      <PrintableClassForm />
    </div>
  );
}
