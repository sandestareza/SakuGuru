'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { AlertTriangle, Clock, GraduationCap } from 'lucide-react';
import type { DayOfWeek } from '@/types';

const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const timeSlots = [
  { start: '07:00', end: '08:30' },
  { start: '08:30', end: '10:00' },
  { start: '10:15', end: '11:45' },
];

export default function SchedulesPage() {
  const { state } = useApp();

  // Find conflicts: same teacher scheduled at the same day & same start time for different classes
  const conflicts = useMemo(() => {
    const issues: { day: string; time: string; teacherId: string }[] = [];
    
    days.forEach(day => {
      timeSlots.forEach(slot => {
        const schedulesInSlot = state.schedules.filter(
          s => s.dayOfWeek === day && s.startTime === slot.start
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
  }, [state.schedules]);

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Jadwal Pelajaran</h1>
        <p className="text-sm text-gray-500">Matriks jadwal dan deteksi bentrok</p>
      </motion.div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-terra/10 border border-terra/20 rounded-xl p-3 shrink-0"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-terra shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-terra">Terdeteksi Jadwal Bentrok!</h3>
              <ul className="text-xs text-terra-muted mt-1 space-y-1">
                {conflicts.map((c, i) => {
                  const teacher = state.teachers.find(t => t.id === c.teacherId);
                  return (
                    <li key={i}>• {teacher?.name} (Hari {c.day}, Jam {c.time})</li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid Matrix (Scrollable) */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm relative">
        <div className="min-w-[600px]">
          {/* Header Row (Days) */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <div className="p-2 flex items-center justify-center border-r border-gray-200">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            {days.map(day => (
              <div key={day} className="p-2 text-center text-xs font-bold text-gray-700 border-r border-gray-200 last:border-0 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          {timeSlots.map((slot, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 last:border-0">
              {/* Time Column */}
              <div className="p-2 flex flex-col items-center justify-center border-r border-gray-100 bg-gray-50/50">
                <span className="text-xs font-mono font-semibold text-gray-700">{slot.start}</span>
                <span className="text-[10px] font-mono text-gray-400">{slot.end}</span>
              </div>

              {/* Day Columns */}
              {days.map(day => {
                const daySchedules = state.schedules.filter(
                  s => s.dayOfWeek === day && s.startTime === slot.start
                );

                return (
                  <div key={`${day}-${slot.start}`} className="p-1.5 border-r border-gray-100 last:border-0 min-h-[80px]">
                    {daySchedules.length > 0 ? (
                      <div className="space-y-1.5">
                        {daySchedules.map(schedule => {
                          const cls = state.classes.find(c => c.id === schedule.classId);
                          const subject = state.subjects.find(s => s.id === schedule.subjectId);
                          const isConflict = conflicts.some(
                            c => c.day === day && c.time === slot.start && c.teacherId === schedule.teacherId
                          );

                          return (
                            <div 
                              key={schedule.id} 
                              className={`p-1.5 rounded-lg border text-[10px] ${
                                isConflict 
                                  ? 'bg-terra/10 border-terra/30' 
                                  : 'bg-nabawi/5 border-nabawi/20 hover:bg-nabawi/10'
                              } transition-colors`}
                            >
                              <div className="flex items-center justify-between font-bold mb-0.5">
                                <span className={isConflict ? 'text-terra' : 'text-nabawi-dark'}>{subject?.name}</span>
                                <span className="bg-white/50 px-1 rounded text-gray-600">{cls?.name}</span>
                              </div>
                              <div className={`flex items-center gap-1 ${isConflict ? 'text-terra-muted' : 'text-gray-500'}`}>
                                <GraduationCap className="w-3 h-3" />
                                <span className="truncate w-full">{state.teachers.find(t => t.id === schedule.teacherId)?.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-gray-300">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
