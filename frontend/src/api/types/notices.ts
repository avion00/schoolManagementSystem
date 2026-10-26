/** Notice view models (staff notice board and readers), built by `src/api/notices.ts`. */
export type NoticePriority = "Low" | "Normal" | "High" | "Urgent";
export type NoticeStatus   = "Draft" | "Scheduled" | "Published" | "Archived";
export type NoticeCategory =
  | "General" | "Exam" | "Fees" | "Holiday" | "Event" | "Meeting"
  | "Emergency" | "Academic" | "Transport" | "Hostel" | "Library";
export type AudienceType =
  | "All" | "Students" | "Parents" | "Teachers" | "Staff" | "Students & Parents";

export interface NoticeAttachment {
  id:   string;
  name: string;
  type: "PDF" | "Image" | "Document" | "Spreadsheet" | "File";
  size: string;
  downloadUrl: string;
}

export interface NoticeStats {
  /** Audience size; only known on the details page (null in lists). */
  totalRecipients: number | null;
  read:            number;
  unread:          number | null;
  acknowledged:    number;
}

export interface RecipientRecord {
  id:           string;
  name:         string;
  email:        string;
  role:         "Student" | "Parent" | "Teacher" | "Staff";
  classSection: string;
  readStatus:   "Read" | "Unread";
  readTime?:    string;
  acknowledged: boolean;
}

export interface ActivityRecord {
  id:     string;
  action: string;
  by:     string;
  at:     string;
  icon:   "create" | "edit" | "publish" | "archive" | "read" | "approve";
}

export interface Notice {
  id:              string;
  noticeId:        string;
  title:           string;
  category:        NoticeCategory;
  priority:        NoticePriority;
  status:          NoticeStatus;
  audience:        AudienceType;
  targetClassIds:  string[];
  targetSectionIds: string[];
  targetClasses:   string[];
  targetSections:  string[];
  summary:         string;
  body:            string;
  importantInstructions?: string;
  externalLink?:   string;
  publishedBy:     string;
  createdBy:       string;
  createdAt:       string;
  publishAt:       string | null;   // ISO datetime
  publishDate:     string;
  publishTime:     string;
  expiryDate?:     string;
  pinned:          boolean;
  requiresAcknowledgement: boolean;
  sendNotification: boolean;
  sendEmail:       boolean;
  sendSms:         boolean;
  attachments:     NoticeAttachment[];
  stats:           NoticeStats;
  internalNotes?:  string;
}

export const NOTICE_CATEGORY_OPTIONS: NoticeCategory[] = [
  "General", "Exam", "Fees", "Holiday", "Event", "Meeting",
  "Emergency", "Academic", "Transport", "Hostel", "Library",
];
export const NOTICE_PRIORITY_OPTIONS: NoticePriority[] = ["Low", "Normal", "High", "Urgent"];
export const NOTICE_STATUS_OPTIONS: NoticeStatus[] = ["Draft", "Scheduled", "Published", "Archived"];
export const NOTICE_AUDIENCE_OPTIONS: AudienceType[] = [
  "All", "Students", "Parents", "Teachers", "Staff", "Students & Parents",
];
