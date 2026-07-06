export type ParentStatus = "active" | "inactive" | "blocked";
export type ParentGender = "Male" | "Female";
export type ParentRelation = "Father" | "Mother" | "Guardian" | "Uncle" | "Aunt" | "Grandfather" | "Grandmother";

export interface LinkedChild {
  id: number;
  studentId: number;
  name: string;
  admissionNo: string;
  registrationNo: string;
  className: string;
  section: string;
  roll: number;
  gender: "Male" | "Female";
  status: "active" | "inactive" | "transferred" | "graduated";
}

export interface Parent {
  id: number;
  parentId: string;
  guardianCode: string;
  name: string;
  gender: ParentGender;
  relation: ParentRelation;
  occupation: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  status: ParentStatus;
  linkedChildren: LinkedChild[];
}

export const OCCUPATION_OPTIONS = [
  "Businessman", "Doctor", "Engineer", "Teacher", "Nurse", "Accountant",
  "Lawyer", "Banker", "Architect", "Farmer", "Housewife", "Manager",
  "Software Engineer", "Shopkeeper", "Contractor", "Journalist", "Designer",
  "Retired", "Electrician",
];

export const RELATION_OPTIONS: ParentRelation[] = [
  "Father", "Mother", "Guardian", "Uncle", "Aunt", "Grandfather", "Grandmother",
];

export const STATUS_OPTIONS: ParentStatus[] = ["active", "inactive", "blocked"];

export const CLASS_OPTIONS = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

export const SECTION_OPTIONS = ["A", "B", "C", "D"];

/* ── 30 parent records ───────────────────────────────────────────────────── */
export const PARENTS: Parent[] = [
  {
    id: 1, parentId: "PAR-2026-0001", guardianCode: "GRD-001",
    name: "Kazi Fahim", gender: "Male", relation: "Father", occupation: "Businessman",
    phone: "+977-9841000001", alternatePhone: "+977-9841000011", email: "kazi.fahim@example.com",
    address: "Kathmandu, Bagmati Province", status: "active",
    linkedChildren: [
      { id: 1, studentId: 1, name: "Richi Hassan",  admissionNo: "ADM-2901", registrationNo: "REG-2026-001", className: "Grade 2",  section: "A", roll: 29, gender: "Female", status: "active" },
      { id: 2, studentId: 2, name: "Mark Willy",    admissionNo: "ADM-2959", registrationNo: "REG-2026-002", className: "Grade 6",  section: "B", roll: 59, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 2, parentId: "PAR-2026-0002", guardianCode: "GRD-002",
    name: "Priya Sharma", gender: "Female", relation: "Mother", occupation: "Doctor",
    phone: "+977-9841000002", alternatePhone: "+977-9841000012", email: "priya.sharma@example.com",
    address: "Lalitpur, Bagmati Province", status: "active",
    linkedChildren: [
      { id: 3, studentId: 3, name: "Rohan Sharma",  admissionNo: "ADM-2902", registrationNo: "REG-2026-003", className: "Grade 9",  section: "A", roll: 12, gender: "Male",   status: "active" },
      { id: 4, studentId: 4, name: "Meena Sharma",  admissionNo: "ADM-2903", registrationNo: "REG-2026-004", className: "Grade 7",  section: "C", roll: 18, gender: "Female", status: "active" },
    ],
  },
  {
    id: 3, parentId: "PAR-2026-0003", guardianCode: "GRD-003",
    name: "Tom Baker", gender: "Male", relation: "Father", occupation: "Engineer",
    phone: "+977-9841000003", alternatePhone: "", email: "tom.baker@example.com",
    address: "Bhaktapur, Bagmati Province", status: "active",
    linkedChildren: [
      { id: 5, studentId: 5, name: "Emma Baker",    admissionNo: "ADM-2904", registrationNo: "REG-2026-005", className: "Grade 10", section: "B", roll: 22, gender: "Female", status: "active" },
    ],
  },
  {
    id: 4, parentId: "PAR-2026-0004", guardianCode: "GRD-004",
    name: "Anita Patel", gender: "Female", relation: "Mother", occupation: "Teacher",
    phone: "+977-9851000004", alternatePhone: "+977-9851000014", email: "anita.patel@example.com",
    address: "Kirtipur, Kathmandu", status: "active",
    linkedChildren: [
      { id: 6, studentId: 6, name: "Arjun Patel",   admissionNo: "ADM-2905", registrationNo: "REG-2026-006", className: "Grade 8",  section: "A", roll: 5,  gender: "Male",   status: "active" },
      { id: 7, studentId: 7, name: "Sonia Patel",   admissionNo: "ADM-2906", registrationNo: "REG-2026-007", className: "Grade 5",  section: "C", roll: 31, gender: "Female", status: "active" },
    ],
  },
  {
    id: 5, parentId: "PAR-2026-0005", guardianCode: "GRD-005",
    name: "Rajesh Kumar", gender: "Male", relation: "Father", occupation: "Businessman",
    phone: "+977-9841000005", alternatePhone: "", email: "rajesh.kumar@example.com",
    address: "Baneshwor, Kathmandu", status: "active",
    linkedChildren: [
      { id: 8, studentId: 8, name: "Priya Kumar",   admissionNo: "ADM-2907", registrationNo: "REG-2026-008", className: "Grade 11", section: "A", roll: 7,  gender: "Female", status: "active" },
    ],
  },
  {
    id: 6, parentId: "PAR-2026-0006", guardianCode: "GRD-006",
    name: "Sarah Wilson", gender: "Female", relation: "Mother", occupation: "Nurse",
    phone: "+977-9861000006", alternatePhone: "+977-9861000016", email: "sarah.wilson@example.com",
    address: "Pulchowk, Lalitpur", status: "active",
    linkedChildren: [
      { id: 9, studentId: 9, name: "Liam Wilson",   admissionNo: "ADM-2908", registrationNo: "REG-2026-009", className: "Grade 3",  section: "B", roll: 14, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 7, parentId: "PAR-2026-0007", guardianCode: "GRD-007",
    name: "David Chen", gender: "Male", relation: "Father", occupation: "Software Engineer",
    phone: "+977-9801000007", alternatePhone: "+977-9801000017", email: "david.chen@example.com",
    address: "Thamel, Kathmandu", status: "active",
    linkedChildren: [
      { id: 10, studentId: 10, name: "Lisa Chen",    admissionNo: "ADM-2909", registrationNo: "REG-2026-010", className: "Grade 9",  section: "C", roll: 3,  gender: "Female", status: "active" },
      { id: 11, studentId: 11, name: "Michael Chen", admissionNo: "ADM-2910", registrationNo: "REG-2026-011", className: "Grade 6",  section: "A", roll: 47, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 8, parentId: "PAR-2026-0008", guardianCode: "GRD-008",
    name: "Sunita Thapa", gender: "Female", relation: "Mother", occupation: "Housewife",
    phone: "+977-9851000008", alternatePhone: "", email: "sunita.thapa@example.com",
    address: "Gongabu, Kathmandu", status: "active",
    linkedChildren: [
      { id: 12, studentId: 12, name: "Binod Thapa",  admissionNo: "ADM-2911", registrationNo: "REG-2026-012", className: "Grade 4",  section: "A", roll: 20, gender: "Male",   status: "active" },
      { id: 13, studentId: 13, name: "Nisha Thapa",  admissionNo: "ADM-2912", registrationNo: "REG-2026-013", className: "Grade 2",  section: "B", roll: 35, gender: "Female", status: "active" },
    ],
  },
  {
    id: 9, parentId: "PAR-2026-0009", guardianCode: "GRD-009",
    name: "Ahmed Hassan", gender: "Male", relation: "Father", occupation: "Architect",
    phone: "+977-9841000009", alternatePhone: "+977-9841000019", email: "ahmed.hassan@example.com",
    address: "Dillibazar, Kathmandu", status: "active",
    linkedChildren: [
      { id: 14, studentId: 14, name: "Fatima Hassan", admissionNo: "ADM-2913", registrationNo: "REG-2026-014", className: "Grade 7",  section: "B", roll: 9,  gender: "Female", status: "active" },
    ],
  },
  {
    id: 10, parentId: "PAR-2026-0010", guardianCode: "GRD-010",
    name: "Linda Brown", gender: "Female", relation: "Guardian", occupation: "Businesswoman",
    phone: "+977-9861000010", alternatePhone: "", email: "linda.brown@example.com",
    address: "Naxal, Kathmandu", status: "active",
    linkedChildren: [
      { id: 15, studentId: 15, name: "Mark Brown",   admissionNo: "ADM-2914", registrationNo: "REG-2026-015", className: "Grade 8",  section: "C", roll: 42, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 11, parentId: "PAR-2026-0011", guardianCode: "GRD-011",
    name: "Ramesh Gupta", gender: "Male", relation: "Father", occupation: "Accountant",
    phone: "+977-9801000011", alternatePhone: "+977-9801000021", email: "ramesh.gupta@example.com",
    address: "Chabahil, Kathmandu", status: "active",
    linkedChildren: [
      { id: 16, studentId: 16, name: "Sakshi Gupta", admissionNo: "ADM-2915", registrationNo: "REG-2026-016", className: "Grade 5",  section: "A", roll: 17, gender: "Female", status: "active" },
    ],
  },
  {
    id: 12, parentId: "PAR-2026-0012", guardianCode: "GRD-012",
    name: "Meera Joshi", gender: "Female", relation: "Mother", occupation: "Lawyer",
    phone: "+977-9851000012", alternatePhone: "", email: "meera.joshi@example.com",
    address: "Maharajgunj, Kathmandu", status: "active",
    linkedChildren: [
      { id: 17, studentId: 17, name: "Aryan Joshi",  admissionNo: "ADM-2916", registrationNo: "REG-2026-017", className: "Grade 10", section: "A", roll: 28, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 13, parentId: "PAR-2026-0013", guardianCode: "GRD-013",
    name: "Robert Davis", gender: "Male", relation: "Father", occupation: "Banker",
    phone: "+977-9841000013", alternatePhone: "+977-9841000023", email: "robert.davis@example.com",
    address: "Jhamsikhel, Lalitpur", status: "active",
    linkedChildren: [
      { id: 18, studentId: 18, name: "Emily Davis",  admissionNo: "ADM-2917", registrationNo: "REG-2026-018", className: "Grade 11", section: "B", roll: 6,  gender: "Female", status: "active" },
      { id: 19, studentId: 19, name: "Jack Davis",   admissionNo: "ADM-2918", registrationNo: "REG-2026-019", className: "Grade 8",  section: "A", roll: 33, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 14, parentId: "PAR-2026-0014", guardianCode: "GRD-014",
    name: "Kavita Rana", gender: "Female", relation: "Mother", occupation: "Nurse",
    phone: "+977-9861000014", alternatePhone: "", email: "kavita.rana@example.com",
    address: "Sitapaila, Kathmandu", status: "inactive",
    linkedChildren: [
      { id: 20, studentId: 20, name: "Aakash Rana",  admissionNo: "ADM-2919", registrationNo: "REG-2026-020", className: "Grade 6",  section: "C", roll: 11, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 15, parentId: "PAR-2026-0015", guardianCode: "GRD-015",
    name: "James Anderson", gender: "Male", relation: "Uncle", occupation: "Manager",
    phone: "+977-9801000015", alternatePhone: "+977-9801000025", email: "james.anderson@example.com",
    address: "Minbhawan, Kathmandu", status: "active",
    linkedChildren: [
      { id: 21, studentId: 21, name: "Sophie Anderson", admissionNo: "ADM-2920", registrationNo: "REG-2026-021", className: "Grade 3", section: "B", roll: 8, gender: "Female", status: "active" },
    ],
  },
  {
    id: 16, parentId: "PAR-2026-0016", guardianCode: "GRD-016",
    name: "Pooja Singh", gender: "Female", relation: "Mother", occupation: "Businesswoman",
    phone: "+977-9851000016", alternatePhone: "", email: "pooja.singh@example.com",
    address: "Kalanki, Kathmandu", status: "active",
    linkedChildren: [
      { id: 22, studentId: 22, name: "Arjun Singh",  admissionNo: "ADM-2921", registrationNo: "REG-2026-022", className: "Grade 9",  section: "A", roll: 16, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 17, parentId: "PAR-2026-0017", guardianCode: "GRD-017",
    name: "Carlos Martinez", gender: "Male", relation: "Father", occupation: "Doctor",
    phone: "+977-9841000017", alternatePhone: "+977-9841000027", email: "carlos.martinez@example.com",
    address: "Bouddha, Kathmandu", status: "active",
    linkedChildren: [
      { id: 23, studentId: 23, name: "Isabella Martinez", admissionNo: "ADM-2922", registrationNo: "REG-2026-023", className: "Grade 12", section: "A", roll: 2, gender: "Female", status: "active" },
    ],
  },
  {
    id: 18, parentId: "PAR-2026-0018", guardianCode: "GRD-018",
    name: "Sita Maharjan", gender: "Female", relation: "Mother", occupation: "Teacher",
    phone: "+977-9861000018", alternatePhone: "+977-9861000028", email: "sita.maharjan@example.com",
    address: "Thapathali, Kathmandu", status: "active",
    linkedChildren: [
      { id: 24, studentId: 24, name: "Rajan Maharjan", admissionNo: "ADM-2923", registrationNo: "REG-2026-024", className: "Grade 7", section: "A", roll: 24, gender: "Male",   status: "active" },
      { id: 25, studentId: 25, name: "Mina Maharjan",  admissionNo: "ADM-2924", registrationNo: "REG-2026-025", className: "Grade 4", section: "B", roll: 38, gender: "Female", status: "active" },
    ],
  },
  {
    id: 19, parentId: "PAR-2026-0019", guardianCode: "GRD-019",
    name: "Vikram Yadav", gender: "Male", relation: "Father", occupation: "Farmer",
    phone: "+977-9841000019", alternatePhone: "", email: "vikram.yadav@example.com",
    address: "Koteshwor, Kathmandu", status: "active",
    linkedChildren: [
      { id: 26, studentId: 26, name: "Aarav Yadav",  admissionNo: "ADM-2925", registrationNo: "REG-2026-026", className: "Grade 1",  section: "A", roll: 45, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 20, parentId: "PAR-2026-0020", guardianCode: "GRD-020",
    name: "Emma Thompson", gender: "Female", relation: "Aunt", occupation: "Nurse",
    phone: "+977-9851000020", alternatePhone: "+977-9851000030", email: "emma.thompson@example.com",
    address: "Sanepa, Lalitpur", status: "active",
    linkedChildren: [
      { id: 27, studentId: 27, name: "Oliver Thompson", admissionNo: "ADM-2926", registrationNo: "REG-2026-027", className: "Grade 5", section: "C", roll: 19, gender: "Male", status: "active" },
    ],
  },
  {
    id: 21, parentId: "PAR-2026-0021", guardianCode: "GRD-021",
    name: "Binod Karki", gender: "Male", relation: "Father", occupation: "Electrician",
    phone: "+977-9801000021", alternatePhone: "", email: "binod.karki@example.com",
    address: "Sinamangal, Kathmandu", status: "active",
    linkedChildren: [
      { id: 28, studentId: 28, name: "Sunita Karki",  admissionNo: "ADM-2927", registrationNo: "REG-2026-028", className: "Grade 6",  section: "B", roll: 36, gender: "Female", status: "active" },
    ],
  },
  {
    id: 22, parentId: "PAR-2026-0022", guardianCode: "GRD-022",
    name: "Deepa Shrestha", gender: "Female", relation: "Mother", occupation: "Housewife",
    phone: "+977-9861000022", alternatePhone: "+977-9861000032", email: "deepa.shrestha@example.com",
    address: "New Baneshwor, Kathmandu", status: "active",
    linkedChildren: [
      { id: 29, studentId: 29, name: "Rohan Shrestha", admissionNo: "ADM-2928", registrationNo: "REG-2026-029", className: "Grade 10", section: "C", roll: 13, gender: "Male",   status: "active" },
      { id: 30, studentId: 30, name: "Priya Shrestha", admissionNo: "ADM-2929", registrationNo: "REG-2026-030", className: "Grade 8",  section: "A", roll: 41, gender: "Female", status: "active" },
      { id: 31, studentId: 31, name: "Raj Shrestha",   admissionNo: "ADM-2930", registrationNo: "REG-2026-031", className: "Grade 5",  section: "B", roll: 27, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 23, parentId: "PAR-2026-0023", guardianCode: "GRD-023",
    name: "Michael Johnson", gender: "Male", relation: "Father", occupation: "Businessman",
    phone: "+977-9841000023", alternatePhone: "+977-9841000033", email: "michael.johnson@example.com",
    address: "Teku, Kathmandu", status: "blocked",
    linkedChildren: [
      { id: 32, studentId: 32, name: "Sarah Johnson", admissionNo: "ADM-2931", registrationNo: "REG-2026-032", className: "Grade 9", section: "B", roll: 4, gender: "Female", status: "active" },
    ],
  },
  {
    id: 24, parentId: "PAR-2026-0024", guardianCode: "GRD-024",
    name: "Nisha Tamang", gender: "Female", relation: "Mother", occupation: "Shopkeeper",
    phone: "+977-9851000024", alternatePhone: "", email: "nisha.tamang@example.com",
    address: "Jorpati, Kathmandu", status: "active",
    linkedChildren: [
      { id: 33, studentId: 33, name: "Kiran Tamang",  admissionNo: "ADM-2932", registrationNo: "REG-2026-033", className: "Grade 7",  section: "A", roll: 21, gender: "Male",   status: "active" },
      { id: 34, studentId: 34, name: "Maya Tamang",   admissionNo: "ADM-2933", registrationNo: "REG-2026-034", className: "Grade 4",  section: "C", roll: 50, gender: "Female", status: "active" },
    ],
  },
  {
    id: 25, parentId: "PAR-2026-0025", guardianCode: "GRD-025",
    name: "Samuel Clark", gender: "Male", relation: "Guardian", occupation: "Retired",
    phone: "+977-9801000025", alternatePhone: "+977-9801000035", email: "samuel.clark@example.com",
    address: "Chapagaun, Lalitpur", status: "active",
    linkedChildren: [
      { id: 35, studentId: 35, name: "Thomas Clark",  admissionNo: "ADM-2934", registrationNo: "REG-2026-035", className: "Grade 11", section: "C", roll: 10, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 26, parentId: "PAR-2026-0026", guardianCode: "GRD-026",
    name: "Anjali Rai", gender: "Female", relation: "Mother", occupation: "Designer",
    phone: "+977-9861000026", alternatePhone: "", email: "anjali.rai@example.com",
    address: "Patan, Lalitpur", status: "active",
    linkedChildren: [
      { id: 36, studentId: 36, name: "Shreya Rai",    admissionNo: "ADM-2935", registrationNo: "REG-2026-036", className: "Grade 8",  section: "B", roll: 26, gender: "Female", status: "active" },
    ],
  },
  {
    id: 27, parentId: "PAR-2026-0027", guardianCode: "GRD-027",
    name: "Suresh Pradhan", gender: "Male", relation: "Father", occupation: "Contractor",
    phone: "+977-9841000027", alternatePhone: "+977-9841000037", email: "suresh.pradhan@example.com",
    address: "Balkhu, Kathmandu", status: "inactive",
    linkedChildren: [
      { id: 37, studentId: 37, name: "Anil Pradhan",  admissionNo: "ADM-2936", registrationNo: "REG-2026-037", className: "Grade 3",  section: "A", roll: 39, gender: "Male",   status: "active" },
    ],
  },
  {
    id: 28, parentId: "PAR-2026-0028", guardianCode: "GRD-028",
    name: "Diana Miller", gender: "Female", relation: "Mother", occupation: "Accountant",
    phone: "+977-9851000028", alternatePhone: "+977-9851000038", email: "diana.miller@example.com",
    address: "Kalimati, Kathmandu", status: "active",
    linkedChildren: [
      { id: 38, studentId: 38, name: "Jack Miller",   admissionNo: "ADM-2937", registrationNo: "REG-2026-038", className: "Grade 10", section: "A", roll: 15, gender: "Male",   status: "active" },
      { id: 39, studentId: 39, name: "Rose Miller",   admissionNo: "ADM-2938", registrationNo: "REG-2026-039", className: "Grade 7",  section: "B", roll: 43, gender: "Female", status: "active" },
    ],
  },
  {
    id: 29, parentId: "PAR-2026-0029", guardianCode: "GRD-029",
    name: "Rajan Adhikari", gender: "Male", relation: "Father", occupation: "Journalist",
    phone: "+977-9801000029", alternatePhone: "", email: "rajan.adhikari@example.com",
    address: "Sukedhara, Kathmandu", status: "active",
    linkedChildren: [
      { id: 40, studentId: 40, name: "Bipana Adhikari", admissionNo: "ADM-2939", registrationNo: "REG-2026-040", className: "Grade 12", section: "B", roll: 1, gender: "Female", status: "active" },
    ],
  },
  {
    id: 30, parentId: "PAR-2026-0030", guardianCode: "GRD-030",
    name: "Gita Shrestha", gender: "Female", relation: "Grandmother", occupation: "Retired",
    phone: "+977-9861000030", alternatePhone: "+977-9861000040", email: "gita.shrestha@example.com",
    address: "Gairidhara, Kathmandu", status: "active",
    linkedChildren: [
      { id: 41, studentId: 41, name: "Arun Shrestha", admissionNo: "ADM-2940", registrationNo: "REG-2026-041", className: "Grade 1", section: "A", roll: 52, gender: "Male", status: "active" },
    ],
  },
];
