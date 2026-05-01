'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { X, User as UserIcon, Book, Calendar } from 'lucide-react';
import type { Student } from '@/types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  const { state } = useApp();

  if (!student) return null;

  // Calculate Attendance
  const attendance = { H: 0, S: 0, I: 0, A: 0 };
  state.journals.forEach(j => {
    const record = j.attendance?.find(a => a.studentId === student.id);
    if (record && attendance[record.status] !== undefined) {
      attendance[record.status]++;
    }
  });
  const totalAttendance = attendance.H + attendance.S + attendance.I + attendance.A;

  // Get Grades
  const grades = state.grades.filter(g => g.studentId === student.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-nabawi/10 flex items-center justify-center text-nabawi">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{student.name}</h2>
                <p className="text-xs text-gray-500">NISN: {student.nisn}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Attendance Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">Rekap Absensi</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-success/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-medium text-success mb-1">Hadir</p>
                  <p className="text-lg font-bold text-success-dark">{attendance.H}</p>
                </div>
                <div className="bg-info/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-medium text-info mb-1">Sakit</p>
                  <p className="text-lg font-bold text-info-dark">{attendance.S}</p>
                </div>
                <div className="bg-warning/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-medium text-warning mb-1">Izin</p>
                  <p className="text-lg font-bold text-warning-dark">{attendance.I}</p>
                </div>
                <div className="bg-terra/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-medium text-terra mb-1">Alpa</p>
                  <p className="text-lg font-bold text-terra-dark">{attendance.A}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-right">Total Pertemuan: {totalAttendance}</p>
            </div>

            {/* Grades Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Book className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">Rekap Nilai</h3>
              </div>
              
              {grades.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500">Belum ada data nilai</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 font-semibold text-gray-600">Mapel</th>
                        <th className="p-3 font-semibold text-gray-600 text-center">NH</th>
                        <th className="p-3 font-semibold text-gray-600 text-center">UTS</th>
                        <th className="p-3 font-semibold text-gray-600 text-center">UAS</th>
                        <th className="p-3 font-semibold text-nabawi text-center">NA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {grades.map(g => {
                        const subject = state.subjects.find(s => s.id === g.subjectId);
                        return (
                          <tr key={g.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-medium text-gray-800">{subject?.name || '-'}</td>
                            <td className="p-3 text-center font-mono">{g.nilaiHarian ?? '-'}</td>
                            <td className="p-3 text-center font-mono">{g.uts ?? '-'}</td>
                            <td className="p-3 text-center font-mono">{g.uas ?? '-'}</td>
                            <td className="p-3 text-center font-mono font-bold text-nabawi-dark">{g.nilaiAkhir ?? '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
