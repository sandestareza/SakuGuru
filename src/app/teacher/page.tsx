'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CheckCircle2, Clock, Lock, ChevronRight, BookOpen } from 'lucide-react';
import type { JournalStatus, DayOfWeek } from '@/types';

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

function getScheduleStatus(startTime: string, endTime: string): JournalStatus {
  const now = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  
  // Strict: only active during exact lesson time, no tolerance
  if (now < start) return 'locked';
  if (now >= start && now <= end) return 'active';
  return 'missed';
}

export default function TeacherHomePage() {
  const router = useRouter();
  const { state } = useApp();

  const today = new Date();
  const todayDay = dayMap[today.getDay()] || 'Senin';
  const currentUser = state.currentUser;
  const userName = currentUser?.name?.split(',')[0] || 'Ustadz';

  const todaySchedules = useMemo(() => {
    return state.schedules
      .filter(s => s.dayOfWeek === todayDay && s.teacherId === 't1')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(schedule => {
        const journal = state.journals.find(
          j => j.scheduleId === schedule.id && j.date === format(today, 'yyyy-MM-dd')
        );
        const className = state.classes.find(c => c.id === schedule.classId)?.name || '';
        const subjectName = state.subjects.find(s => s.id === schedule.subjectId)?.name || '';
        
        let status: JournalStatus;
        if (journal?.status === 'completed') {
          status = 'completed';
        } else {
          status = getScheduleStatus(schedule.startTime, schedule.endTime);
        }

        return { schedule, journal, className, subjectName, status };
      });
  }, [state.schedules, state.journals, state.classes, state.subjects, todayDay, today]);

  const statusConfig: Record<JournalStatus, { bg: string; border: string; icon: React.ReactNode; label: string; textColor: string }> = {
    completed: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      label: 'Jurnal Terisi',
      textColor: 'text-gray-500',
    },
    active: {
      bg: 'bg-nabawi/5',
      border: 'border-nabawi/30',
      icon: <Clock className="w-5 h-5 text-nabawi" />,
      label: 'Isi Sekarang',
      textColor: 'text-nabawi',
    },
    locked: {
      bg: 'bg-gray-50/50',
      border: 'border-gray-100',
      icon: <Lock className="w-5 h-5 text-gray-300" />,
      label: 'Terkunci',
      textColor: 'text-gray-400',
    },
    missed: {
      bg: 'bg-terra-muted',
      border: 'border-terra/20',
      icon: <Lock className="w-5 h-5 text-terra" />,
      label: 'Terlewat',
      textColor: 'text-terra',
    },
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header - Premium Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1 pt-2"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-nabawi rounded-full" />
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">{getGreeting()}, {userName} 👋</h1>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">
          {format(today, "EEEE, d MMMM yyyy", { locale: localeId })}
        </p>
      </motion.div>

      {/* Stats Summary - Premium Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Total Kelas', value: todaySchedules.length, color: 'text-nabawi', bg: 'bg-nabawi/5' },
          { label: 'Selesai', value: todaySchedules.filter(s => s.status === 'completed').length, color: 'text-success', bg: 'bg-success/5' },
          { label: 'Belum', value: todaySchedules.filter(s => s.status !== 'completed').length, color: 'text-terra', bg: 'bg-terra/5' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 text-center border-b-4 border-white shadow-xl shadow-gray-200/50 relative overflow-hidden group`}>
            <div className={`absolute inset-0 ${stat.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <p className={`text-2xl font-black ${stat.color} relative z-10 tracking-tighter`}>{stat.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter relative z-10 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Jadwal Hari Ini</h2>
          <div className="h-px flex-1 bg-gray-100 ml-4" />
        </div>
        
        {todaySchedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2rem] p-10 text-center border border-white shadow-2xl shadow-gray-200/50"
          >
            <div className="w-16 h-16 bg-nabawi/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-nabawi" />
            </div>
            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Tidak Ada Jadwal</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Selamat Beristirahat! 🌟</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {todaySchedules.map((item, index) => {
              const config = statusConfig[item.status];
              const isActive = item.status === 'active';

              return (
                <motion.div
                  key={item.schedule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  onClick={() => {
                    if (isActive) router.push(`/teacher/journal?scheduleId=${item.schedule.id}`);
                  }}
                  className={`group relative rounded-[1.8rem] p-5 bg-white border-2 border-white shadow-xl shadow-gray-200/40 transition-all duration-300 ${
                    isActive ? 'cursor-pointer hover:border-nabawi/30 hover:shadow-2xl hover:shadow-nabawi/10 active:scale-[0.98]' : ''
                  } ${item.status === 'locked' || item.status === 'missed' ? 'opacity-80 grayscale-[0.3]' : ''}`}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-nabawi text-white rounded-full flex items-center justify-center shadow-lg animate-bounce-slow z-20">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black text-nabawi-dark bg-nabawi/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                          {item.schedule.startTime} - {item.schedule.endTime}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          {item.className}
                        </span>
                      </div>
                      <h3 className={`text-lg font-black tracking-tight mb-1 uppercase ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.subjectName}
                      </h3>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-nabawi animate-pulse' : 'bg-gray-200'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-nabawi' : 'text-gray-400'}`}>
                           {config.label}
                         </span>
                      </div>
                    </div>
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white shadow-inner shrink-0 ${config.bg.replace('5', '10')}`}>
                      {config.icon}
                    </div>
                  </div>

                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between"
                    >
                      <span className="text-[10px] font-black text-nabawi uppercase tracking-widest">Ketuk untuk mengisi jurnal</span>
                      <div className="w-8 h-8 rounded-full bg-nabawi/5 flex items-center justify-center group-hover:bg-nabawi group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
