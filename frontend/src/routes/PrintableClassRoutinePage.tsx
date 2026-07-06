import { useEffect, useState }      from "react";
import { useNavigate }               from "react-router-dom";
import { ArrowLeft, Printer }        from "lucide-react";
import { Button }                    from "@/components/ui/button";
import { PrintableClassRoutine }     from "@/components/classRoutine/PrintableClassRoutine";
import { CLASS_OPTIONS, SECTION_OPTIONS, ACADEMIC_YEAR_OPTIONS, ROUTINES } from "@/data/classRoutineData";

function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #class-routine-print { display: block !important; }
        .print\\:hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
}

// derive available classes from actual data
const dataClasses  = [...new Set(ROUTINES.map((r) => r.className))].sort();
const dataSections = (cls: string) => [...new Set(ROUTINES.filter((r) => r.className === cls).map((r) => r.section))].sort();

export function PrintableClassRoutinePage() {
  usePrintStyles();
  const navigate = useNavigate();

  const [selClass,   setSelClass]   = useState(dataClasses[0] ?? "Grade 6");
  const [selSection, setSelSection] = useState("A");
  const [selYear,    setSelYear]    = useState("2026/27");

  const sectionOpts = dataSections(selClass);

  return (
    <div>
      {/* controls */}
      <div className="print:hidden mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]"
          onClick={() => navigate(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" />Back
        </Button>

        <select value={selClass}
          onChange={(e) => { setSelClass(e.target.value); setSelSection("A"); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {dataClasses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selSection} onChange={(e) => setSelSection(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {sectionOpts.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select value={selYear} onChange={(e) => setSelYear(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {ACADEMIC_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <Button size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" />Print
        </Button>
        <span className="text-[11px] text-muted-foreground">A4 · Portrait · Use browser print dialog</span>
      </div>

      <PrintableClassRoutine className={selClass} section={selSection} academicYear={selYear} />
    </div>
  );
}
