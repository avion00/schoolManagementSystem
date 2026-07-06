import { useEffect }             from "react";
import { useNavigate }           from "react-router-dom";
import { ArrowLeft, Printer }    from "lucide-react";
import { Button }                from "@/components/ui/button";
import { PrintableSubjectForm }  from "@/components/subjects/forms/PrintableSubjectForm";

function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #subject-form-print { display: block !important; }
        .print\\:hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

export function PrintableSubjectFormPage() {
  usePrintStyles();
  const navigate = useNavigate();

  return (
    <div>
      {/* controls */}
      <div className="print:hidden mb-4 flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]"
          onClick={() => navigate(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" />Back
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-[11px]"
          onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" />Print
        </Button>
        <span className="text-[11px] text-muted-foreground">
          Use your browser's print dialog · Recommended: A4 paper, portrait
        </span>
      </div>

      <PrintableSubjectForm />
    </div>
  );
}
