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
    <div className="p-4 space-y-6 pb-20">
      {/* Header with Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 px-1"
      >
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-bold text-nabawi/60 uppercase tracking-widest leading-none mb-2">{getGreeting()}</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Admin <span className="text-transparent bg-clip-text bg-linear-to-r from-nabawi to-emerald-600">SakuGuru</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">
              {format(today, "EEEE, d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-gray-200 flex items-center justify-center border border-gray-100">
             <span className="text-2xl">👋</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Metrics - Premium Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Total Kelas */}
        <div className="group relative bg-white rounded-[2rem] p-5 shadow-xl shadow-blue-900/5 border border-white overflow-hidden active:scale-95 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center mb-4 text-white">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">{metrics.totalKelas}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Kelas</p>
          </div>
        </div>
        
        {/* Guru Hadir */}
        <div className="group relative bg-white rounded-[2rem] p-5 shadow-xl shadow-emerald-900/5 border border-white overflow-hidden active:scale-95 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200 flex items-center justify-center mb-4 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">{metrics.kehadiranGuru}%</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guru Hadir</p>
          </div>
        </div>

        {/* Kelas Kosong */}
        <div className="group relative bg-white rounded-[2rem] p-5 shadow-xl shadow-terra/5 border border-white overflow-hidden active:scale-95 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-terra/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${metrics.emptyClasses > 0 ? 'bg-terra' : 'bg-gray-100'} shadow-lg ${metrics.emptyClasses > 0 ? 'shadow-terra/20' : ''} flex items-center justify-center mb-4 text-white`}>
              <AlertTriangle className={`w-6 h-6 ${metrics.emptyClasses > 0 ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <p className={`text-3xl font-black tracking-tighter leading-none mb-1 ${metrics.emptyClasses > 0 ? 'text-terra' : 'text-gray-900'}`}>
              {metrics.emptyClasses}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kelas Kosong</p>
          </div>
        </div>
      </motion.div>

      {/* Live Feed KBM - Premium Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-nabawi rounded-full" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Monitoring KBM</h2>
          </div>
          <span className="flex items-center gap-2 text-[10px] text-emerald-600 font-black px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </span>
        </div>

        {liveFeed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-12 text-center border border-white shadow-xl shadow-gray-200/50"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-800">Belum Ada Aktivitas</p>
            <p className="text-xs text-gray-400 mt-1">Jurnal KBM yang diselesaikan guru akan muncul di sini secara real-time.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {liveFeed.map((item, index) => (
              <motion.div
                key={item.journal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="group relative bg-white rounded-3xl p-5 border border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-nabawi/10 transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-nabawi/10 flex items-center justify-center text-nabawi font-black text-sm shadow-inner">
                       {item.cls?.name.split(' ')[0] || 'K'}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-gray-900 leading-none mb-1 uppercase tracking-tight">
                        {item.cls?.name || '-'}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {item.journal.submittedAt ? format(new Date(item.journal.submittedAt), 'HH:mm') : '-'} WIB
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
                    SELESAI
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center text-lg font-black text-nabawi shrink-0">
                    {item.teacher?.name.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.teacher?.name || '-'}</h3>
                    <p className="text-xs text-nabawi font-black uppercase tracking-tighter truncate">{item.subject?.name || '-'}</p>
                  </div>
                </div>
                
                {item.journal.material && (
                  <div className="mt-4 px-2">
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-nabawi/20 pl-3">
                      "{item.journal.material}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
