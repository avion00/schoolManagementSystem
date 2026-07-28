// Creator-facing assignment mock data. Keeps hermes-data.ts intact.

import type { ProjectId } from "./hermes-data";

export type AssignmentStatus =
  | "Assigned"
  | "In Production"
  | "Submitted for Review"
  | "Revision Requested"
  | "Resubmitted"
  | "Approved"
  | "Scheduled"
  | "Published";

export type AssignmentVersion = {
  v: number;
  uploadedAt: string;
  note?: string;
  thumbnail: string;
};

export type AuditEvent = {
  at: string;
  who: string;
  action: string;
  detail?: string;
};

export type Assignment = {
  id: string;
  objective?: string;
  lengthPacing?: string;
  title: string;
  project: ProjectId;
  assetType: "Video 9:16" | "Video 16:9" | "Image" | "Carousel";
  priority: "High" | "Medium" | "Low";
  due: string;
  status: AssignmentStatus;
  assigneeId: string;
  assigneeName: string;
  patternId?: string;
  recipe: {
    script: string;
    shots: string[];
    presenter: string;
    wardrobe: string;
    location: string;
    props: string;
    camera: string;
    onScreenText: string;
    caption: string;
    cta: string;
    hashtags: string;
    thumbnail: string;
  };
  inspirationLinks: { label: string; url: string }[];
  adminComments: { by: string; at: string; text: string }[];
  reviewerNote?: string;
  revisionInstructions?: string;
  revisionRequestedBy?: string;
  revisionRequestedAt?: string;
  versions: AssignmentVersion[];
  audit: AuditEvent[];
  approvedBy?: string;
  approvedAt?: string;
  scheduledFor?: string;
  platform?: string;
};

const baseRecipe = (over: Partial<Assignment["recipe"]>): Assignment["recipe"] => ({
  script:
    "0:00 Hook (2s max). 0:02 Setup — presenter states the mistake. 0:12 Reveal — show the receipt / whiteboard. 0:26 Payoff — one line takeaway. 0:32 CTA line.",
  shots: [
    "Cold open — presenter chest-up, direct to camera",
    "B-roll — hands on paperwork / dashboard",
    "Whiteboard maths — one clean push-in",
    "Cutaway — product screen 1.2s",
    "Close — presenter delivering CTA line",
  ],
  presenter: "Male 35–45, in truck cab, workwear. Non-actor, real fleet manager preferred.",
  wardrobe: "Dark hi-vis or plain workwear. No competitor logos. No sunglasses.",
  location: "Truck cab, daylight. Passenger seat with laptop visible in one shot.",
  props: "Fuel receipts (real, blurred), laptop with FlottaHub demo, whiteboard.",
  camera: "Handheld, 4K, natural light. Chest-up framing. 6–10 cuts total. No music.",
  onScreenText: "Yellow subtitle bar, bottom third. Numbers bolded. Sans-serif.",
  caption:
    "Short. 2 lines max. End verbatim with: 'link in bio for the audit template.'",
  cta: "Free audit template via bio link",
  hashtags: "#fleetmanager #trasporti #FlottaHub",
  thumbnail:
    "Freeze on the €7,400 whiteboard number, presenter face partially visible left.",
  ...over,
});

export const assignments: Assignment[] = [
  {
    id: "a1",
    title: "Fuel-card mistakes — €7,400 hook",
    project: "flottahub",
    assetType: "Video 9:16",
    priority: "High",
    due: "Today",
    status: "Revision Requested",
    assigneeId: "u_anna",
    assigneeName: "Anna R.",
    patternId: "p4",
    recipe: baseRecipe({}),
    inspirationLinks: [
      { label: "Reference reel — TruckerTales", url: "https://www.tiktok.com/@example/video/123" },
      { label: "Winning pattern — Fuel-card mistake list", url: "/patterns" },
    ],
    adminComments: [
      { by: "Mike", at: "Yesterday · 18:20", text: "Hook is good but soften the cut at 0:04 — feels rushed." },
      { by: "Mike", at: "Yesterday · 18:22", text: "Kill the background music at 0:22–0:31. Recipe says no music." },
    ],
    objective:
      "Prove to Italian small-fleet owners that Hermes/FlottaHub catches fuel-card leakage they don't see today, with one concrete number they can't argue with.",
    lengthPacing:
      "35s total. Hook ≤ 2s. 6–10 cuts. No music. Steady pace on the whiteboard reveal, tighter cuts on the CTA.",
    revisionInstructions:
      "1) Extend the hook shot by ~0.5s before the first cut — right now it jumps and the €7,400 number doesn't land.\n2) Remove music between 0:22–0:31 — recipe explicitly says no music. It's still faintly audible in v2.\n3) Bold the €7,400 figure on-screen and hold it at least 1.2s so it can be screenshotted.\n4) Keep everything else as-is — the presenter and framing are working.",
    revisionRequestedBy: "Mike",
    revisionRequestedAt: "Yesterday · 18:22",
    versions: [
      { v: 1, uploadedAt: "3 days ago", note: "Initial submission.", thumbnail: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80" },
      { v: 2, uploadedAt: "Yesterday", note: "First revision after CMO note.", thumbnail: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80" },
    ],
    audit: [
      { at: "5 days ago · 10:04", who: "Mike", action: "Assignment created", detail: "Pattern: Fuel-card mistake list" },
      { at: "5 days ago · 11:20", who: "Anna R.", action: "Opened task" },
      { at: "3 days ago · 16:40", who: "Anna R.", action: "Uploaded v1" },
      { at: "3 days ago · 16:41", who: "Anna R.", action: "Submitted for review" },
      { at: "2 days ago · 09:12", who: "Mike", action: "Requested revision", detail: "Music present at 0:22–0:31" },
      { at: "Yesterday · 15:02", who: "Anna R.", action: "Uploaded v2" },
      { at: "Yesterday · 15:03", who: "Anna R.", action: "Resubmitted" },
      { at: "Yesterday · 18:22", who: "Mike", action: "Requested revision", detail: "Music still audible; tighten hook" },
    ],
  },
  {
    id: "a2",
    title: "Vet POV kitchen tour",
    project: "hartley",
    assetType: "Video 9:16",
    priority: "High",
    due: "Fri",
    status: "In Production",
    assigneeId: "u_anna",
    assigneeName: "Anna R.",
    patternId: "p2",
    recipe: baseRecipe({
      presenter: "Vet, female 35–50, in a home kitchen (not a clinic).",
      location: "Bright home kitchen, Yorkshire. Wooden counter.",
      props: "Four labeled ingredient bowls, Hartley recipe card, wooden spoon.",
      hashtags: "#dogfood #freshfood #hartleydogs",
      cta: "Try your first box at 50% off",
    }),
    inspirationLinks: [
      { label: "Reference — Vet-in-kitchen POV", url: "https://www.instagram.com/reel/example" },
    ],
    adminComments: [
      { by: "Mike", at: "2 days ago", text: "Please shoot in daylight only. No overhead spots." },
    ],
    versions: [],
    audit: [
      { at: "2 days ago", who: "Mike", action: "Assignment created" },
      { at: "2 days ago", who: "Anna R.", action: "Opened task" },
      { at: "Today · 08:10", who: "Anna R.", action: "Started production" },
    ],
  },
  {
    id: "a3",
    title: "One-man-band math — whiteboard",
    project: "apex",
    assetType: "Video 9:16",
    priority: "Medium",
    due: "Wed",
    status: "Assigned",
    assigneeId: "u_tom",
    assigneeName: "Tom H.",
    patternId: "p3",
    recipe: baseRecipe({
      presenter: "Real tradesperson at their van. No actor.",
      location: "Van door open, whiteboard on the inside.",
      props: "Whiteboard, marker, phone showing 14 missed calls.",
      cta: "See how it works — no app to install",
      hashtags: "#tradesman #plumber #APEXAIDesk",
    }),
    inspirationLinks: [
      { label: "Sparky Dan reference", url: "https://www.tiktok.com/@sparky_dan" },
    ],
    adminComments: [],
    versions: [],
    audit: [{ at: "Today · 09:00", who: "Mike", action: "Assignment created" }],
  },
  {
    id: "a4",
    title: "Yorkshire kitchen b-roll",
    project: "hartley",
    assetType: "Video 9:16",
    priority: "Medium",
    due: "Today",
    status: "Submitted for Review",
    assigneeId: "u_anna",
    assigneeName: "Anna R.",
    recipe: baseRecipe({
      presenter: "No on-camera presenter — hands only.",
      location: "Hartley production kitchen.",
      camera: "Fixed tripod + one handheld push-in. 8–12 cuts.",
    }),
    inspirationLinks: [],
    adminComments: [],
    versions: [
      { v: 1, uploadedAt: "1h ago", note: "First take — happy with the ingredient shot.", thumbnail: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600&q=80" },
    ],
    audit: [
      { at: "3 days ago", who: "Mike", action: "Assignment created" },
      { at: "1h ago", who: "Anna R.", action: "Uploaded v1" },
      { at: "1h ago", who: "Anna R.", action: "Submitted for review" },
    ],
  },
  {
    id: "a5",
    title: "Missed call receipt reel",
    project: "apex",
    assetType: "Video 9:16",
    priority: "High",
    due: "Mon 09:00",
    status: "Approved",
    assigneeId: "u_tom",
    assigneeName: "Tom H.",
    recipe: baseRecipe({}),
    inspirationLinks: [],
    adminComments: [],
    versions: [
      { v: 1, uploadedAt: "4 days ago", note: "Initial.", thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80" },
      { v: 2, uploadedAt: "2 days ago", note: "Tightened hook.", thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80" },
    ],
    audit: [
      { at: "5 days ago", who: "Mike", action: "Assignment created" },
      { at: "4 days ago", who: "Tom H.", action: "Uploaded v1" },
      { at: "3 days ago", who: "Mike", action: "Requested revision" },
      { at: "2 days ago", who: "Tom H.", action: "Uploaded v2" },
      { at: "Today · 07:44", who: "Mike", action: "Approved", detail: "Sent to publishing calendar for Mon 09:00" },
    ],
    approvedBy: "Mike",
    approvedAt: "Today · 07:44",
    scheduledFor: "Mon 09:00",
    platform: "TikTok",
  },
  {
    id: "a6",
    title: "Fuel-card mistakes — IT edit",
    project: "flottahub",
    assetType: "Video 9:16",
    priority: "Medium",
    due: "Tue 12:30",
    status: "Scheduled",
    assigneeId: "u_marco",
    assigneeName: "Marco G.",
    recipe: baseRecipe({ hashtags: "#trasporti #FlottaHub #camionista" } as any),
    inspirationLinks: [],
    adminComments: [],
    versions: [
      { v: 1, uploadedAt: "3 days ago", thumbnail: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80" },
    ],
    audit: [
      { at: "5 days ago", who: "Mike", action: "Assignment created" },
      { at: "3 days ago", who: "Marco G.", action: "Submitted for review" },
      { at: "2 days ago", who: "Sara V.", action: "Approved" },
      { at: "2 days ago", who: "Sara V.", action: "Scheduled", detail: "Tue 12:30 · Instagram" },
    ],
    approvedBy: "Sara V.",
    approvedAt: "2 days ago",
    scheduledFor: "Tue 12:30",
    platform: "Instagram",
  },
  {
    id: "a7",
    title: "APEX intro — TikTok",
    project: "apex",
    assetType: "Video 9:16",
    priority: "Low",
    due: "3d ago",
    status: "Published",
    assigneeId: "u_tom",
    assigneeName: "Tom H.",
    recipe: baseRecipe({}),
    inspirationLinks: [],
    adminComments: [],
    versions: [
      { v: 1, uploadedAt: "1 week ago", thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80" },
    ],
    audit: [
      { at: "1 week ago", who: "Tom H.", action: "Submitted for review" },
      { at: "6 days ago", who: "Mike", action: "Approved" },
      { at: "3 days ago", who: "System", action: "Published", detail: "TikTok · @apexaidesk" },
    ],
    platform: "TikTok",
  },
];

export function assignmentsFor(userId: string) {
  return assignments.filter((a) => a.assigneeId === userId);
}

export const statusTone: Record<AssignmentStatus, { chip: string; dot: string; label: string }> = {
  "Assigned": { chip: "bg-primary/10 text-primary", dot: "bg-primary", label: "New assignment — read the recipe and start production" },
  "In Production": { chip: "bg-ember/15 text-ember", dot: "bg-ember", label: "You're producing this — upload when ready" },
  "Submitted for Review": { chip: "bg-amber/15 text-amber", dot: "bg-amber", label: "Waiting for reviewer" },
  "Revision Requested": { chip: "bg-rose/15 text-rose", dot: "bg-rose", label: "Revision requested — read notes and upload a new version" },
  "Resubmitted": { chip: "bg-amber/15 text-amber", dot: "bg-amber", label: "New version sent back to review" },
  "Approved": { chip: "bg-mint/15 text-mint", dot: "bg-mint", label: "Approved — moving to publishing" },
  "Scheduled": { chip: "bg-primary/10 text-primary", dot: "bg-primary", label: "Scheduled for publishing" },
  "Published": { chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", label: "Live" },
};
