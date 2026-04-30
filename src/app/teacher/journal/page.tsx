'use client';

import { useState, useMemo, Suspense, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, RotateCcw, X, Image as ImageIcon, Send, SwitchCamera } from 'lucide-react';
import type { AttendanceStatus, AttendanceRecord } from '@/types';

const statusColors: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
  H: { bg: 'bg-success text-white', text: 'text-success', label: 'Hadir' },
  S: { bg: 'bg-info text-white', text: 'text-info', label: 'Sakit' },
  I: { bg: 'bg-warning text-white', text: 'text-warning', label: 'Izin' },
  A: { bg: 'bg-terra text-white', text: 'text-terra', label: 'Alpa' },
};

function JournalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useApp();
  const scheduleId = searchParams.get('scheduleId') || '';

  const [step, setStep] = useState(1);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [material, setMaterial] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const webcamRef = useRef<Webcam>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const schedule = state.schedules.find(s => s.id === scheduleId);
  const className = state.classes.find(c => c.id === schedule?.classId)?.name || '';
  const subjectName = state.subjects.find(s => s.id === schedule?.subjectId)?.name || '';
  const students = useMemo(
    () => state.students.filter(s => s.classId === schedule?.classId),
    [state.students, schedule?.classId]
  );

  // Initialize attendance
  useMemo(() => {
    if (attendance.length === 0 && students.length > 0) {
      setAttendance(students.map(s => ({ studentId: s.id, status: 'H' as AttendanceStatus })));
    }
  }, [students, attendance.length]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, status } : a
    ));
  };

  const capturePhoto = useCallback(() => {
    if (photos.length >= 3 || !webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Apply watermark using canvas
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Add watermark background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, img.height - 60, img.width, 60);

          // Add text
          ctx.fillStyle = 'white';
          ctx.font = '16px sans-serif';
          ctx.fillText(`Foto Bukti KBM ${photos.length + 1}`, 10, img.height - 40);
          
          ctx.font = '12px sans-serif';
          ctx.fillText(`${new Date().toLocaleString('id-ID')}`, 10, img.height - 20);
          
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText('Pondok Pesantren Darussalam', 10, img.height - 5);

          const watermarkedSrc = canvas.toDataURL('image/jpeg', 0.8);
          setPhotos(prev => [...prev, watermarkedSrc]);
          setIsCameraOpen(false);
        }
      };
    }
  }, [photos.length]);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    const today = new Date().toISOString().split('T')[0];
    const journal = {
      id: `j_${Date.now()}`,
      scheduleId,
      teacherId: 't1',
      classId: schedule?.classId || '',
      subjectId: schedule?.subjectId || '',
      date: today,
      status: 'completed' as const,
      material,
      photos,
      attendance,
      submittedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_JOURNAL', payload: journal });
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push('/teacher');
    }, 3000);
  };

  const canProceedStep2 = attendance.length > 0;
  const canProceedStep3 = material.trim().length >= 10;
  const canProceedStep4 = photos.length >= 1;

  const steps = ['Absensi', 'Materi', 'Foto', 'Review'];

  // Success animation
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-14 h-14 text-success" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-bold text-gray-900 mb-2"
          >
            Alhamdulillah! ✨
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500"
          >
            Jurnal dan Absensi {className} berhasil disimpan.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-gray-400 mt-4"
          >
            Kembali ke beranda dalam 3 detik...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">{subjectName}</h1>
            <p className="text-xs text-gray-500">{className} • {schedule?.startTime} - {schedule?.endTime}</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {step}/{steps.length}
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mt-3">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-nabawi' : 'bg-gray-200'
              }`} />
              <span className={`text-[9px] ${i + 1 <= step ? 'text-nabawi font-medium' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Attendance */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Daftar Kehadiran</h2>
                <span className="text-xs text-gray-400">{students.length} siswa</span>
              </div>

              <div className="flex gap-3 text-xs text-gray-500 px-1">
                {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map(s => (
                  <span key={s} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${statusColors[s].bg.split(' ')[0]}`} />
                    {statusColors[s].label}: {attendance.filter(a => a.status === s).length}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5">
                {students.map((student, i) => {
                  const att = attendance.find(a => a.studentId === student.id);
                  const status = att?.status || 'H';
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono w-5">{i + 1}</span>
                        <span className="text-sm text-gray-800">{student.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setStudentStatus(student.id, s)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                              status === s
                                ? statusColors[s].bg
                                : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Material */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <h2 className="text-base font-semibold text-gray-900">Ringkasan Materi</h2>
              <p className="text-sm text-gray-500">Tuliskan materi yang diajarkan hari ini.</p>
              <Textarea
                placeholder="Contoh: Persamaan Kuadrat — Menyelesaikan persamaan ax² + bx + c = 0 menggunakan rumus ABC..."
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="min-h-[200px] rounded-xl bg-gray-50 border-gray-200 focus:bg-white resize-none text-sm"
              />
              <p className="text-xs text-gray-400 text-right">{material.length} karakter</p>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              {isCameraOpen ? (
                <div className="fixed inset-0 z-100 bg-black flex flex-col">
                  <div className="flex-1 relative flex items-center justify-center">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                      className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <SwitchCamera className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => setIsCameraOpen(false)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    
                    {/* Capture Button */}
                    <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform"
                      >
                        <div className="w-12 h-12 rounded-full bg-white"></div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Bukti Foto KBM</h2>
                    <p className="text-sm text-gray-500">Ambil foto suasana kelas (min. 1, maks. 3 foto).</p>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200">
                        <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 p-1">
                          <span className="text-[9px] text-white">Foto {i + 1}</span>
                        </div>
                      </div>
                    ))}

                    {photos.length < 3 && (
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="aspect-4/3 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-nabawi hover:bg-nabawi/5 transition-colors"
                      >
                        <Camera className="w-6 h-6 text-gray-400" />
                        <span className="text-[10px] text-gray-400">Ambil Foto</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gold/10 rounded-xl">
                    <ImageIcon className="w-4 h-4 text-gold-dark" />
                    <p className="text-xs text-gold-dark">
                      Foto akan diberi watermark otomatis (tanggal, waktu, lokasi, nama sekolah).
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <h2 className="text-base font-semibold text-gray-900">Review Jurnal</h2>
              <p className="text-sm text-gray-500">Periksa kembali sebelum mengirim.</p>

              {/* Summary Cards */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Kehadiran</h3>
                  <div className="flex gap-4">
                    {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map(s => (
                      <div key={s} className="text-center">
                        <p className={`text-lg font-bold ${statusColors[s].text}`}>
                          {attendance.filter(a => a.status === s).length}
                        </p>
                        <p className="text-[10px] text-gray-500">{statusColors[s].label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Materi</h3>
                  <p className="text-sm text-gray-700">{material || '-'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Foto Bukti ({photos.length})</h3>
                  <div className="flex gap-2">
                    {photos.map((photo, i) => (
                      <div key={i} className="w-20 h-15 rounded-lg overflow-hidden">
                        <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 safe-bottom">
        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={
              (step === 1 && !canProceedStep2) ||
              (step === 2 && !canProceedStep3) ||
              (step === 3 && !canProceedStep4)
            }
            className="w-full h-12 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white font-semibold flex items-center justify-center gap-2"
          >
            Selanjutnya <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gold hover:bg-gold-dark text-nabawi-dark font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/25"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-nabawi-dark/30 border-t-nabawi-dark rounded-full"
              />
            ) : (
              <>
                <Send className="w-4 h-4" /> Kirim Laporan Jurnal
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nabawi/30 border-t-nabawi rounded-full animate-spin" />
      </div>
    }>
      <JournalContent />
    </Suspense>
  );
}
