// ===== SakuGuru Type Definitions =====

export type UserRole = 'guru' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  nip: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  npsn?: string;
  address: string;
  logo?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  maxStudents: number;
  maxTeachers: number;
  dueDate: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone?: string;
  schoolId: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  classId: string;
  gender: 'L' | 'P';
  phone?: string;
  parentName?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface Schedule {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "07:00"
  endTime: string;   // "08:30"
  teacherId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
}

export type JournalStatus = 'completed' | 'active' | 'locked' | 'missed';

export interface JournalEntry {
  id: string;
  scheduleId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  date: string;
  status: JournalStatus;
  material?: string;
  photos?: string[];
  attendance?: AttendanceRecord[];
  submittedAt?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  semester: string;
  nilaiHarian: number | null;
  uts: number | null;
  uas: number | null;
  nilaiAkhir: number | null;
}

export type CalendarEventType = 'libur' | 'ujian' | 'rapat' | 'kegiatan';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: CalendarEventType;
  schoolId: string;
}

export interface BillingRecord {
  id: string;
  schoolId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidAt?: string;
  description: string;
  period: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
  userId?: string;
}
