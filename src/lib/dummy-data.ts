import type {
  User, School, Teacher, Student, ClassRoom, Subject, Schedule,
  JournalEntry, GradeRecord, CalendarEvent, BillingRecord, SystemLog,
} from '@/types';

// ===== USERS =====
export const dummyUsers: User[] = [
  { id: 'u1', name: 'Ahmad Fauzi, S.Pd', email: 'ahmad@sakuguru.id', nip: '198501012010011001', role: 'guru', schoolId: 's1' },
  { id: 'u2', name: 'Siti Nurhaliza, M.Pd', email: 'siti@sakuguru.id', nip: '198703152012012002', role: 'guru', schoolId: 's1' },
  { id: 'u3', name: 'Budi Santoso, S.Pd', email: 'budi@sakuguru.id', nip: '199001102015011003', role: 'guru', schoolId: 's1' },
  { id: 'u4', name: 'Dewi Rahmawati, S.Pd', email: 'dewi@sakuguru.id', nip: '198812202013012004', role: 'guru', schoolId: 's1' },
  { id: 'u5', name: 'Hendra Wijaya, S.Pd', email: 'hendra@sakuguru.id', nip: '199205082016011005', role: 'guru', schoolId: 's1' },
  { id: 'u-admin', name: 'Admin TU', email: 'admin@pesantren-darussalam.id', nip: 'ADM001', role: 'admin', schoolId: 's1' },
  { id: 'u-sa', name: 'System Admin', email: 'superadmin@sakuguru.id', nip: 'SA001', role: 'superadmin' },
];

// ===== SCHOOLS (TENANTS) =====
export const dummySchools: School[] = [
  { id: 's1', name: 'Pondok Pesantren Darussalam', address: 'Jl. Pondok Pesantren No. 1, Bogor', status: 'ACTIVE', maxStudents: 500, maxTeachers: 30, dueDate: '2026-06-30', createdAt: '2025-01-15', lessonDurationMinutes: 45 },
  { id: 's2', name: 'SMA Islam Al-Azhar', address: 'Jl. Sisingamangaraja No. 12, Jakarta', status: 'ACTIVE', maxStudents: 800, maxTeachers: 50, dueDate: '2026-07-15', createdAt: '2025-02-01', lessonDurationMinutes: 45 },
  { id: 's3', name: 'MTs Nurul Iman', address: 'Jl. Raya Cipanas No. 5, Cianjur', status: 'TRIAL', maxStudents: 200, maxTeachers: 15, dueDate: '2026-05-15', createdAt: '2026-03-01', lessonDurationMinutes: 30 },
  { id: 's4', name: 'MA Darul Hikam', address: 'Jl. Ir. H. Juanda No. 285, Bandung', status: 'ACTIVE', maxStudents: 600, maxTeachers: 40, dueDate: '2026-08-01', createdAt: '2025-06-01', lessonDurationMinutes: 40 },
  { id: 's5', name: 'Pesantren Modern Al-Kautsar', address: 'Jl. Way Halim, Bandar Lampung', status: 'SUSPENDED', maxStudents: 300, maxTeachers: 20, dueDate: '2026-03-01', createdAt: '2025-03-15', lessonDurationMinutes: 45 },
];

// ===== TEACHERS =====
export const dummyTeachers: Teacher[] = [
  { id: 't1', nip: '198501012010011001', name: 'Ahmad Fauzi, S.Pd', email: 'ahmad@sakuguru.id', phone: '08123456789', schoolId: 's1' },
  { id: 't2', nip: '198703152012012002', name: 'Siti Nurhaliza, M.Pd', email: 'siti@sakuguru.id', phone: '08123456790', schoolId: 's1' },
  { id: 't3', nip: '199001102015011003', name: 'Budi Santoso, S.Pd', email: 'budi@sakuguru.id', phone: '08123456791', schoolId: 's1' },
  { id: 't4', nip: '198812202013012004', name: 'Dewi Rahmawati, S.Pd', email: 'dewi@sakuguru.id', phone: '08123456792', schoolId: 's1' },
  { id: 't5', nip: '199205082016011005', name: 'Hendra Wijaya, S.Pd', email: 'hendra@sakuguru.id', phone: '08123456793', schoolId: 's1' },
  { id: 't6', nip: '198806152014011006', name: 'Rizki Ramadhan, S.Pd.I', email: 'rizki@sakuguru.id', phone: '08123456794', schoolId: 's1' },
  { id: 't7', nip: '199107222017012007', name: 'Fatimah Zahra, S.Pd', email: 'fatimah@sakuguru.id', phone: '08123456795', schoolId: 's1' },
  { id: 't8', nip: '198904302016012008', name: 'Nur Aini, S.Pd', email: 'nuraini@sakuguru.id', phone: '08123456796', schoolId: 's1' },
];

// ===== CLASSES =====
export const dummyClasses: ClassRoom[] = [
  { id: 'c1', name: 'X IPA 1', grade: 'X', schoolId: 's1' },
  { id: 'c2', name: 'X IPA 2', grade: 'X', schoolId: 's1' },
  { id: 'c3', name: 'X IPS 1', grade: 'X', schoolId: 's1' },
  { id: 'c4', name: 'XI IPA 1', grade: 'XI', schoolId: 's1' },
  { id: 'c5', name: 'XI IPA 2', grade: 'XI', schoolId: 's1' },
  { id: 'c6', name: 'XI IPS 1', grade: 'XI', schoolId: 's1' },
  { id: 'c7', name: 'XII IPA 1', grade: 'XII', schoolId: 's1' },
  { id: 'c8', name: 'XII IPS 1', grade: 'XII', schoolId: 's1' },
];

// ===== SUBJECTS =====
export const dummySubjects: Subject[] = [
  { id: 'sub1', name: 'Matematika', code: 'MTK' },
  { id: 'sub2', name: 'Bahasa Indonesia', code: 'BIN' },
  { id: 'sub3', name: 'Bahasa Inggris', code: 'BIG' },
  { id: 'sub4', name: 'Fisika', code: 'FIS' },
  { id: 'sub5', name: 'Kimia', code: 'KIM' },
  { id: 'sub6', name: 'Biologi', code: 'BIO' },
  { id: 'sub7', name: 'Sejarah', code: 'SEJ' },
  { id: 'sub8', name: 'Ekonomi', code: 'EKO' },
  { id: 'sub9', name: 'Pendidikan Agama Islam', code: 'PAI' },
  { id: 'sub10', name: 'Al-Quran Hadits', code: 'QH' },
  { id: 'sub11', name: 'Fiqih', code: 'FIQ' },
  { id: 'sub12', name: 'Bahasa Arab', code: 'BAR' },
];

// ===== STUDENTS =====
const studentNames = [
  'Abdullah Azzam', 'Aisyah Putri', 'Ali Akbar', 'Amira Zahra', 'Arif Rahman',
  'Bilal Ibrahim', 'Chairunnisa', 'Dani Hakim', 'Dinda Safira', 'Fadhil Anwar',
  'Farah Nabila', 'Galih Pratama', 'Hafidz Syahputra', 'Hanifa Aulia', 'Ibrahim Malik',
  'Jasmine Nur', 'Khalid Mustofa', 'Laila Fitri', 'Muhammad Rizky', 'Nabila Husna',
  'Omar Faruq', 'Putri Ramadhani', 'Qisthi Ananda', 'Rafi Hidayat', 'Salma Khadijah',
  'Tariq Zidan', 'Ummu Habibah', 'Vina Maulida', 'Wahyu Kurniawan', 'Yusuf Habibi',
  'Zahra Amelia', 'Zaki Mubarak',
];

export const dummyStudents: Student[] = studentNames.flatMap((name, i) => {
  const classIndex = Math.floor(i / 4);
  const classId = dummyClasses[classIndex % dummyClasses.length].id;
  return [{
    id: `stu${i + 1}`,
    nisn: `00${10000 + i + 1}`,
    name,
    classId,
    gender: (i % 2 === 0 ? 'L' : 'P') as 'L' | 'P',
    parentName: `Orang Tua ${name.split(' ')[0]}`,
  }];
});

// ===== SCHEDULES (Senin-Sabtu, 08:00-22:00) =====
// Time slots: 08:00-09:30, 09:45-11:15, 11:15-12:45, 13:30-15:00, 15:15-16:45, 17:00-18:30, 19:00-20:30, 20:30-22:00
const timeSlots = [
  { start: '08:00', end: '09:30' },
  { start: '09:45', end: '11:15' },
  { start: '11:15', end: '12:45' },
  { start: '13:30', end: '15:00' }, // After Dzuhur break
  { start: '15:15', end: '16:45' },
  { start: '17:00', end: '18:30' },
  { start: '19:00', end: '20:30' }, // After Maghrib break
  { start: '20:30', end: '22:00' },
] as const;

const days: Schedule['dayOfWeek'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Teacher-subject mapping (each teacher teaches specific subjects)
const teacherSubjectMap: Record<string, string[]> = {
  t1: ['sub1'],          // Ahmad Fauzi → Matematika
  t2: ['sub2', 'sub7'],  // Siti Nurhaliza → B. Indonesia, Sejarah
  t3: ['sub4', 'sub5'],  // Budi Santoso → Fisika, Kimia
  t4: ['sub9', 'sub11'], // Dewi Rahmawati → PAI, Fiqih
  t5: ['sub3'],          // Hendra Wijaya → B. Inggris
  t6: ['sub6', 'sub8'],  // Rizki Ramadhan → Biologi, Ekonomi
  t7: ['sub10', 'sub12'],// Fatimah Zahra → Al-Quran Hadits, B. Arab
  t8: ['sub1', 'sub4'],  // Nur Aini → Matematika, Fisika
};

const generatedSchedules: Schedule[] = [];
let schId = 1;

days.forEach((day, dayIdx) => {
  timeSlots.forEach((slot, slotIdx) => {
    // Each slot has multiple classes running in parallel, taught by different teachers
    const teacherIds = Object.keys(teacherSubjectMap);
    // Rotate class assignments per day+slot so each class gets a variety
    const classIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

    // Assign 4-6 parallel sessions per slot (not all 8 teachers teach every slot)
    const sessionsPerSlot = slotIdx < 3 ? 6 : slotIdx < 6 ? 5 : 4; // Morning=6, Afternoon=5, Evening=4

    for (let s = 0; s < sessionsPerSlot; s++) {
      const tIdx = (dayIdx * 8 + slotIdx * 3 + s) % teacherIds.length;
      const cIdx = (dayIdx * 3 + slotIdx + s) % classIds.length;
      const teacherId = teacherIds[tIdx];
      const subjects = teacherSubjectMap[teacherId];
      const subjectId = subjects[(dayIdx + slotIdx) % subjects.length];

      generatedSchedules.push({
        id: `sch${schId++}`,
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
        teacherId,
        classId: classIds[cIdx],
        subjectId,
        schoolId: 's1',
      });
    }
  });
});

export const dummySchedules: Schedule[] = generatedSchedules;

// ===== JOURNALS =====
// ===== JOURNALS =====
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const dummyJournals: JournalEntry[] = [
  // Today's Entries
  {
    id: 'j1', scheduleId: 'sch1', teacherId: 't1', classId: 'c1', subjectId: 'sub1',
    date: today, status: 'completed',
    material: 'Persamaan Kuadrat: Menyelesaikan persamaan ax² + bx + c = 0 menggunakan rumus ABC dan faktorisasi.',
    photos: ['/placeholder-photo-1.jpg'],
    attendance: dummyStudents.filter(s => s.classId === 'c1').map(s => ({ studentId: s.id, status: 'H' as const })),
    submittedAt: `${today}T07:45:00`,
  },
  {
    id: 'j2', scheduleId: 'sch2', teacherId: 't1', classId: 'c2', subjectId: 'sub1',
    date: today, status: 'active',
    material: undefined,
    photos: [],
    attendance: [],
  },
  {
    id: 'j3', scheduleId: 'sch3', teacherId: 't1', classId: 'c4', subjectId: 'sub1',
    date: today, status: 'locked',
  },
  // Yesterday's Entries (History)
  {
    id: 'j-hist1', scheduleId: 'sch4', teacherId: 't1', classId: 'c3', subjectId: 'sub1',
    date: yesterday, status: 'completed',
    material: 'Logaritma: Sifat-sifat logaritma dan aplikasinya dalam soal cerita.',
    photos: ['/placeholder-photo-2.jpg'],
    attendance: dummyStudents.filter(s => s.classId === 'c3').map((s, i) => ({ studentId: s.id, status: i === 2 ? 'S' : 'H' })),
    submittedAt: `${yesterday}T07:50:00`,
  },
  {
    id: 'j-hist2', scheduleId: 'sch5', teacherId: 't1', classId: 'c5', subjectId: 'sub1',
    date: yesterday, status: 'completed',
    material: 'Eksponen: Grafik fungsi eksponen dan pertidaksamaan eksponen.',
    photos: ['/placeholder-photo-1.jpg'],
    attendance: dummyStudents.filter(s => s.classId === 'c5').map((s, i) => ({ studentId: s.id, status: i === 1 ? 'A' : 'H' })),
    submittedAt: `${yesterday}T11:45:00`,
  },
  // Day Before Yesterday
  {
    id: 'j-hist3', scheduleId: 'sch6', teacherId: 't1', classId: 'c7', subjectId: 'sub1',
    date: dayBefore, status: 'completed',
    material: 'Limit Fungsi Aljabar: Menghitung limit fungsi di satu titik dan tak hingga.',
    photos: ['/placeholder-photo-2.jpg'],
    attendance: dummyStudents.filter(s => s.classId === 'c7').map((s, i) => ({ studentId: s.id, status: 'H' })),
    submittedAt: `${dayBefore}T08:30:00`,
  },
];

// ===== GRADES =====
export const dummyGrades: GradeRecord[] = dummyStudents
  .filter(s => s.classId === 'c1')
  .map((s, i) => ({
    id: `g${i + 1}`,
    studentId: s.id,
    subjectId: 'sub1',
    classId: 'c1',
    teacherId: 't1',
    semester: 'Genap 2025/2026',
    nilaiHarian: 70 + Math.floor(Math.random() * 25),
    uts: 65 + Math.floor(Math.random() * 30),
    uas: 60 + Math.floor(Math.random() * 35),
    nilaiAkhir: null,
  }))
  .map(g => ({
    ...g,
    nilaiAkhir: g.nilaiHarian && g.uts && g.uas
      ? Math.round(0.2 * g.nilaiHarian + 0.4 * g.uts + 0.4 * g.uas)
      : null,
  }));

// ===== CALENDAR EVENTS =====
export const dummyCalendarEvents: CalendarEvent[] = [
  { id: 'ev1', title: 'Libur Idul Fitri', description: 'Libur Hari Raya Idul Fitri 1447 H', startDate: '2026-03-20', endDate: '2026-04-02', type: 'libur', schoolId: 's1' },
  { id: 'ev2', title: 'Ujian Tengah Semester', description: 'Pelaksanaan UTS Semester Genap', startDate: '2026-05-04', endDate: '2026-05-09', type: 'ujian', schoolId: 's1' },
  { id: 'ev3', title: 'Rapat Dewan Guru', description: 'Rapat koordinasi bulanan', startDate: '2026-05-15', endDate: '2026-05-15', type: 'rapat', schoolId: 's1' },
  { id: 'ev4', title: 'Hari Pendidikan Nasional', description: 'Upacara Hardiknas', startDate: '2026-05-02', endDate: '2026-05-02', type: 'kegiatan', schoolId: 's1' },
  { id: 'ev5', title: 'Ujian Akhir Semester', description: 'Pelaksanaan UAS Semester Genap', startDate: '2026-06-01', endDate: '2026-06-12', type: 'ujian', schoolId: 's1' },
  { id: 'ev6', title: 'Libur Semester', description: 'Libur Akhir Tahun Pelajaran', startDate: '2026-06-22', endDate: '2026-07-12', type: 'libur', schoolId: 's1' },
  { id: 'ev7', title: 'Isra Miraj', description: 'Libur Isra Miraj Nabi Muhammad SAW', startDate: '2026-05-22', endDate: '2026-05-22', type: 'libur', schoolId: 's1' },
];

// ===== BILLING =====
export const dummyBilling: BillingRecord[] = [
  { id: 'b1', schoolId: 's1', amount: 1500000, status: 'paid', dueDate: '2026-04-01', paidAt: '2026-03-28', description: 'Langganan Bulanan', period: 'April 2026' },
  { id: 'b2', schoolId: 's1', amount: 1500000, status: 'paid', dueDate: '2026-03-01', paidAt: '2026-02-27', description: 'Langganan Bulanan', period: 'Maret 2026' },
  { id: 'b3', schoolId: 's2', amount: 2500000, status: 'paid', dueDate: '2026-04-01', paidAt: '2026-03-30', description: 'Langganan Bulanan', period: 'April 2026' },
  { id: 'b4', schoolId: 's3', amount: 0, status: 'pending', dueDate: '2026-05-15', description: 'Masa Trial', period: 'Trial' },
  { id: 'b5', schoolId: 's4', amount: 2000000, status: 'paid', dueDate: '2026-04-01', paidAt: '2026-03-29', description: 'Langganan Bulanan', period: 'April 2026' },
  { id: 'b6', schoolId: 's5', amount: 1000000, status: 'overdue', dueDate: '2026-03-01', description: 'Langganan Bulanan', period: 'Maret 2026' },
  { id: 'b7', schoolId: 's1', amount: 1500000, status: 'pending', dueDate: '2026-05-01', description: 'Langganan Bulanan', period: 'Mei 2026' },
];

// ===== SYSTEM LOGS =====
export const dummySystemLogs: SystemLog[] = [
  { id: 'log1', level: 'info', message: 'Tenant "Pondok Pesantren Darussalam" berhasil login', timestamp: '2026-04-29T07:00:00', source: 'auth-service' },
  { id: 'log2', level: 'info', message: 'Jurnal berhasil disimpan oleh Ahmad Fauzi', timestamp: '2026-04-29T07:45:00', source: 'journal-service' },
  { id: 'log3', level: 'warning', message: 'Storage usage mencapai 80% kapasitas', timestamp: '2026-04-29T06:00:00', source: 'storage-monitor' },
  { id: 'log4', level: 'error', message: 'Koneksi database timeout (retry 3x berhasil)', timestamp: '2026-04-28T23:15:00', source: 'db-connector' },
  { id: 'log5', level: 'info', message: 'Backup harian selesai dijalankan', timestamp: '2026-04-29T02:00:00', source: 'backup-cron' },
  { id: 'log6', level: 'warning', message: 'Tenant "Pesantren Modern Al-Kautsar" overdue pembayaran', timestamp: '2026-04-28T09:00:00', source: 'billing-service' },
  { id: 'log7', level: 'info', message: 'Tenant baru "MTs Nurul Iman" terdaftar (Trial)', timestamp: '2026-03-01T10:00:00', source: 'tenant-service' },
];
