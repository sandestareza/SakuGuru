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
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number | null>(null);

  const schedule = state.schedules.find(s => s.id === scheduleId);
  const className = state.classes.find(c => c.id === schedule?.classId)?.name || '';
  const subjectName = state.subjects.find(s => s.id === schedule?.subjectId)?.name || '';
  
  // Check if current time is within the lesson period (strict: no tolerance)
  const isWithinLessonTime = useMemo(() => {
    if (!schedule) return false;
    const now = new Date();
    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.endTime.split(':').map(Number);
    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(now);
    end.setHours(eh, em, 0, 0);
    return now >= start && now <= end;
  }, [schedule]);

  const students = useMemo(
    () => state.students.filter(s => s.classId === schedule?.classId),
    [state.students, schedule?.classId]
  );

  // If outside lesson time, show blocked screen
  if (!isWithinLessonTime) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-terra/10 flex items-center justify-center mx-auto mb-5">
            <X className="w-10 h-10 text-terra" />
          </div>
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
            Diluar Jam Pelajaran
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Jurnal hanya bisa diisi saat jam pelajaran berlangsung.
          </p>
          {schedule && (
            <p className="text-[10px] font-black text-nabawi bg-nabawi/10 inline-block px-3 py-1.5 rounded-xl mt-2 uppercase tracking-widest">
              {schedule.startTime} — {schedule.endTime}
            </p>
          )}
          <div className="mt-6">
            <Button
              onClick={() => router.back()}
              className="rounded-2xl bg-nabawi text-white font-black uppercase tracking-widest px-6 h-12 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          const w = img.width;
          const h = img.height;
          const scale = Math.max(w / 640, 1);
          
          const now = new Date();
          const hari = now.toLocaleDateString('id-ID', { weekday: 'long' });
          const tanggal = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
          const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const instansi = 'PONDOK PESANTREN DARUSSALAM';
          const mapel = subjectName.toUpperCase();
          const kelas = className;
          const fotoLabel = `BUKTI KBM #${photos.length + 1}`;

          // Measurements
          ctx.font = `900 ${Math.round(11 * scale)}px sans-serif`;
          const w1 = ctx.measureText(fotoLabel).width;
          ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
          const w2 = ctx.measureText(instansi).width;
          ctx.font = `600 ${Math.round(13 * scale)}px sans-serif`;
          const w3 = ctx.measureText(`${mapel}  •  ${kelas}`).width;
          ctx.font = `500 ${Math.round(11 * scale)}px sans-serif`;
          const w4 = ctx.measureText(`${hari}, ${tanggal}   |   ${waktu} WIB`).width;

          const maxW = Math.max(w1, w2, w3, w4);
          const padX = Math.round(20 * scale);
          const padY = Math.round(18 * scale);
          const cardW = maxW + (padX * 2);
          const cardH = Math.round(100 * scale);
          const cardX = Math.round(20 * scale);
          const cardY = h - cardH - Math.round(20 * scale);

          // Card Background (Dark transparent glass effect)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, Math.round(16 * scale));
          ctx.fill();

          // Subtle inner border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = Math.round(1.5 * scale);
          ctx.stroke();

          // Accent line on the left
          ctx.fillStyle = '#2D5A3D'; // nabawi
          ctx.beginPath();
          ctx.roundRect(cardX + Math.round(1 * scale), cardY + Math.round(16 * scale), Math.round(4 * scale), cardH - Math.round(32 * scale), Math.round(2 * scale));
          ctx.fill();

          // Text drawing setup
          let textX = cardX + padX;
          let textY = cardY + padY;

          ctx.textBaseline = 'top';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = Math.round(4 * scale);
          ctx.shadowOffsetY = Math.round(2 * scale);

          // 1. Label
          ctx.font = `900 ${Math.round(11 * scale)}px sans-serif`;
          ctx.fillStyle = '#D4AF37'; // gold
          ctx.fillText(fotoLabel, textX, textY);
          textY += Math.round(16 * scale);

          // 2. Instansi
          ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(instansi, textX, textY);
          textY += Math.round(22 * scale);

          // 3. Mapel & Kelas
          ctx.font = `600 ${Math.round(13 * scale)}px sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText(`${mapel}  •  ${kelas}`, textX, textY);
          textY += Math.round(20 * scale);

          // 4. Waktu
          ctx.font = `500 ${Math.round(11 * scale)}px sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText(`${hari}, ${tanggal}   |   ${waktu} WIB`, textX, textY);

          const watermarkedSrc = canvas.toDataURL('image/jpeg', 0.8);
          setPhotos(prev => [...prev, watermarkedSrc]);
          setIsCameraOpen(false);
        }
      };
    }
  }, [photos.length, subjectName, className]);

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
      {/* Decorative elements - Premium Glow */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] bg-nabawi/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-terra/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}
            className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-nabawi transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-tight">{subjectName}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{className} • {schedule?.startTime} - {schedule?.endTime}</p>
          </div>
          <div className="bg-nabawi/10 px-3 py-1.5 rounded-xl border border-nabawi/10">
            <span className="text-[10px] font-black text-nabawi uppercase tracking-widest">
              Step {step}/{steps.length}
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mt-4 px-1">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: i + 1 <= step ? '100%' : '0%' }}
                  className={`absolute inset-0 rounded-full ${
                    i + 1 === step ? 'bg-nabawi shadow-[0_0_8px_rgba(45,90,61,0.4)]' : i + 1 < step ? 'bg-nabawi/40' : 'bg-transparent'
                  }`}
                />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter text-center transition-colors duration-300 ${
                i + 1 <= step ? 'text-nabawi' : 'text-gray-300'
              }`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Attendance */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Daftar Kehadiran</h2>
                <div className="bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white text-[9px] font-bold text-gray-400 uppercase">
                  {students.length} Siswa
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map(s => (
                  <div key={s} className="bg-white rounded-2xl p-3 border border-white shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[s].bg.split(' ')[0]}`} />
                      <span className="text-[10px] font-black text-gray-400 uppercase">{statusColors[s].label}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{attendance.filter(a => a.status === s).length}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {students.map((student, i) => {
                  const att = attendance.find(a => a.studentId === student.id);
                  const status = att?.status || 'H';
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group flex items-center justify-between p-4 bg-white border-2 border-white rounded-[1.5rem] shadow-xl shadow-gray-200/40 hover:border-nabawi/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <span className="text-[10px] text-gray-400 font-black">{i + 1}</span>
                        </div>
                        <div>
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{student.name}</span>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Siswa Aktif</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((s) => (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setStudentStatus(student.id, s)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 ${
                              status === s
                                ? `${statusColors[s].bg} border-white shadow-lg`
                                : 'bg-gray-50 border-gray-50 text-gray-300 hover:border-gray-200 hover:text-gray-400'
                            }`}
                          >
                            {s}
                          </motion.button>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-5 pb-28"
            >
              <div className="px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ringkasan Materi</h2>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-tight">Tuliskan inti pengajaran hari ini.</p>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-nabawi/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Textarea
                  placeholder="Contoh: Persamaan Kuadrat — Menyelesaikan persamaan ax² + bx + c = 0 menggunakan rumus ABC..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="min-h-[250px] rounded-[1.8rem] bg-white border-2 border-white shadow-xl shadow-gray-200/50 p-6 focus:border-nabawi/20 focus:ring-0 resize-none text-sm font-medium leading-relaxed relative z-10"
                />
              </div>
              <div className="flex items-center justify-end px-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${material.length >= 10 ? 'text-nabawi' : 'text-gray-400'}`}>
                  {material.length} Karakter {material.length < 10 && '(Min. 10)'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-6 pb-28"
            >
              <div className="px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bukti Foto KBM</h2>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-tight">Ambil foto suasana kelas (wajib 1 foto).</p>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative aspect-square rounded-[1.8rem] overflow-hidden border-4 border-white shadow-xl shadow-gray-200/50"
                  >
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-terra text-white flex items-center justify-center shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Bukti KBM #{i + 1}</span>
                    </div>
                  </motion.div>
                ))}

                {photos.length < 1 && (
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="aspect-square rounded-[1.8rem] border-4 border-dashed border-gray-100 bg-white shadow-xl shadow-gray-200/30 flex flex-col items-center justify-center gap-3 hover:border-nabawi/30 hover:bg-nabawi/5 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-nabawi/5 flex items-center justify-center group-hover:bg-nabawi group-hover:text-white transition-all">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ambil Foto</span>
                  </button>
                )}
              </div>

              <div className="flex items-start gap-4 p-5 bg-gold/5 rounded-[1.5rem] border border-gold/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ImageIcon className="w-16 h-16 text-gold" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gold-dark uppercase tracking-widest mb-1">Watermark Otomatis</p>
                  <p className="text-[10px] font-bold text-gold-dark/70 leading-relaxed uppercase">
                    Foto akan diberi label tanggal, waktu, dan instansi secara otomatis untuk validasi KBM.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Review Laporan</h2>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-tight">Periksa kembali data sebelum pengiriman.</p>
              </div>

              <div className="space-y-4">
                {/* Attendance Summary */}
                <div className="bg-white rounded-[1.8rem] border-2 border-white shadow-xl shadow-gray-200/50 p-5">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ringkasan Absensi</h3>
                      <button onClick={() => setStep(1)} className="text-[10px] font-black text-nabawi uppercase underline">Ubah</button>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                    {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map(s => (
                      <div key={s} className="text-center p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <p className={`text-xl font-black ${statusColors[s].text} tracking-tighter`}>
                          {attendance.filter(a => a.status === s).length}
                        </p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{statusColors[s].label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Summary */}
                <div className="bg-white rounded-[1.8rem] border-2 border-white shadow-xl shadow-gray-200/50 p-5">
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Materi KBM</h3>
                      <button onClick={() => setStep(2)} className="text-[10px] font-black text-nabawi uppercase underline">Ubah</button>
                   </div>
                   <p className="text-sm font-medium text-gray-700 leading-relaxed">
                     {material || '-'}
                   </p>
                </div>

                {/* Photos Summary */}
                <div className="bg-white rounded-[1.8rem] border-2 border-white shadow-xl shadow-gray-200/50 p-5">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bukti Foto ({photos.length})</h3>
                      <button onClick={() => setStep(3)} className="text-[10px] font-black text-nabawi uppercase underline">Ubah</button>
                   </div>
                   <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map((photo, i) => (
                      <div 
                        key={i} 
                        onClick={() => setPreviewPhotoIndex(i)}
                        className="w-24 aspect-square rounded-[1.2rem] overflow-hidden border-2 border-white shadow-md shrink-0 cursor-pointer hover:border-nabawi/30 transition-colors"
                      >
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

      {/* Bottom Action - Premium Glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-white/50 z-50 safe-bottom">
        <div className="max-w-lg mx-auto">
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && !canProceedStep2) ||
                (step === 2 && !canProceedStep3) ||
                (step === 3 && !canProceedStep4)
              }
              className="w-full h-14 rounded-[1.5rem] bg-nabawi hover:bg-nabawi-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-nabawi/20 transition-all"
            >
              Langkah Berikutnya <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 rounded-[1.5rem] bg-gold hover:bg-gold-dark disabled:bg-gray-200 text-nabawi-dark font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-gold/30 transition-all border-b-4 border-gold-dark/20"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-nabawi-dark/30 border-t-nabawi-dark rounded-full"
                  />
                  <span>Mengirim...</span>
                </div>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Kirim Laporan KBM
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Camera Overlay - rendered outside all transformed ancestors */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
          {/* Video Layer */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Controls Layer - above video */}
          <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10 }}>
            {/* Top Controls */}
            <div className="flex justify-between px-6 pt-6">
              <button
                onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20"
              >
                <SwitchCamera className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setIsCameraOpen(false)}
                className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Capture Button */}
            <div className="flex flex-col items-center gap-4 pb-12 safe-bottom">
              <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                Foto Ke-{photos.length + 1}
              </p>
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-[6px] border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-md active:scale-90 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Overlay */}
      {previewPhotoIndex !== null && photos[previewPhotoIndex] && (
        <div className="fixed inset-0 bg-black/95 flex flex-col backdrop-blur-md" style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4">
            <span className="text-white font-black text-xs uppercase tracking-widest">
              Foto Ke-{previewPhotoIndex + 1}
            </span>
            <button
              onClick={() => setPreviewPhotoIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Image */}
          <div className="flex-1 relative p-4 flex items-center justify-center">
            <img 
              src={photos[previewPhotoIndex]} 
              alt={`Preview ${previewPhotoIndex + 1}`} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
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
