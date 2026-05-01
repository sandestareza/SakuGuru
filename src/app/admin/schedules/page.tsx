'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { AlertTriangle, Clock, GraduationCap, Plus, Edit, Trash2, ClipboardList, Settings2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FormSheet } from '@/components/shared/form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { DayOfWeek, Schedule } from '@/types';

const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** Preset durasi JP yang umum digunakan sekolah */
const JP_PRESETS = [30, 35, 40, 45] as const;

export default function SchedulesPage() {
  const { state, dispatch } = useApp();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showJpConfig, setShowJpConfig] = useState(false);
  const [customJpInput, setCustomJpInput] = useState('');
  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    dayOfWeek: 'Senin',
    startTime: '07:00',
    endTime: '08:30',
    classId: '',
    subjectId: '',
    teacherId: ''
  });

  // Get current school & JP duration
  const currentSchool = useMemo(() => {
    const schoolId = state.currentUser?.schoolId;
    return state.schools.find(s => s.id === schoolId) || state.schools[0];
  }, [state.schools, state.currentUser]);

  const jpDuration = currentSchool?.lessonDurationMinutes || 45;

  const handleSetJpDuration = (minutes: number) => {
    if (minutes < 10 || minutes > 120) {
      toast.error('Durasi JP harus antara 10-120 menit');
      return;
    }
    if (!currentSchool) return;
    dispatch({
      type: 'UPDATE_SCHOOL',
      payload: { ...currentSchool, lessonDurationMinutes: minutes }
    });
    toast.success(`Durasi 1 JP diatur ke ${minutes} menit`);
    setCustomJpInput('');
    setShowJpConfig(false);
  };

  // Rekap Jam Mengajar
  const teachingHours = useMemo(() => {
    const getMinutes = (time: string) => {
      if (!time) return 0;
      const [h, m] = time.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const rekapMap = new Map<string, { totalMinutes: number; classes: Map<string, number> }>();

    state.schedules.forEach(schedule => {
      const duration = getMinutes(schedule.endTime) - getMinutes(schedule.startTime);
      if (duration <= 0) return;

      if (!rekapMap.has(schedule.teacherId)) {
        rekapMap.set(schedule.teacherId, { totalMinutes: 0, classes: new Map() });
      }

      const teacherData = rekapMap.get(schedule.teacherId)!;
      teacherData.totalMinutes += duration;

      const currentClassMinutes = teacherData.classes.get(schedule.classId) || 0;
      teacherData.classes.set(schedule.classId, currentClassMinutes + duration);
    });

    return Array.from(rekapMap.entries()).map(([teacherId, data]) => {
      const teacher = state.teachers.find(t => t.id === teacherId);

      const totalJp = data.totalMinutes / jpDuration;
      
      const classBreakdown = Array.from(data.classes.entries()).map(([classId, minutes]) => {
        const cls = state.classes.find(c => c.id === classId);
        const classJp = minutes / jpDuration;
        return {
          classId,
          className: cls?.name || 'Kelas Tidak Diketahui',
          minutes,
          jp: classJp,
          formattedJp: Number.isInteger(classJp) ? `${classJp} JP` : `${classJp.toFixed(1)} JP`,
          formatted: `${Math.floor(minutes / 60)}j ${minutes % 60}m`
        };
      }).sort((a, b) => b.minutes - a.minutes);

      return {
        teacherId,
        teacherName: teacher?.name || 'Guru Tidak Diketahui',
        totalMinutes: data.totalMinutes,
        totalJp,
        formattedJp: Number.isInteger(totalJp) ? `${totalJp} JP` : `${totalJp.toFixed(1)} JP`,
        formattedTotal: `${Math.floor(data.totalMinutes / 60)}j ${data.totalMinutes % 60}m`,
        classBreakdown
      };
    }).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [state.schedules, state.teachers, state.classes, jpDuration]);

  // Dynamic Time Slots based on state schedules
  const dynamicTimeSlots = useMemo(() => {
    const slotsSet = new Set<string>();
    state.schedules.forEach(s => {
      slotsSet.add(`${s.startTime}-${s.endTime}`);
    });

    const slots = Array.from(slotsSet).map(slotStr => {
      const [start, end] = slotStr.split('-');
      return { start, end };
    });

    slots.sort((a, b) => {
      if (a.start === b.start) return a.end.localeCompare(b.end);
      return a.start.localeCompare(b.start);
    });

    return slots.length > 0 ? slots : [
      { start: '07:00', end: '08:30' },
      { start: '08:30', end: '10:00' }
    ];
  }, [state.schedules]);

  const handleOpenForm = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleForm({ ...schedule });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        dayOfWeek: 'Senin',
        startTime: '07:00',
        endTime: '08:30',
        classId: '',
        subjectId: '',
        teacherId: ''
      });
    }
    setIsSheetOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.dayOfWeek || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.classId || !scheduleForm.subjectId || !scheduleForm.teacherId) {
      toast.error('Semua kolom wajib diisi');
      return;
    }

    // Validate: endTime must be after startTime
    const getMinutesVal = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    if (getMinutesVal(scheduleForm.endTime!) <= getMinutesVal(scheduleForm.startTime!)) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }

    // Check for time overlap helper
    const isOverlap = (startA: string, endA: string, startB: string, endB: string) => {
      const a0 = getMinutesVal(startA), a1 = getMinutesVal(endA);
      const b0 = getMinutesVal(startB), b1 = getMinutesVal(endB);
      return a0 < b1 && b0 < a1;
    };

    // Get existing schedules for the same day, excluding the schedule being edited
    const sameDaySchedules = state.schedules.filter(
      s => s.dayOfWeek === scheduleForm.dayOfWeek && (editingSchedule ? s.id !== editingSchedule.id : true)
    );

    // Check teacher conflict: same teacher at overlapping time
    const teacherConflict = sameDaySchedules.find(
      s => s.teacherId === scheduleForm.teacherId && isOverlap(s.startTime, s.endTime, scheduleForm.startTime!, scheduleForm.endTime!)
    );
    if (teacherConflict) {
      const teacher = state.teachers.find(t => t.id === scheduleForm.teacherId);
      const conflictClass = state.classes.find(c => c.id === teacherConflict.classId);
      toast.error(`Bentrok! ${teacher?.name || 'Guru'} sudah mengajar di ${conflictClass?.name || 'kelas lain'} pada ${teacherConflict.startTime}–${teacherConflict.endTime}`);
      return;
    }

    // Check class conflict: same class at overlapping time
    const classConflict = sameDaySchedules.find(
      s => s.classId === scheduleForm.classId && isOverlap(s.startTime, s.endTime, scheduleForm.startTime!, scheduleForm.endTime!)
    );
    if (classConflict) {
      const cls = state.classes.find(c => c.id === scheduleForm.classId);
      const conflictSubject = state.subjects.find(sub => sub.id === classConflict.subjectId);
      toast.error(`Bentrok! ${cls?.name || 'Kelas'} sudah ada jadwal ${conflictSubject?.name || 'mapel lain'} pada ${classConflict.startTime}–${classConflict.endTime}`);
      return;
    }

    if (editingSchedule) {
      dispatch({ type: 'UPDATE_SCHEDULE', payload: { ...editingSchedule, ...scheduleForm } as Schedule });
      toast.success('Jadwal berhasil diperbarui');
    } else {
      const newSchedule: Schedule = {
        id: `sch${Date.now()}`,
        schoolId: state.currentUser?.schoolId || 'sch1',
        dayOfWeek: scheduleForm.dayOfWeek as DayOfWeek,
        startTime: scheduleForm.startTime || '',
        endTime: scheduleForm.endTime || '',
        classId: scheduleForm.classId || '',
        subjectId: scheduleForm.subjectId || '',
        teacherId: scheduleForm.teacherId || ''
      };
      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      toast.success('Jadwal baru berhasil ditambahkan');
    }
    setIsSheetOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      dispatch({ type: 'DELETE_SCHEDULE', payload: id });
      toast.success('Jadwal berhasil dihapus');
    }
  };

  // Find conflicts: same teacher scheduled at the same day & same start time for different classes
  const conflicts = useMemo(() => {
    const issues: { day: string; time: string; teacherId: string }[] = [];
    
    days.forEach(day => {
      dynamicTimeSlots.forEach(slot => {
        const schedulesInSlot = state.schedules.filter(
          s => s.dayOfWeek === day && s.startTime === slot.start && s.endTime === slot.end
        );
        
        const teacherCounts = new Map<string, number>();
        schedulesInSlot.forEach(s => {
          teacherCounts.set(s.teacherId, (teacherCounts.get(s.teacherId) || 0) + 1);
        });

        teacherCounts.forEach((count, teacherId) => {
          if (count > 1) {
            issues.push({ day, time: slot.start, teacherId });
          }
        });
      });
    });

    return issues;
  }, [state.schedules, dynamicTimeSlots]);

  return (
    <div className="p-4 space-y-6 h-[calc(100vh-4rem)] flex flex-col pb-24">
      {/* Header */}
      <div className="flex justify-between items-end shrink-0 px-1 pt-2">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-nabawi rounded-full" />
            <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Jadwal Pelajaran</h1>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Matriks & Deteksi Bentrok</p>
        </motion.div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsRekapOpen(true)} 
            className="rounded-2xl h-12 px-5 text-gray-700 bg-white border-white shadow-xl shadow-gray-200/50 hover:bg-gray-50 font-black text-xs uppercase tracking-tighter transition-all active:scale-95"
          >
            <ClipboardList className="w-4 h-4 mr-2 text-nabawi" />
            Rekap
          </Button>
          <Button 
            onClick={() => handleOpenForm()} 
            className="bg-nabawi hover:bg-nabawi-dark rounded-2xl h-12 px-6 shadow-lg shadow-nabawi/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Conflicts Alert - Premium Version */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-white/40 backdrop-blur-xl border border-terra/30 rounded-3xl p-5 shrink-0 shadow-2xl shadow-terra/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-terra/5 rounded-full -mr-16 -mt-16" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-terra/10 flex items-center justify-center shrink-0 border border-terra/20">
                <AlertTriangle className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h3 className="text-sm font-black text-terra uppercase tracking-tight">Terdeteksi Jadwal Bentrok!</h3>
                <p className="text-xs text-terra/60 font-bold uppercase tracking-tighter mb-2">Segera perbaiki jadwal di bawah ini:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {conflicts.map((c, i) => {
                    const teacher = state.teachers.find(t => t.id === c.teacherId);
                    return (
                      <span key={i} className="px-3 py-1.5 bg-white/60 border border-terra/20 rounded-xl text-[10px] font-black text-terra shadow-sm uppercase tracking-tighter">
                        {teacher?.name.split(' ')[0]} ({c.day}, {c.time})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Matrix - Premium Table */}
      <div className="flex-1 overflow-auto rounded-[2.5rem] border border-white bg-white/50 backdrop-blur-md shadow-2xl shadow-gray-200/50 relative min-h-0">
        <div className="min-w-[700px] pb-4">
          {/* Header Row (Days) */}
          <div className="grid grid-cols-[100px_repeat(6,1fr)] bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100/50">
            <div className="p-4 flex items-center justify-center border-r border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {days.map(day => (
              <div key={day} className="p-4 text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">HARI</span>
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{day}</span>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          {dynamicTimeSlots.map((slot, i) => (
            <div key={i} className="grid grid-cols-[100px_repeat(6,1fr)] group">
              {/* Time Column */}
              <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100 bg-gray-50/30 group-hover:bg-gray-100/50 transition-colors">
                <span className="text-sm font-black text-gray-900 tracking-tighter leading-none mb-1">{slot.start}</span>
                <div className="w-1 h-3 bg-gray-200 rounded-full my-1" />
                <span className="text-[10px] font-black text-gray-400 tracking-tighter leading-none uppercase">{slot.end}</span>
              </div>

              {/* Day Columns */}
              {days.map(day => {
                const daySchedules = state.schedules.filter(
                  s => s.dayOfWeek === day && s.startTime === slot.start && s.endTime === slot.end
                );

                return (
                  <div key={`${day}-${slot.start}`} className="p-2 border-r border-gray-50 last:border-0 min-h-[100px] relative group/cell">
                    <div className="absolute inset-0 bg-nabawi/0 group-hover/cell:bg-nabawi/2 transition-colors" />
                    <div className="relative z-10 h-full flex flex-col gap-2">
                      {daySchedules.length > 0 ? (
                        daySchedules.map(schedule => {
                          const cls = state.classes.find(c => c.id === schedule.classId);
                          const subject = state.subjects.find(s => s.id === schedule.subjectId);
                          const teacher = state.teachers.find(t => t.id === schedule.teacherId);
                          const isConflict = conflicts.some(
                            c => c.day === day && c.time === slot.start && c.teacherId === schedule.teacherId
                          );

                          return (
                            <DropdownMenu key={schedule.id}>
                              <DropdownMenuTrigger className="w-full text-left outline-none group/item">
                                <motion.div 
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`p-3 rounded-2xl border-2 shadow-sm ${
                                    isConflict 
                                      ? 'bg-white border-terra/30 shadow-terra/10 hover:border-terra' 
                                      : 'bg-white border-white shadow-gray-200/40 hover:border-nabawi/30 hover:shadow-nabawi/5'
                                  } transition-all cursor-pointer`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className={`text-[11px] font-black uppercase tracking-tight truncate flex-1 ${isConflict ? 'text-terra' : 'text-gray-900'}`}>
                                      {subject?.name}
                                    </span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border uppercase tracking-tighter shrink-0 ${
                                      isConflict ? 'bg-terra/5 border-terra/10 text-terra' : 'bg-gray-50 border-gray-100 text-gray-500'
                                    }`}>
                                      {cls?.name}
                                    </span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 ${isConflict ? 'text-terra/50' : 'text-nabawi'} font-bold`}>
                                    <div className="w-5 h-5 rounded-full bg-current opacity-10 flex items-center justify-center shrink-0">
                                       <GraduationCap className="w-3 h-3" />
                                    </div>
                                    <span className="text-[9px] truncate font-black uppercase tracking-tighter">
                                      {teacher?.name.split(' ')[0]}
                                    </span>
                                  </div>
                                </motion.div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40 rounded-2xl p-1.5 shadow-2xl border-gray-100">
                                <DropdownMenuItem onClick={() => handleOpenForm(schedule)} className="rounded-xl font-bold text-xs p-2.5">
                                  <Edit className="w-4 h-4 mr-2 text-nabawi" /> Edit Jadwal
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl font-bold text-xs p-2.5" onClick={() => handleDeleteSchedule(schedule.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Form Sheet */}
      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        description={editingSchedule ? 'Ubah informasi jadwal di bawah ini.' : 'Masukkan jadwal pelajaran baru ke dalam sistem.'}
        onSave={handleSaveSchedule}
      >
        <div className="space-y-1.5">
          <Label>Hari <span className="text-red-500">*</span></Label>
          <select 
            value={scheduleForm.dayOfWeek}
            onChange={e => setScheduleForm(prev => ({ ...prev, dayOfWeek: e.target.value as DayOfWeek }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Jam Mulai <span className="text-red-500">*</span></Label>
            <Input 
              type="time"
              value={scheduleForm.startTime}
              onChange={e => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Jam Selesai <span className="text-red-500">*</span></Label>
            <Input 
              type="time"
              value={scheduleForm.endTime}
              onChange={e => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Kelas <span className="text-red-500">*</span></Label>
          <select 
            value={scheduleForm.classId}
            onChange={e => setScheduleForm(prev => ({ ...prev, classId: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            <option value="" disabled>-- Pilih Kelas --</option>
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Mata Pelajaran <span className="text-red-500">*</span></Label>
          <select 
            value={scheduleForm.subjectId}
            onChange={e => setScheduleForm(prev => ({ ...prev, subjectId: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            <option value="" disabled>-- Pilih Mapel --</option>
            {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Guru Pengajar <span className="text-red-500">*</span></Label>
          <select 
            value={scheduleForm.teacherId}
            onChange={e => setScheduleForm(prev => ({ ...prev, teacherId: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            <option value="" disabled>-- Pilih Guru --</option>
            {state.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </FormSheet>

      {/* Rekap Sheet */}
      <Sheet open={isRekapOpen} onOpenChange={setIsRekapOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md sm:w-[450px] flex flex-col p-0">
          <SheetHeader className="shrink-0 p-6 border-b border-gray-100">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-nabawi" />
              Rekap Jam Mengajar
            </SheetTitle>
            <SheetDescription>
              Ringkasan total jam mengajar guru berdasarkan matriks jadwal saat ini.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {/* JP Configuration Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setShowJpConfig(!showJpConfig)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Konfigurasi Durasi JP</h4>
                    <p className="text-xs text-gray-500">1 JP = <span className="font-bold text-amber-600">{jpDuration} menit</span></p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showJpConfig ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>

              {/* Expandable Config Panel */}
              {showJpConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50"
                >
                  <p className="text-xs text-gray-500">
                    Pilih durasi 1 JP sesuai ketentuan sekolah:
                  </p>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {JP_PRESETS.map(preset => (
                      <button
                        key={preset}
                        onClick={() => handleSetJpDuration(preset)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                          jpDuration === preset
                            ? 'bg-nabawi text-white shadow-md scale-105'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-nabawi/40 hover:bg-nabawi/5'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Menit lainnya..."
                      min={10}
                      max={120}
                      value={customJpInput}
                      onChange={e => setCustomJpInput(e.target.value)}
                      className="rounded-xl text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!customJpInput}
                      onClick={() => {
                        const val = parseInt(customJpInput);
                        if (!isNaN(val)) handleSetJpDuration(val);
                      }}
                      className="rounded-xl px-4 border-nabawi/30 text-nabawi hover:bg-nabawi/10"
                    >
                      Atur
                    </Button>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Pengaturan ini berlaku untuk seluruh perhitungan rekap jam mengajar di sekolah Anda. 
                    Umum: SD/MI = 30–35 menit, SMP/MTs = 40 menit, SMA/MA = 45 menit.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Teacher Rekap Cards */}
            {teachingHours.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">Belum ada data jadwal untuk direkap.</p>
              </div>
            ) : (
              teachingHours.map((rekap, i) => (
                <motion.div 
                  key={rekap.teacherId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-nabawi/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-nabawi" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{rekap.teacherName}</h4>
                        <p className="text-xs text-gray-500">{rekap.classBreakdown.length} Kelas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-nabawi-dark">{rekap.formattedJp}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{rekap.formattedTotal}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-500 px-1">Rincian per Kelas:</p>
                    {rekap.classBreakdown.map(cb => (
                      <div key={cb.classId} className="flex justify-between items-center text-sm px-2 py-1.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-700 font-medium">{cb.className}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-nabawi-dark font-bold text-xs">{cb.formattedJp}</span>
                          <span className="text-gray-400 font-mono text-[10px]">({cb.formatted})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
