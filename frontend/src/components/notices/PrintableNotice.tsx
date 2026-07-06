import type { Notice } from "@/data/noticesData";

export function PrintableNotice({ notice }: { notice: Notice }) {
  return (
    <div className="hidden print:block bg-white text-black p-10 font-sans">
      {/* School header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest">SchoolOS Academy</h1>
        <p className="text-sm text-gray-600 mt-0.5">Official School Notice</p>
      </div>

      {/* Notice meta */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6 text-sm">
        <div><span className="font-bold">Notice ID:</span> {notice.noticeId}</div>
        <div><span className="font-bold">Category:</span> {notice.category}</div>
        <div><span className="font-bold">Priority:</span> {notice.priority}</div>
        <div><span className="font-bold">Status:</span> {notice.status}</div>
        <div><span className="font-bold">Published By:</span> {notice.publishedBy}</div>
        <div><span className="font-bold">Publish Date:</span> {notice.publishDate || "—"} {notice.publishTime}</div>
        <div><span className="font-bold">Audience:</span> {notice.audience}</div>
        {notice.expiryDate && <div><span className="font-bold">Expiry Date:</span> {notice.expiryDate}</div>}
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold border border-black rounded p-3 bg-gray-50 mb-5 text-center">
        {notice.title}
      </h2>

      {/* Target classes */}
      {notice.targetClasses.length > 0 && (
        <p className="text-sm mb-4">
          <strong>For:</strong> {notice.targetClasses.join(", ")}
          {notice.targetSections.length > 0 && ` · Section ${notice.targetSections.join(", ")}`}
        </p>
      )}

      {/* Body */}
      <div className="text-sm leading-relaxed whitespace-pre-line mb-6 border-t border-gray-200 pt-4">
        {notice.body}
      </div>

      {/* Important instructions */}
      {notice.importantInstructions && (
        <div className="border border-black rounded p-3 mb-6">
          <p className="font-bold text-sm mb-1">Important Instructions:</p>
          <p className="text-sm">{notice.importantInstructions}</p>
        </div>
      )}

      {/* Attachments list */}
      {notice.attachments.length > 0 && (
        <div className="mb-6 text-sm">
          <p className="font-bold mb-2">Attachments:</p>
          <ul className="list-disc list-inside text-gray-700">
            {notice.attachments.map((a) => (
              <li key={a.id}>{a.name} ({a.size})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature area */}
      <div className="mt-12 border-t border-black pt-4 grid grid-cols-2 gap-10 text-sm">
        <div>
          <div className="border-b border-black h-10 mb-1" />
          <p className="font-bold">Class Teacher / Issuing Authority</p>
          <p className="text-gray-600">{notice.publishedBy}</p>
          <p className="text-gray-600">Date: _______________</p>
        </div>
        <div>
          <div className="border-b border-black h-10 mb-1" />
          <p className="font-bold">Principal / Admin Approval</p>
          <p className="text-gray-600">Date: _______________</p>
          <p className="text-gray-600">School Seal:</p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-8 border-t border-gray-200 pt-4">
        This is an official notice from SchoolOS Academy. For queries contact: info@schoolos.edu
      </p>
    </div>
  );
}
