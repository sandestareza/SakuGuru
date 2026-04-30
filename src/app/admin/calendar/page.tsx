'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { ArrowLeft, CalendarDays, Plus, Calendar as CalendarIcon, Clock, Flag, GraduationCap, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { CalendarEventType } from '@/types';

const eventTypeConfig: Record<CalendarEventType, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  libur: { color: 'text-terra', bg: 'bg-terra/10 border-terra/20', icon: <Flag className="w-4 h-4" />, label: 'Libur' },
  ujian: { color: 'text-gold-dark', bg: 'bg-gold/10 border-gold/20', icon: <GraduationCap className="w-4 h-4" />, label: 'Ujian' },
  rapat: { color: 'text-info', bg: 'bg-info/10 border-info/20', icon: <Clock className="w-4 h-4" />, label: 'Rapat' },
  kegiatan: { color: 'text-nabawi', bg: 'bg-nabawi/10 border-nabawi/20', icon: <Star className="w-4 h-4" />, label: 'Kegiatan' },
};

export default function CalendarAdminPage() {
  const router = useRouter();
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);

  // Sort events by date ascending
  const events = [...state.calendarEvents].sort((a, b) => 
    a.startDate.localeCompare(b.startDate)
  );

  const handleSimulateDelete = () => {
    toast.success('Event berhasil dihapus (Simulasi)');
  };

  const handleSimulateAdd = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Event berhasil ditambahkan (Simulasi)');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => showForm ? setShowForm(false) : router.back()}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Kelola Kalender</h1>
            <p className="text-xs text-gray-500">Agenda Akademik</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="h-8 bg-nabawi hover:bg-nabawi-dark">
              <Plus className="w-4 h-4 mr-1" /> Event
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1">
        {showForm ? (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSimulateAdd} 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4"
          >
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Judul Event</label>
              <input required type="text" placeholder="Misal: Ujian Tengah Semester" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi" />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Tipe Event</label>
              <select className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi">
                <option value="libur">Libur</option>
                <option value="ujian">Ujian</option>
                <option value="rapat">Rapat</option>
                <option value="kegiatan">Kegiatan</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Tanggal Mulai</label>
                <input required type="date" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Tanggal Selesai</label>
                <input required type="date" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-nabawi" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Deskripsi (Opsional)</label>
              <textarea placeholder="Catatan tambahan..." className="w-full h-20 p-3 rounded-xl border border-gray-200 text-sm resize-none focus:ring-1 focus:ring-nabawi" />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-nabawi hover:bg-nabawi-dark">
              Simpan Event
            </Button>
          </motion.form>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => {
              const config = eventTypeConfig[event.type];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-xl p-4 border shadow-sm relative overflow-hidden group ${config.bg}`}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                    <div className="flex-1 pr-8">
                      <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                      {event.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
                      <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-gray-400">
                        <CalendarIcon className="w-3 h-3" />
                        {format(parseISO(event.startDate), 'd MMM yyyy', { locale: localeId })}
                        {event.startDate !== event.endDate && ` - ${format(parseISO(event.endDate), 'd MMM yyyy', { locale: localeId })}`}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSimulateDelete}
                    className="absolute top-2 right-2 p-2 text-gray-300 hover:text-terra hover:bg-terra/10 rounded-lg transition-colors z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
