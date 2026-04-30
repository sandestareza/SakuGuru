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
  
  const bufferBefore = new Date(start.getTime() - 15 * 60000);
  const bufferAfter = new Date(end.getTime() + 30 * 60000);
  
  if (now < bufferBefore) return 'locked';
  if (now >= bufferBefore && now <= bufferAfter) return 'active';
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
    <div className="p-4 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <p className="text-sm text-gray-500">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-gray-900">{userName} 👋</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {format(today, "EEEE, d MMMM yyyy", { locale: localeId })}
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Total Kelas', value: todaySchedules.length, color: 'text-nabawi' },
          { label: 'Selesai', value: todaySchedules.filter(s => s.status === 'completed').length, color: 'text-success' },
          { label: 'Belum', value: todaySchedules.filter(s => s.status !== 'completed').length, color: 'text-gold-dark' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Schedule Cards */}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-gray-700 px-1">Jadwal Hari Ini</h2>
        
        {todaySchedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
          >
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Tidak ada jadwal hari ini</p>
            <p className="text-xs text-gray-400 mt-1">Selamat beristirahat! 🌟</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
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
                  className={`relative rounded-2xl p-4 border shadow-sm transition-all duration-200 ${config.bg} ${config.border} ${
                    isActive ? 'cursor-pointer animate-pulse-soft hover:shadow-md' : ''
                  } ${item.status === 'locked' || item.status === 'missed' ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {item.schedule.startTime} - {item.schedule.endTime}
                        </span>
                      </div>
                      <h3 className={`font-semibold ${item.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}`}>
                        {item.subjectName}
                      </h3>
                      <p className="text-sm text-gray-500">{item.className}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {config.icon}
                      <span className={`text-[10px] font-medium ${config.textColor}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-nabawi font-medium">Isi Jurnal Sekarang</span>
                      <ChevronRight className="w-4 h-4 text-nabawi" />
                    </div>
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
