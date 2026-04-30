'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, TrendingUp, Save, ChevronDown } from 'lucide-react';

export default function AcademicPage() {
  const { state, dispatch } = useApp();
  const [selectedClass, setSelectedClass] = useState('c1');
  const [selectedSubject, setSelectedSubject] = useState('sub1');
  const [savingId, setSavingId] = useState<string | null>(null);

  const currentClass = state.classes.find(c => c.id === selectedClass);
  const currentSubject = state.subjects.find(s => s.id === selectedSubject);
  const students = useMemo(
    () => state.students.filter(s => s.classId === selectedClass),
    [state.students, selectedClass]
  );

  // Calculate attendance percentages from journal data
  const attendanceStats = useMemo(() => {
    const totalJournals = state.journals.filter(
      j => j.classId === selectedClass && j.subjectId === selectedSubject && j.status === 'completed'
    );
    return students.map(student => {
      let hadir = 0, total = 0;
      totalJournals.forEach(j => {
        if (j.attendance) {
          const record = j.attendance.find(a => a.studentId === student.id);
          if (record) {
            total++;
            if (record.status === 'H') hadir++;
          }
        }
      });
      const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;
      return { student, hadir, total, percentage };
    });
  }, [students, state.journals, selectedClass, selectedSubject]);

  // Grades
  const grades = useMemo(
    () => state.grades.filter(g => g.classId === selectedClass && g.subjectId === selectedSubject),
    [state.grades, selectedClass, selectedSubject]
  );

  const handleGradeChange = (gradeId: string, field: 'nilaiHarian' | 'uts' | 'uas', value: string) => {
    const numValue = value === '' ? null : Math.min(100, Math.max(0, parseInt(value) || 0));
    const grade = state.grades.find(g => g.id === gradeId);
    if (!grade) return;

    const updated = { ...grade, [field]: numValue };
    // Recalculate NA
    if (updated.nilaiHarian !== null && updated.uts !== null && updated.uas !== null) {
      updated.nilaiAkhir = Math.round(0.2 * updated.nilaiHarian + 0.4 * updated.uts + 0.4 * updated.uas);
    } else {
      updated.nilaiAkhir = null;
    }

    dispatch({ type: 'UPDATE_GRADE', payload: updated });
    setSavingId(gradeId);
    setTimeout(() => setSavingId(null), 1500);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900">Pusat Akademik</h1>
        <p className="text-sm text-gray-500">Rekap Absensi & Nilai Siswa</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="relative">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full h-10 rounded-xl bg-white border border-gray-200 px-3 text-sm appearance-none cursor-pointer focus:border-nabawi focus:ring-1 focus:ring-nabawi/20"
          >
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full h-10 rounded-xl bg-white border border-gray-200 px-3 text-sm appearance-none cursor-pointer focus:border-nabawi focus:ring-1 focus:ring-nabawi/20"
          >
            {state.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="absensi" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl h-10 p-1">
          <TabsTrigger value="absensi" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-1.5" /> Absensi
          </TabsTrigger>
          <TabsTrigger value="nilai" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4 mr-1.5" /> Nilai
          </TabsTrigger>
        </TabsList>

        {/* Tab: Attendance */}
        <TabsContent value="absensi" className="space-y-2">
          {attendanceStats.map((item, i) => (
            <motion.div
              key={item.student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{item.student.name}</span>
                <span className={`text-xs font-bold ${item.percentage < 80 ? 'text-terra' : 'text-success'}`}>
                  {item.percentage}%
                </span>
              </div>
              <Progress
                value={item.percentage}
                className="h-2 rounded-full"
              />
              <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                <span>Hadir: {item.hadir}</span>
                <span>Total Pertemuan: {item.total || '-'}</span>
              </div>
            </motion.div>
          ))}

          {attendanceStats.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada data kehadiran</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Grades */}
        <TabsContent value="nilai" className="space-y-2">
          {/* Auto-save indicator */}
          {savingId && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-success bg-success-light px-3 py-1.5 rounded-lg w-fit"
            >
              <Save className="w-3 h-3" /> Menyimpan...
            </motion.div>
          )}

          {/* Header row */}
          <div className="grid grid-cols-[1fr_3rem_3rem_3rem_3rem] gap-1 px-2 text-[10px] text-gray-500 font-semibold uppercase">
            <span>Nama</span>
            <span className="text-center">NH</span>
            <span className="text-center">UTS</span>
            <span className="text-center">UAS</span>
            <span className="text-center">NA</span>
          </div>

          {grades.length > 0 ? grades.map((grade, i) => {
            const student = state.students.find(s => s.id === grade.studentId);
            return (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[1fr_3rem_3rem_3rem_3rem] gap-1 items-center bg-white rounded-xl p-2 border border-gray-100 shadow-sm"
              >
                <span className="text-xs text-gray-800 truncate pl-1">{student?.name || '-'}</span>
                {(['nilaiHarian', 'uts', 'uas'] as const).map(field => (
                  <Input
                    key={field}
                    type="number"
                    min={0}
                    max={100}
                    value={grade[field] ?? ''}
                    onChange={e => handleGradeChange(grade.id, field, e.target.value)}
                    className="h-8 text-center text-xs rounded-lg border-gray-200 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ))}
                <div className={`h-8 flex items-center justify-center text-xs font-bold rounded-lg ${
                  grade.nilaiAkhir !== null
                    ? grade.nilaiAkhir >= 75 ? 'bg-success-light text-success' : 'bg-terra-muted text-terra'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {grade.nilaiAkhir ?? '-'}
                </div>
              </motion.div>
            );
          }) : (
            <div className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada data nilai</p>
              <p className="text-xs text-gray-400 mt-1">Pilih kelas dan mata pelajaran yang sesuai</p>
            </div>
          )}

          {grades.length > 0 && (
            <p className="text-[10px] text-gray-400 text-center pt-2">
              NA = (20% × NH) + (40% × UTS) + (40% × UAS) • Auto-save aktif
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
