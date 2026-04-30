'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Users, GraduationCap, AlertTriangle, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import type { DayOfWeek } from '@/types';

const dayMap: Record<number, DayOfWeek> = {
  1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function AdminHomePage() {
  const { state } = useApp();
  const today = new Date();
  const todayDay = dayMap[today.getDay()] || 'Senin';
  const todayDateStr = format(today, 'yyyy-MM-dd');

  // Metrics calculation
  const metrics = useMemo(() => {
    const todaySchedules = state.schedules.filter(s => s.dayOfWeek === todayDay);
    const todayJournals = state.journals.filter(j => j.date === todayDateStr && j.status === 'completed');
    
    const totalKelas = state.classes.length;
    
    // Guru hadir % = (submitted journals / total schedules) * 100
    // In real app, might want to calculate distinct teachers
    const presentTeachers = new Set(todayJournals.map(j => j.teacherId)).size;
    const totalScheduledTeachers = new Set(todaySchedules.map(s => s.teacherId)).size;
    const kehadiranGuru = totalScheduledTeachers > 0 
      ? Math.round((presentTeachers / totalScheduledTeachers) * 100) 
      : 100;

    // Kelas kosong = schedules that have ended but no journal
    const now = new Date();
    let emptyClasses = 0;
    
    todaySchedules.forEach(schedule => {
      const [eh, em] = schedule.endTime.split(':').map(Number);
      const endTime = new Date(today);
      endTime.setHours(eh, em, 0, 0);
      
      // If end time + 30 mins buffer has passed and no journal
      if (now.getTime() > endTime.getTime() + 30 * 60000) {
        const hasJournal = todayJournals.some(j => j.scheduleId === schedule.id);
        if (!hasJournal) emptyClasses++;
      }
    });

    return { totalKelas, kehadiranGuru, emptyClasses };
  }, [state.schedules, state.journals, state.classes, todayDay, todayDateStr, today]);

  // Live Feed KBM
  const liveFeed = useMemo(() => {
    return state.journals
      .filter(j => j.date === todayDateStr && j.status === 'completed')
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      .map(journal => {
        const teacher = state.teachers.find(t => t.id === journal.teacherId);
        const cls = state.classes.find(c => c.id === journal.classId);
        const subject = state.subjects.find(s => s.id === journal.subjectId);
        
        return { journal, teacher, cls, subject };
      });
  }, [state.journals, state.teachers, state.classes, state.subjects, todayDateStr]);

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <p className="text-sm text-gray-500">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-gray-900">Admin Sekolah 👋</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {format(today, "EEEE, d MMMM yyyy", { locale: localeId })}
        </p>
      </motion.div>

      {/* Hero Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-nabawi/10 flex items-center justify-center mb-2">
            <Users className="w-4 h-4 text-nabawi" />
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.totalKelas}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Total Kelas</p>
        </div>
        
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mb-2">
            <GraduationCap className="w-4 h-4 text-success" />
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.kehadiranGuru}%</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Guru Hadir</p>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-terra/10 flex items-center justify-center mb-2">
            <AlertTriangle className={`w-4 h-4 ${metrics.emptyClasses > 0 ? 'text-terra' : 'text-gray-400'}`} />
          </div>
          <p className={`text-xl font-bold ${metrics.emptyClasses > 0 ? 'text-terra' : 'text-gray-900'}`}>
            {metrics.emptyClasses}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">Kelas Kosong</p>
        </div>
      </motion.div>

      {/* Live Feed KBM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-gray-700">Live Feed KBM</h2>
          <span className="flex items-center gap-1.5 text-[10px] text-success font-medium px-2 py-1 bg-success/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>

        {liveFeed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
          >
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada jurnal KBM hari ini</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {liveFeed.map((item, index) => (
              <motion.div
                key={item.journal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-gray-900">{item.cls?.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {item.journal.submittedAt ? format(new Date(item.journal.submittedAt), 'HH:mm') : '-'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {item.teacher?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{item.teacher?.name || '-'}</h3>
                    <p className="text-xs text-nabawi font-medium">{item.subject?.name || '-'}</p>
                    {item.journal.material && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.journal.material}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
