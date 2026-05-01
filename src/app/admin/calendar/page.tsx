'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, addMonths, subMonths, getDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, GraduationCap, Clock, Flag, Star, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FormSheet } from '@/components/shared/form-sheet';
import type { CalendarEventType, CalendarEvent } from '@/types';

const eventTypeConfig: Record<CalendarEventType, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  libur: { color: 'text-terra', bg: 'bg-terra/10 border-terra/20', icon: <Flag className="w-4 h-4" />, label: 'Libur' },
  ujian: { color: 'text-gold-dark', bg: 'bg-gold/10 border-gold/20', icon: <GraduationCap className="w-4 h-4" />, label: 'Ujian' },
  rapat: { color: 'text-info', bg: 'bg-info/10 border-info/20', icon: <Clock className="w-4 h-4" />, label: 'Rapat' },
  kegiatan: { color: 'text-nabawi', bg: 'bg-nabawi/10 border-nabawi/20', icon: <Star className="w-4 h-4" />, label: 'Kegiatan' },
};

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarAdminPage() {
  const { state, dispatch } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    type: 'kegiatan',
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

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

  const handleOpenForm = () => {
    setEventForm({
      type: 'kegiatan',
      title: '',
      description: '',
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),
      endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd')
    });
    setIsSheetOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.type) {
      toast.error('Kolom judul, tipe, dan tanggal wajib diisi');
      return;
    }

    const newEvent: CalendarEvent = {
      id: `evt${Date.now()}`,
      schoolId: state.currentUser?.schoolId || 'sch1',
      title: eventForm.title,
      description: eventForm.description || '',
      startDate: eventForm.startDate,
      endDate: eventForm.endDate,
      type: eventForm.type as CalendarEventType
    };

    dispatch({ type: 'ADD_CALENDAR_EVENT', payload: newEvent });
    toast.success('Event berhasil ditambahkan');
    setIsSheetOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Yakin ingin menghapus event ini?')) {
      dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: id });
      toast.success('Event berhasil dihapus');
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start shrink-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-gray-900">Kelola Kalender</h1>
          <p className="text-sm text-gray-500">Agenda Akademik & Sekolah</p>
        </motion.div>
        <Button onClick={handleOpenForm} className="bg-nabawi hover:bg-nabawi-dark rounded-xl h-10 px-4">
          <Plus className="w-4 h-4 mr-2" />
          Event
        </Button>
      </div>

      {/* Calendar Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="flex flex-col md:flex-row-reverse items-start gap-4">
          
          {/* Calendar Grid (Right on Desktop, Top on Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-0"
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

        {/* Selected Date Events (Left on Desktop, Bottom on Mobile) */}
        <div className="w-full md:w-[320px] lg:w-[380px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-3">
                    {format(selectedDate, "EEEE, d MMMM yyyy", { locale: localeId })}
                  </h3>

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
                            className={`rounded-xl p-4 border relative group overflow-hidden ${config.bg}`}
                          >
                            <div className="flex items-start gap-3 relative z-10">
                              <div className={config.color}>{config.icon}</div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">{event.title}</h4>
                                {event.description && (
                                  <p className="text-xs text-gray-500 mt-1.5">{event.description}</p>
                                )}
                                <div className="flex items-center gap-1 mt-2.5 text-[10px] font-medium text-gray-400 bg-white/50 w-fit px-2 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3" />
                                  {format(parseISO(event.startDate), 'd MMM', { locale: localeId })}
                                  {event.startDate !== event.endDate && ` - ${format(parseISO(event.endDate), 'd MMM', { locale: localeId })}`}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-terra hover:bg-white/80 rounded-lg transition-colors z-20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">Tidak ada agenda</p>
                      <p className="text-xs text-gray-400 mt-1">Belum ada kegiatan pada tanggal ini</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleOpenForm}
                        className="mt-4 h-9 rounded-xl border-dashed border-gray-300 text-gray-600 hover:text-nabawi hover:border-nabawi hover:bg-nabawi/5"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Agenda
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hidden md:block"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Pilih Tanggal</h3>
                <p className="text-xs text-gray-500 mt-1">Klik tanggal pada kalender untuk melihat atau menambahkan agenda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        </div>
      </div>

      {/* Form Tambah Event */}
      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Tambah Event Baru"
        description="Masukkan informasi event ke dalam kalender akademik."
        onSave={handleSaveEvent}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Judul Event <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              value={eventForm.title}
              onChange={e => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Misal: Ujian Tengah Semester" 
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi outline-none" 
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Tipe Event <span className="text-red-500">*</span></label>
            <select 
              value={eventForm.type}
              onChange={e => setEventForm(prev => ({ ...prev, type: e.target.value as CalendarEventType }))}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi outline-none"
            >
              <option value="libur">Libur</option>
              <option value="ujian">Ujian</option>
              <option value="rapat">Rapat</option>
              <option value="kegiatan">Kegiatan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input 
                required 
                type="date" 
                value={eventForm.startDate}
                onChange={e => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input 
                required 
                type="date" 
                value={eventForm.endDate}
                onChange={e => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Deskripsi (Opsional)</label>
            <textarea 
              value={eventForm.description}
              onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Catatan tambahan..." 
              className="w-full h-20 p-3 rounded-xl border border-gray-200 text-sm resize-none focus:ring-1 focus:ring-nabawi outline-none" 
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
