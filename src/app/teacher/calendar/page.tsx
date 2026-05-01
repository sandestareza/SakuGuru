'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO, addMonths, subMonths, getDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, GraduationCap, Clock, Flag, Star } from 'lucide-react';
import type { CalendarEventType } from '@/types';

const eventTypeConfig: Record<CalendarEventType, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  libur: { color: 'text-terra', bg: 'bg-terra/10 border-terra/20', icon: <Flag className="w-4 h-4" />, label: 'Libur' },
  ujian: { color: 'text-gold-dark', bg: 'bg-gold/10 border-gold/20', icon: <GraduationCap className="w-4 h-4" />, label: 'Ujian' },
  rapat: { color: 'text-info', bg: 'bg-info/10 border-info/20', icon: <Clock className="w-4 h-4" />, label: 'Rapat' },
  kegiatan: { color: 'text-nabawi', bg: 'bg-nabawi/10 border-nabawi/20', icon: <Star className="w-4 h-4" />, label: 'Kegiatan' },
};

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarPage() {
  const { state } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Find events for a specific date
  const getEventsForDate = (date: Date) => {
    return state.calendarEvents.filter(event => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
    });
  };

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, state.calendarEvents]);

  const today = new Date();

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-1 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-nabawi rounded-full" />
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Kalender Akademik</h1>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Agenda & Jadwal Sekolah</p>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-gray-200/50 border-2 border-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <CalendarDays className="w-32 h-32 text-nabawi" />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(m => subMonths(m, 1))} 
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-nabawi hover:bg-nabawi/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
            {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
          </h2>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(m => addMonths(m, 1))} 
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-nabawi hover:bg-nabawi/5 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3 relative z-10">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[9px] font-black text-gray-300 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 relative z-10">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {daysInMonth.map(day => {
            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const eventType = hasEvents ? events[0].type : null;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative group ${
                  isSelected
                    ? 'bg-nabawi text-white shadow-lg shadow-nabawi/20 active:scale-95'
                    : isToday
                      ? 'bg-nabawi/5 text-nabawi font-black border-2 border-nabawi/20 active:scale-95'
                      : hasEvents
                        ? `${eventTypeConfig[eventType!].bg} border-2 border-white shadow-sm font-black active:scale-95`
                        : 'text-gray-900 font-bold hover:bg-gray-50 active:scale-95'
                }`}
              >
                <span className="text-[11px] uppercase tracking-tighter">{format(day, 'd')}</span>
                {hasEvents && !isSelected && (
                   <div className={`absolute bottom-1 w-1 h-1 rounded-full ${eventTypeConfig[eventType!].color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-gray-50 relative z-10">
          {Object.entries(eventTypeConfig).map(([key, config]) => (
            <div key={key} className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${config.color}`}>
              <div className={`w-3 h-3 rounded-md ${config.bg.replace('10', '20')} border-white border shadow-sm`} />
              {config.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Selected Date Events */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {format(selectedDate, "EEEE, d MMMM yyyy", { locale: localeId })}
              </h3>
              <div className="h-px flex-1 bg-gray-100 ml-4" />
            </div>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event, i) => {
                  const config = eventTypeConfig[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative rounded-[1.8rem] p-5 bg-white border-2 border-white shadow-xl shadow-gray-200/40 transition-all ${config.bg.replace('10', '5')}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm shrink-0 ${config.bg}`}>
                           <div className={config.color}>{config.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{event.title}</h4>
                          {event.description && (
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Clock className="w-3 h-3 text-gray-300" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {format(parseISO(event.startDate), 'd MMM', { locale: localeId })}
                              {event.startDate !== event.endDate && ` — ${format(parseISO(event.endDate), 'd MMM yyyy', { locale: localeId })}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-10 text-center border-2 border-white shadow-2xl shadow-gray-200/50">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Tidak Ada Agenda</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
