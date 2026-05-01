'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-1 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-nabawi rounded-full" />
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Pusat Akademik</h1>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Rekap Absensi & Nilai Siswa</p>
      </motion.div>

      {/* Filters - Premium Selects */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="relative group">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full h-12 rounded-2xl bg-white border-2 border-white shadow-xl shadow-gray-200/40 px-4 text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-nabawi/20 focus:ring-0 transition-all text-gray-700"
          >
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-focus-within:text-nabawi transition-colors" />
        </div>
        <div className="relative group">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full h-12 rounded-2xl bg-white border-2 border-white shadow-xl shadow-gray-200/40 px-4 text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-nabawi/20 focus:ring-0 transition-all text-gray-700"
          >
            {state.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-focus-within:text-nabawi transition-colors" />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="absensi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm rounded-2xl h-14 p-1.5 border-2 border-white shadow-sm">
          <TabsTrigger value="absensi" className="rounded-xl text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-nabawi data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <Users className="w-4 h-4 mr-2" /> Absensi
          </TabsTrigger>
          <TabsTrigger value="nilai" className="rounded-xl text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-nabawi data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <TrendingUp className="w-4 h-4 mr-2" /> Nilai
          </TabsTrigger>
        </TabsList>

        {/* Tab: Attendance */}
        <TabsContent value="absensi" className="space-y-4 outline-none">
          {attendanceStats.map((item, i) => (
            <motion.div
              key={item.student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-[1.8rem] p-5 border-2 border-white shadow-xl shadow-gray-200/40"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{item.student.name}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Siswa Aktif</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.percentage < 80 ? 'bg-terra/10 text-terra' : 'bg-success/10 text-success'}`}>
                  {item.percentage}%
                </div>
              </div>
              
              <div className="relative h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner mb-3">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${item.percentage}%` }}
                   className={`absolute inset-0 rounded-full ${item.percentage < 80 ? 'bg-terra' : 'bg-success'} shadow-[0_0_10px_rgba(45,90,61,0.2)]`}
                 />
              </div>

              <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-nabawi" />
                  Hadir: {item.hadir}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  Pertemuan: {item.total || '-'}
                </div>
              </div>
            </motion.div>
          ))}

          {attendanceStats.length === 0 && (
            <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-white shadow-2xl shadow-gray-200/50">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Belum Ada Data</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Grades */}
        <TabsContent value="nilai" className="space-y-4 outline-none">
          {/* Auto-save indicator */}
          <div className="h-6">
            <AnimatePresence>
              {savingId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-[9px] font-black text-success uppercase tracking-[0.2em] bg-success/5 px-4 py-1.5 rounded-full w-fit border border-success/10 ml-1"
                >
                  <Save className="w-3 h-3" /> Auto-Saving...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem_3.5rem_3.5rem] gap-2 px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">
            <span>Nama Siswa</span>
            <span className="text-center">NH</span>
            <span className="text-center">UTS</span>
            <span className="text-center">UAS</span>
            <span className="text-center">NA</span>
          </div>

          <div className="space-y-3">
            {grades.length > 0 ? grades.map((grade, i) => {
              const student = state.students.find(s => s.id === grade.studentId);
              return (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[1fr_3.5rem_3.5rem_3.5rem_3.5rem] gap-2 items-center bg-white rounded-2xl p-3 border-2 border-white shadow-xl shadow-gray-200/40"
                >
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate pl-1">{student?.name || '-'}</span>
                  {(['nilaiHarian', 'uts', 'uas'] as const).map(field => (
                    <Input
                      key={field}
                      type="number"
                      min={0}
                      max={100}
                      value={grade[field] ?? ''}
                      onChange={e => handleGradeChange(grade.id, field, e.target.value)}
                      className="h-10 text-center text-xs font-black rounded-xl bg-gray-50 border-white focus:bg-white focus:ring-0 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                    />
                  ))}
                  <div className={`h-10 flex items-center justify-center text-[11px] font-black rounded-xl shadow-lg border-2 border-white ${
                    grade.nilaiAkhir !== null
                      ? grade.nilaiAkhir >= 75 ? 'bg-success text-white' : 'bg-terra text-white'
                      : 'bg-gray-50 text-gray-300'
                  }`}>
                    {grade.nilaiAkhir ?? '-'}
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-white shadow-2xl shadow-gray-200/50">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Pilih Filter Data</p>
              </div>
            )}
          </div>

          {grades.length > 0 && (
            <div className="p-5 bg-gold/5 rounded-[1.8rem] border border-gold/10 mt-6">
              <p className="text-[9px] font-black text-gold-dark text-center leading-relaxed uppercase tracking-widest">
                Nilai Akhir (NA) = (20% × NH) + (40% × UTS) + (40% × UAS)
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
