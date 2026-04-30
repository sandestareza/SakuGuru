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
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900">Kalender Akademik</h1>
        <p className="text-sm text-gray-500">Agenda & jadwal sekolah</p>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
          </h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
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
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${
                  isSelected
                    ? 'bg-nabawi text-white shadow-md'
                    : isToday
                      ? 'bg-nabawi/10 text-nabawi font-bold ring-2 ring-nabawi/30'
                      : hasEvents
                        ? `${eventTypeConfig[eventType!].bg} border font-medium`
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
          {Object.entries(eventTypeConfig).map(([key, config]) => (
            <div key={key} className={`flex items-center gap-1.5 text-[10px] ${config.color}`}>
              <div className={`w-2.5 h-2.5 rounded-sm ${config.bg} border`} />
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
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-gray-700 px-1">
              {format(selectedDate, "EEEE, d MMMM yyyy", { locale: localeId })}
            </h3>

            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event, i) => {
                const config = eventTypeConfig[event.type];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl p-4 border ${config.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={config.color}>{config.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2">
                          {format(parseISO(event.startDate), 'd MMM', { locale: localeId })}
                          {event.startDate !== event.endDate && ` — ${format(parseISO(event.endDate), 'd MMM yyyy', { locale: localeId })}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Tidak ada agenda di tanggal ini</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
