export type Day           = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type Shift         = "Morning" | "Day" | "Evening";
export type RoutineStatus = "active" | "inactive" | "suspended";

export interface RoutineEntry {
  id: number;
  routineId: string;
  academicYear: string;
  className: string;
  section: string;
  day: Day;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number;
  periodNo: number;
  shift: Shift;
  status: RoutineStatus;
  notes: string;
}

// ─── filter options ──────────────────────────────────────────────────────────
export const SCHOOL_DAYS: Day[]          = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
export const SHIFT_OPTIONS: Shift[]      = ["Morning","Day","Evening"];
export const STATUS_OPTIONS: RoutineStatus[] = ["active","inactive","suspended"];
export const ACADEMIC_YEAR_OPTIONS       = ["2026/27","2025/26","2024/25"];
export const CLASS_OPTIONS               = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
export const SECTION_OPTIONS             = ["A","B","C","D"];
export const TEACHER_OPTIONS             = [
  "Andrew Martin","Sarah Johnson","Richi Hassan","Santosh Bista","Priya Sharma",
  "Mark Willy","Sita Rai","Sunita Gurung","Ramesh Adhikari","Kavita Joshi",
  "Binod Karki","Mira Shrestha","Pratik Shah","Anita Rana","Kazi Fahim","Deepa Shrestha",
];
export const SUBJECT_OPTIONS             = [
  "English","English Advanced","Mathematics Primary","Mathematics Middle","Mathematics Secondary",
  "Science Primary","Science Middle","Nepali","Social Studies","Computer Science","Moral Science",
  "Drawing & Arts","Health & Physical Education","Optional Mathematics","Environmental Science",
  "History","Geography","Account","Economics","Physics","Chemistry","Biology",
];
export const ROOM_OPTIONS                = [
  "Room 101","Room 201","Room 202","Room 203","Room 204","Room 205",
  "Lab A","Computer Lab","Art Room","Music Room","Playground","Language Lab",
  "Physics Lab","Chemistry Lab","Biology Lab","Room 301","Room 302",
];

// ─── period definitions ──────────────────────────────────────────────────────
export const MORNING_PERIODS = [
  { period: 1, start: "6:45 AM",  end: "7:30 AM",  duration: 45 },
  { period: 2, start: "7:30 AM",  end: "8:15 AM",  duration: 45 },
  { period: 3, start: "8:15 AM",  end: "9:00 AM",  duration: 45 },
  { period: 4, start: "9:15 AM",  end: "10:00 AM", duration: 45 },
  { period: 5, start: "10:00 AM", end: "10:45 AM", duration: 45 },
  { period: 6, start: "10:45 AM", end: "11:30 AM", duration: 45 },
  { period: 7, start: "11:30 AM", end: "12:15 PM", duration: 45 },
] as const;

export const DAY_PERIODS = [
  { period: 1, start: "12:30 PM", end: "1:15 PM",  duration: 45 },
  { period: 2, start: "1:15 PM",  end: "2:00 PM",  duration: 45 },
  { period: 3, start: "2:00 PM",  end: "2:45 PM",  duration: 45 },
  { period: 4, start: "3:00 PM",  end: "3:45 PM",  duration: 45 },
  { period: 5, start: "3:45 PM",  end: "4:30 PM",  duration: 45 },
  { period: 6, start: "4:30 PM",  end: "5:15 PM",  duration: 45 },
] as const;

// ─── subject metadata per class group ────────────────────────────────────────
interface SubMeta { name: string; teacher: string; room: string }

const G6_META: Record<string, SubMeta> = {
  ENG:  { name: "English",                       teacher: "Andrew Martin",  room: "Room 201"    },
  MATH: { name: "Mathematics Primary",            teacher: "Richi Hassan",   room: "Room 202"    },
  SCI:  { name: "Science Primary",               teacher: "Priya Sharma",   room: "Lab A"       },
  NEP:  { name: "Nepali",                        teacher: "Kavita Joshi",   room: "Room 205"    },
  SOC:  { name: "Social Studies",                teacher: "Sunita Gurung",  room: "Room 204"    },
  CS:   { name: "Computer Science",              teacher: "Sita Rai",       room: "Computer Lab"},
  MORA: { name: "Moral Science",                 teacher: "Deepa Shrestha", room: "Room 101"    },
  ARTS: { name: "Drawing & Arts",               teacher: "Deepa Shrestha", room: "Art Room"    },
  HPE:  { name: "Health & Physical Education",   teacher: "Kazi Fahim",     room: "Playground"  },
};

const G7_META: Record<string, SubMeta> = {
  ENG:   { name: "English",                      teacher: "Sarah Johnson",  room: "Room 201"    },
  MATH:  { name: "Mathematics Middle",           teacher: "Santosh Bista",  room: "Room 202"    },
  SCI:   { name: "Science Middle",               teacher: "Mark Willy",     room: "Lab A"       },
  NEP:   { name: "Nepali",                       teacher: "Kavita Joshi",   room: "Room 205"    },
  SOC:   { name: "Social Studies",               teacher: "Sunita Gurung",  room: "Room 204"    },
  CS:    { name: "Computer Science",             teacher: "Sita Rai",       room: "Computer Lab"},
  OMATH: { name: "Optional Mathematics",         teacher: "Binod Karki",    room: "Room 203"    },
  ENV:   { name: "Environmental Science",        teacher: "Priya Sharma",   room: "Lab A"       },
};

const G8_META: Record<string, SubMeta> = {
  ENG:  { name: "English Advanced",              teacher: "Andrew Martin",  room: "Room 201"    },
  MATH: { name: "Mathematics Secondary",         teacher: "Santosh Bista",  room: "Room 202"    },
  SCI:  { name: "Science Middle",                teacher: "Mark Willy",     room: "Lab A"       },
  NEP:  { name: "Nepali",                        teacher: "Kavita Joshi",   room: "Room 205"    },
  SOC:  { name: "Social Studies",                teacher: "Sunita Gurung",  room: "Room 204"    },
  CS:   { name: "Computer Science",              teacher: "Sita Rai",       room: "Computer Lab"},
  GEO:  { name: "Geography",                     teacher: "Ramesh Adhikari",room: "Room 204"    },
  HIS:  { name: "History",                       teacher: "Ramesh Adhikari",room: "Room 204"    },
};

const G9_META: Record<string, SubMeta> = {
  ENG:  { name: "English Advanced",              teacher: "Sarah Johnson",  room: "Room 201"    },
  MATH: { name: "Mathematics Secondary",         teacher: "Richi Hassan",   room: "Room 202"    },
  SCI:  { name: "Science Middle",                teacher: "Mark Willy",     room: "Lab A"       },
  NEP:  { name: "Nepali",                        teacher: "Kavita Joshi",   room: "Room 205"    },
  ACC:  { name: "Account",                       teacher: "Binod Karki",    room: "Room 301"    },
  CS:   { name: "Computer Science",              teacher: "Sita Rai",       room: "Computer Lab"},
  OMATH:{ name: "Optional Mathematics",          teacher: "Santosh Bista",  room: "Room 203"    },
  HIS:  { name: "History",                       teacher: "Ramesh Adhikari",room: "Room 204"    },
};

// ─── schedule matrices ────────────────────────────────────────────────────────
// Each row = one school day; each element = subject code for that period
type SchedMap = Partial<Record<Day, string[]>>;

const G6A_SCH: SchedMap = {
  Sunday:    ["ENG","MATH","SCI","NEP","SOC","CS","MORA"],
  Monday:    ["MATH","ENG","NEP","SCI","CS","SOC","ARTS"],
  Tuesday:   ["NEP","SCI","ENG","MATH","HPE","SOC","CS"],
  Wednesday: ["SCI","MATH","ENG","CS","NEP","SOC","MORA"],
  Thursday:  ["SOC","ENG","MATH","NEP","SCI","ARTS","HPE"],
  Friday:    ["CS","NEP","MATH","ENG","SOC","MORA","SCI"],
};

const G6B_SCH: SchedMap = {
  Sunday:    ["MATH","ENG","NEP","SCI","MORA","SOC","CS"],
  Monday:    ["SCI","MATH","ENG","CS","SOC","NEP","ARTS"],
  Tuesday:   ["ENG","NEP","SCI","MATH","SOC","CS","HPE"],
  Wednesday: ["NEP","SCI","MATH","SOC","ENG","MORA","CS"],
  Thursday:  ["CS","ENG","SOC","MATH","ARTS","SCI","NEP"],
  Friday:    ["SOC","CS","ENG","NEP","MATH","HPE","SCI"],
};

const G7A_SCH: SchedMap = {
  Sunday:    ["MATH","ENG","OMATH","SCI","SOC","ENV","CS"],
  Monday:    ["ENG","OMATH","MATH","NEP","SCI","CS","SOC"],
  Tuesday:   ["SCI","MATH","ENG","OMATH","CS","SOC","ENV"],
  Wednesday: ["NEP","SCI","OMATH","MATH","ENG","SOC","CS"],
  Thursday:  ["CS","ENG","SCI","SOC","MATH","OMATH","NEP"],
  Friday:    ["SOC","NEP","CS","ENG","OMATH","SCI","MATH"],
};

const G7B_SCH: SchedMap = {
  Sunday:    ["ENG","MATH","SCI","OMATH","CS","NEP","SOC"],
  Monday:    ["OMATH","SCI","ENG","MATH","NEP","SOC","CS"],
  Tuesday:   ["MATH","OMATH","NEP","SCI","SOC","ENG","ENV"],
  Wednesday: ["SCI","ENG","MATH","NEP","SOC","CS","OMATH"],
  Thursday:  ["NEP","CS","SOC","ENG","SCI","MATH","OMATH"],
  Friday:    ["CS","SOC","OMATH","MATH","ENG","NEP","SCI"],
};

const G8A_SCH: SchedMap = {
  Sunday:    ["ENG","MATH","SCI","NEP","SOC","CS"],
  Monday:    ["MATH","ENG","NEP","SCI","CS","GEO"],
  Tuesday:   ["NEP","SCI","ENG","MATH","HIS","SOC"],
  Wednesday: ["SCI","MATH","ENG","CS","NEP","HIS"],
  Thursday:  ["SOC","ENG","MATH","NEP","SCI","CS"],
  Friday:    ["CS","NEP","MATH","ENG","GEO","SCI"],
};

const G9A_SCH: SchedMap = {
  Sunday:    ["ENG","MATH","NEP","SCI","ACC","CS"],
  Monday:    ["MATH","ENG","ACC","NEP","CS","OMATH"],
  Tuesday:   ["NEP","SCI","ENG","MATH","HIS","ACC"],
  Wednesday: ["SCI","MATH","NEP","ENG","OMATH","CS"],
  Thursday:  ["ACC","ENG","MATH","NEP","SCI","HIS"],
  Friday:    ["CS","NEP","ENG","MATH","ACC","SCI"],
};

// ─── generator ───────────────────────────────────────────────────────────────
function genEntries(
  className: string,
  section: string,
  shift: Shift,
  meta: Record<string, SubMeta>,
  sched: SchedMap,
  periods: readonly { period: number; start: string; end: string; duration: number }[],
): Omit<RoutineEntry, "id">[] {
  const code = className.replace("Grade ", "G") + section;
  const entries: Omit<RoutineEntry, "id">[] = [];

  for (const [day, subs] of Object.entries(sched) as [Day, string[]][]) {
    subs.forEach((subCode, idx) => {
      const p = periods[idx];
      const m = meta[subCode];
      if (!p || !m) return;
      entries.push({
        routineId:   `RT-${code}-${day.slice(0, 3).toUpperCase()}-P${p.period}`,
        academicYear: "2026/27",
        className, section, day,
        subject:    m.name,
        teacher:    m.teacher,
        room:       m.room,
        startTime:  p.start,
        endTime:    p.end,
        duration:   p.duration,
        periodNo:   p.period,
        shift,
        status:     "active",
        notes:      "",
      });
    });
  }
  return entries;
}

// ─── assemble all routines ───────────────────────────────────────────────────
const raw = [
  ...genEntries("Grade 6", "A", "Morning", G6_META, G6A_SCH, MORNING_PERIODS),
  ...genEntries("Grade 6", "B", "Morning", G6_META, G6B_SCH, MORNING_PERIODS),
  ...genEntries("Grade 7", "A", "Morning", G7_META, G7A_SCH, MORNING_PERIODS),
  ...genEntries("Grade 7", "B", "Morning", G7_META, G7B_SCH, MORNING_PERIODS),
  ...genEntries("Grade 8", "A", "Day",     G8_META, G8A_SCH, DAY_PERIODS),
  ...genEntries("Grade 9", "A", "Day",     G9_META, G9A_SCH, DAY_PERIODS),
];

// Add a few inactive/suspended entries for variety
const OVERRIDES: Partial<RoutineEntry>[] = [
  { routineId: "RT-G6A-FRI-P7", status: "inactive", notes: "Teacher on leave" },
  { routineId: "RT-G7A-THU-P6", status: "suspended",notes: "Room under maintenance" },
  { routineId: "RT-G8A-WED-P4", status: "inactive", notes: "Substitution pending" },
];

export const ROUTINES: RoutineEntry[] = raw.map((e, i) => {
  const ov = OVERRIDES.find((o) => o.routineId === e.routineId) ?? {};
  return { ...e, ...ov, id: i + 1 } as RoutineEntry;
});

// ─── conflict detection ──────────────────────────────────────────────────────
export interface ConflictPair { id1: number; id2: number; teacher: string; day: Day; periodNo: number }

export function detectConflicts(entries: RoutineEntry[]): ConflictPair[] {
  const conflicts: ConflictPair[] = [];
  const map = new Map<string, RoutineEntry[]>();
  for (const e of entries) {
    if (e.status !== "active") continue;
    const key = `${e.teacher}|${e.day}|${e.periodNo}`;
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  for (const list of map.values()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        conflicts.push({ id1: list[i].id, id2: list[j].id, teacher: list[i].teacher, day: list[i].day, periodNo: list[i].periodNo });
      }
    }
  }
  return conflicts;
}

// ─── computed stats ──────────────────────────────────────────────────────────
const _conflicts = detectConflicts(ROUTINES);

export const ROUTINE_STATS = {
  total:           ROUTINES.length,
  activeClasses:   new Set(ROUTINES.filter((r) => r.status === "active").map((r) => `${r.className}${r.section}`)).size,
  teachers:        new Set(ROUTINES.map((r) => r.teacher)).size,
  weeklyPeriods:   ROUTINES.filter((r) => r.status === "active").length,
  freePeriods:     0,
  conflicts:       _conflicts.length,
};

export const CONFLICT_IDS = new Set(_conflicts.flatMap((c) => [c.id1, c.id2]));
