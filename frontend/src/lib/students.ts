import { api } from "./api";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Student {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  admission_number: string;
  roll_number: string;
  gender: string;
  status: string;
  academic_year: string;
  class_level: string;
  class_level_name: string | null;
  section: string | null;
  section_name: string | null;
}

export interface CreateStudentInput {
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
  gender?: string;
  academic_year: string;
  class_level: string;
  section?: string | null;
}

export const PAGE_SIZE = 25;

export async function listStudents(params: {
  search?: string;
  page?: number;
}): Promise<Paginated<Student>> {
  const { data } = await api.get<Paginated<Student>>("/students/", { params });
  return data;
}

/** Up to 100 students for the dashboard data table (optionally by status). */
export async function listStudentsForTable(status?: string): Promise<Student[]> {
  const { data } = await api.get<Paginated<Student>>("/students/", {
    params: { page_size: 100, ...(status ? { status } : {}) },
  });
  return data.results;
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { data } = await api.post<Student>("/students/", input);
  return data;
}

export interface AcademicYearOption {
  id: string;
  name: string;
}
export interface ClassLevelOption {
  id: string;
  name: string;
}
export interface SectionOption {
  id: string;
  name: string;
  class_level: string;
  class_level_name: string;
}

async function listAll<T>(path: string): Promise<T[]> {
  const { data } = await api.get<Paginated<T>>(path, { params: { page_size: 200 } });
  return data.results;
}

export const listAcademicYears = () =>
  listAll<AcademicYearOption>("/academics/academic-years/");
export const listClassLevels = () =>
  listAll<ClassLevelOption>("/academics/class-levels/");
export const listSections = () => listAll<SectionOption>("/academics/sections/");
