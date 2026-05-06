"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  CalendarDays,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DayOfWeek } from "@/types";

const ALL_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ReportsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [month, setMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Get current school
  const currentSchool = useMemo(() => {
    const schoolId = state.currentUser?.schoolId;
    return state.schools.find(s => s.id === schoolId) || state.schools[0];
  }, [state.schools, state.currentUser]);

  const jpDuration = currentSchool?.lessonDurationMinutes || 45;

  const reportTypes = [
    {
      id: "jadwal",
      title: "Jadwal Kelas",
      desc: "Jadwal pelajaran format formal per kelas",
      icon: "calendar",
      color: "blue",
    },
    {
      id: "jadwal_guru",
      title: "Jadwal Guru",
      desc: "Jadwal mengajar format formal per guru",
      icon: "graduation",
      color: "green",
    },
    {
      id: "absensi",
      title: "Rekap Absensi",
      desc: "Laporan kehadiran siswa per kelas",
      icon: "file",
      color: "terra",
    },
    { 
      id: "nilai", 
      title: "Rekap Nilai", 
      desc: "Laporan nilai harian, UTS, & UAS",
      icon: "file",
      color: "amber",
    },
    {
      id: "jurnal",
      title: "Jurnal KBM",
      desc: "Laporan materi & foto bukti mengajar",
      icon: "file",
      color: "purple",
    },
  ];

  const getColorClasses = (color: string, active: boolean) => {
    switch (color) {
      case 'blue': return active ? 'bg-blue-600 border-blue-600 shadow-blue-200' : 'bg-blue-50 text-blue-600 border-blue-100';
      case 'green': return active ? 'bg-emerald-600 border-emerald-600 shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'terra': return active ? 'bg-terra border-terra shadow-terra/20' : 'bg-terra/5 text-terra border-terra/10';
      case 'amber': return active ? 'bg-amber-600 border-amber-600 shadow-amber-200' : 'bg-amber-50 text-amber-600 border-amber-100';
      case 'purple': return active ? 'bg-purple-600 border-purple-600 shadow-purple-200' : 'bg-purple-50 text-purple-600 border-purple-100';
      default: return active ? 'bg-nabawi border-nabawi shadow-nabawi/20' : 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleExport = (type: "pdf" | "excel") => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: `Menyiapkan file ${type.toUpperCase()}...`,
      success: `Laporan berhasil diunduh (${type.toUpperCase()})`,
      error: "Gagal mengunduh laporan",
    });
  };

  // ===== JADWAL KELAS PRINT =====
  const handlePrintJadwalKelas = () => {
    const schoolName = currentSchool?.name || 'Sekolah';
    const fmtTime = (t: string) => t.replace(':', '.');
    const targetClassIds = selectedClass === 'all'
      ? [...new Set(state.schedules.map(s => s.classId))]
      : [selectedClass];

    const classPrintStyles = `
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, 'Segoe UI', sans-serif; color: #000; padding: 12px; font-size: 11px; }
        .print-header { text-align: center; margin-bottom: 16px; }
        .print-header h1 { font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
        .print-header h2 { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
        .print-header p { font-size: 10px; color: #555; }
        .schedule-section { margin-bottom: 28px; page-break-inside: avoid; }
        .section-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; padding: 5px 10px; background: #e8e8e8; border: 1px solid #999; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 2px solid #333; padding: 5px 4px; text-align: center; vertical-align: middle; }
        thead th { background: #dbeafe; font-weight: 700; font-size: 10px; text-transform: uppercase; }
        .jam-col { width: 35px; font-weight: 700; font-size: 12px; background: #f9f9f9; }
        .pukul-col { width: 90px; font-weight: 600; font-size: 10px; white-space: nowrap; background: #f9f9f9; }
        .subject-cell { font-weight: 700; font-size: 10px; text-transform: uppercase; padding: 6px 3px; line-height: 1.3; }
        .empty-cell { color: #ccc; }
        .footer { text-align: right; font-size: 8px; color: #999; margin-top: 12px; border-top: 1px solid #ccc; padding-top: 6px; }
        @media print { body { padding: 0; } }
      </style>
    `;

    let sections = '';
    targetClassIds.forEach(cid => {
      const cls = state.classes.find(c => c.id === cid);
      if (!cls) return;
      const classSchedules = state.schedules.filter(s => s.classId === cid);

      // Collect all unique time slots across all days
      const allSlots = [...new Set(classSchedules.map(s => `${s.startTime}-${s.endTime}`))]
        .map(sl => { const [start, end] = sl.split('-'); return { start, end }; })
        .sort((a, b) => a.start.localeCompare(b.start));

      if (allSlots.length === 0) return;

      let rows = '';
      allSlots.forEach((slot, i) => {
        rows += `<tr>`;
        rows += `<td class="jam-col">${i + 1}</td>`;
        rows += `<td class="pukul-col">${fmtTime(slot.start)} – ${fmtTime(slot.end)}</td>`;
        ALL_DAYS.forEach(day => {
          const match = classSchedules.find(s => s.dayOfWeek === day && s.startTime === slot.start && s.endTime === slot.end);
          if (match) {
            const sub = state.subjects.find(s => s.id === match.subjectId);
            rows += `<td class="subject-cell">${(sub?.name || '-').toUpperCase()}</td>`;
          } else {
            rows += `<td class="empty-cell"></td>`;
          }
        });
        rows += `</tr>`;
      });

      const header = `<thead><tr><th>JAM</th><th>PUKUL</th>${ALL_DAYS.map(d => `<th>${d.toUpperCase()}</th>`).join('')}</tr></thead>`;

      sections += `<div class="schedule-section"><div class="section-title">JADWAL PELAJARAN KELAS ${cls.name.toUpperCase()}</div><table>${header}<tbody>${rows}</tbody></table></div>`;
    });

    const html = `<!DOCTYPE html><html><head><title>Jadwal Kelas - ${schoolName}</title>${classPrintStyles}</head><body>
      <div class="print-header"><h1>${schoolName}</h1><h2>JADWAL PELAJARAN</h2><p>Tahun Pelajaran ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</p></div>
      ${sections}
      <div class="footer">Dicetak dari SakuGuru • ${new Date().toLocaleString('id-ID')}</div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print(); }
  };

  /** Jadwal preview table rendered in-app */
  const renderJadwalPreview = () => {
    const targetClassIds = selectedClass === 'all'
      ? [...new Set(state.schedules.map(s => s.classId))]
      : [selectedClass];

    return (
      <div className="space-y-6 p-3">
        {targetClassIds.map(cid => {
          const cls = state.classes.find(c => c.id === cid);
          if (!cls) return null;
          const classSchedules = state.schedules.filter(s => s.classId === cid);

          const allSlots = [...new Set(classSchedules.map(s => `${s.startTime}-${s.endTime}`))]
            .map(sl => { const [start, end] = sl.split('-'); return { start, end }; })
            .sort((a, b) => a.start.localeCompare(b.start));

          if (allSlots.length === 0) return (
            <div key={cid} className="text-center text-gray-400 text-xs py-4">Kelas {cls.name} — belum ada jadwal</div>
          );

          return (
            <div key={cid}>
              <div className="text-xs font-bold text-gray-700 mb-2 bg-gray-100 px-3 py-1.5 rounded-lg text-center">KELAS {cls.name.toUpperCase()}</div>
              <table className="w-full text-left border-collapse text-[9px] sm:text-[10px]">
                <thead className="bg-blue-50">
                  <tr className="border border-gray-300">
                    <th className="border border-gray-300 p-1.5 text-center font-bold text-gray-700 w-8">JP</th>
                    <th className="border border-gray-300 p-1.5 text-center font-bold text-gray-700 w-16">PUKUL</th>
                    {ALL_DAYS.map(d => <th key={d} className="border border-gray-300 p-1.5 text-center font-bold text-gray-700">{d.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {allSlots.map((slot, i) => (
                    <tr key={i} className="border border-gray-200">
                      <td className="border border-gray-200 p-1.5 text-center font-bold text-gray-600 bg-gray-50">{i + 1}</td>
                      <td className="border border-gray-200 p-1.5 text-center font-semibold text-gray-600 bg-gray-50 whitespace-nowrap text-[8px]">
                        {slot.start.replace(':', '.')} – {slot.end.replace(':', '.')}
                      </td>
                      {ALL_DAYS.map(day => {
                        const match = classSchedules.find(s => s.dayOfWeek === day && s.startTime === slot.start && s.endTime === slot.end);
                        const sub = match ? state.subjects.find(s => s.id === match.subjectId) : null;
                        return <td key={day} className="border border-gray-200 p-1.5 text-center font-bold text-gray-800 uppercase">{sub?.name || ''}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // ===== JADWAL GURU PRINT =====
  const DAY_COLORS = [
    { bg: '#fff8e1', border: '#f9a825', head: '#f57f17' },  // Senin - kuning
    { bg: '#e3f2fd', border: '#1976d2', head: '#0d47a1' },  // Selasa - biru
    { bg: '#e8f5e9', border: '#388e3c', head: '#1b5e20' },  // Rabu - hijau
    { bg: '#fff3e0', border: '#ef6c00', head: '#e65100' },  // Kamis - oranye
    { bg: '#fce4ec', border: '#c62828', head: '#b71c1c' },  // Jumat - merah
    { bg: '#f3e5f5', border: '#7b1fa2', head: '#4a148c' },  // Sabtu - ungu
  ];

  const handlePrintJadwalGuru = () => {
    const schoolName = currentSchool?.name || 'Sekolah';
    const fmtTime = (t: string) => t.replace(':', '.');
    const targetTeacherIds = selectedTeacher === 'all'
      ? [...new Set(state.schedules.map(s => s.teacherId))]
      : [selectedTeacher];

    const guruPrintStyles = `
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, 'Segoe UI', sans-serif; color: #000; padding: 10px; font-size: 10px; }
        .print-header { text-align: center; margin-bottom: 12px; }
        .print-header h1 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
        .print-header h2 { font-size: 12px; font-weight: 700; }
        .print-header p { font-size: 9px; color: #555; }
        .teacher-section { margin-bottom: 24px; page-break-inside: avoid; }
        .teacher-header { display: flex; gap: 16px; align-items: center; margin-bottom: 10px; padding: 8px 12px; background: #e8f5e9; border: 2px solid #2d5a3d; border-radius: 4px; }
        .teacher-header .label { font-weight: 700; font-size: 11px; color: #2d5a3d; }
        .teacher-header .value { font-weight: 600; font-size: 11px; }
        .teacher-header .jp-badge { background: #2d5a3d; color: white; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; }
        .days-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .day-card { border: 2px solid #999; border-radius: 4px; overflow: hidden; }
        .day-title { writing-mode: vertical-rl; text-orientation: mixed; font-weight: 700; font-size: 11px; color: white; padding: 6px 4px; text-align: center; letter-spacing: 2px; }
        .day-table { width: 100%; border-collapse: collapse; }
        .day-table th { padding: 4px 6px; font-weight: 700; font-size: 9px; border: 1px solid #ccc; background: #f5f5f5; text-align: center; }
        .day-table td { padding: 3px 5px; font-size: 9px; border: 1px solid #ddd; text-align: center; }
        .day-table td.subject { text-align: left; font-weight: 600; }
        .empty-msg { text-align: center; padding: 8px; color: #999; font-size: 9px; }
        .footer { text-align: right; font-size: 8px; color: #999; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 4px; }
        @media print { body { padding: 0; } }
      </style>
    `;

    let sections = '';
    targetTeacherIds.forEach(tid => {
      const teacher = state.teachers.find(t => t.id === tid);
      if (!teacher) return;
      let teacherSchedules = state.schedules.filter(s => s.teacherId === tid);
      if (selectedSubject !== 'all') {
        teacherSchedules = teacherSchedules.filter(s => s.subjectId === selectedSubject);
      }
      if (teacherSchedules.length === 0) return;

      const totalJP = teacherSchedules.length;
      const subjectName = selectedSubject !== 'all'
        ? state.subjects.find(s => s.id === selectedSubject)?.name || 'Semua'
        : 'Semua Mapel';

      let dayCards = '';
      ALL_DAYS.forEach((day, di) => {
        const color = DAY_COLORS[di];
        const daySchedules = teacherSchedules
          .filter(s => s.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        let tableRows = '';
        if (daySchedules.length === 0) {
          tableRows = `<tr><td colspan="4" class="empty-msg">Tidak ada jadwal</td></tr>`;
        } else {
          // Compute JP number based on all schedules for that day in the class
          daySchedules.forEach(s => {
            const sub = state.subjects.find(sb => sb.id === s.subjectId);
            const cls = state.classes.find(c => c.id === s.classId);
            tableRows += `<tr><td>${fmtTime(s.startTime)}</td><td>${fmtTime(s.startTime)} - ${fmtTime(s.endTime)}</td><td class="subject">${sub?.name || '-'}</td><td>${cls?.name || '-'}</td></tr>`;
          });
        }

        dayCards += `
          <div class="day-card" style="border-color:${color.border}">
            <div style="display:flex">
              <div class="day-title" style="background:${color.head}">${day.toUpperCase()}</div>
              <div style="flex:1">
                <table class="day-table">
                  <thead><tr><th>Jam Ke</th><th>Waktu</th><th>Mata Pelajaran</th><th>Kelas</th></tr></thead>
                  <tbody>${tableRows}</tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      });

      sections += `
        <div class="teacher-section">
          <div class="teacher-header">
            <div><span class="label">Guru:</span> <span class="value">${teacher.name}</span></div>
            <div class="jp-badge">${totalJP} JP</div>
            <div style="margin-left:auto"><span class="label">Bidang Studi:</span> <span class="value">${subjectName}</span></div>
          </div>
          <div class="days-grid">${dayCards}</div>
        </div>
      `;
    });

    const html = `<!DOCTYPE html><html><head><title>Jadwal Guru - ${schoolName}</title>${guruPrintStyles}</head><body>
      <div class="print-header"><h1>${schoolName}</h1><h2>JADWAL MENGAJAR GURU</h2><p>Tahun Pelajaran ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</p></div>
      ${sections}
      <div class="footer">Dicetak dari SakuGuru \u2022 ${new Date().toLocaleString('id-ID')}</div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print(); }
  };

  /** Jadwal Guru preview rendered in-app */
  const renderJadwalGuruPreview = () => {
    const targetTeacherIds = selectedTeacher === 'all'
      ? [...new Set(state.schedules.map(s => s.teacherId))]
      : [selectedTeacher];

    const dayBgColors = ['bg-yellow-50', 'bg-blue-50', 'bg-green-50', 'bg-orange-50', 'bg-red-50', 'bg-purple-50'];
    const dayBorderColors = ['border-yellow-400', 'border-blue-400', 'border-green-400', 'border-orange-400', 'border-red-400', 'border-purple-400'];
    const dayHeadColors = ['bg-yellow-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-red-600', 'bg-purple-600'];

    return (
      <div className="space-y-6 p-2">
        {targetTeacherIds.map(tid => {
          const teacher = state.teachers.find(t => t.id === tid);
          if (!teacher) return null;
          let teacherSchedules = state.schedules.filter(s => s.teacherId === tid);
          if (selectedSubject !== 'all') {
            teacherSchedules = teacherSchedules.filter(s => s.subjectId === selectedSubject);
          }
          if (teacherSchedules.length === 0) return null;

          const totalJP = teacherSchedules.length;

          return (
            <div key={tid}>
              {/* Teacher Header */}
              <div className="flex items-center gap-3 mb-2 p-2 bg-nabawi/5 border border-nabawi/20 rounded-lg">
                <div className="text-[10px]"><span className="font-bold text-nabawi">Guru:</span> <span className="font-semibold">{teacher.name}</span></div>
                <div className="bg-nabawi text-white text-[9px] font-bold px-2 py-0.5 rounded">{totalJP} JP</div>
              </div>
              {/* Days Grid */}
              <div className="grid grid-cols-2 gap-2">
                {ALL_DAYS.map((day, di) => {
                  const daySchedules = teacherSchedules
                    .filter(s => s.dayOfWeek === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  return (
                    <div key={day} className={`border-2 ${dayBorderColors[di]} rounded-lg overflow-hidden`}>
                      <div className="flex">
                        <div className={`${dayHeadColors[di]} text-white text-[9px] font-bold px-1.5 py-3 flex items-center justify-center`}
                             style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '2px' }}>
                          {day.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <table className="w-full text-[8px] border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-200 p-1 font-bold w-6">JP</th>
                                <th className="border border-gray-200 p-1 font-bold w-16">Waktu</th>
                                <th className="border border-gray-200 p-1 font-bold">Mapel</th>
                                <th className="border border-gray-200 p-1 font-bold w-10">Kelas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {daySchedules.length === 0 ? (
                                <tr><td colSpan={4} className="text-center p-2 text-gray-300 text-[7px]">-</td></tr>
                              ) : daySchedules.map((s, si) => {
                                const sub = state.subjects.find(sb => sb.id === s.subjectId);
                                const cls = state.classes.find(c => c.id === s.classId);
                                return (
                                  <tr key={s.id} className={di % 2 === 0 ? 'bg-white' : dayBgColors[di]}>
                                    <td className="border border-gray-200 p-1 text-center font-bold">{si + 1}</td>
                                    <td className="border border-gray-200 p-1 text-center whitespace-nowrap">{s.startTime.replace(':','.')}-{s.endTime.replace(':','.')}</td>
                                    <td className="border border-gray-200 p-1 font-semibold">{sub?.name || '-'}</td>
                                    <td className="border border-gray-200 p-1 text-center">{cls?.name || '-'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPreviewTable = () => {
    if (reportType === "jurnal") {
      const filteredJournals = state.journals.filter((j) => {
        const schedule = state.schedules.find((s) => s.id === j.scheduleId);
        if (selectedTeacher !== "all" && schedule?.teacherId !== selectedTeacher)
          return false;
        if (month && !j.date.startsWith(month)) return false;
        return true;
      });

      return (
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="border-b border-gray-100">
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                No
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Tgl/Jam
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Kelas
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Mapel
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Absensi
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Materi
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                Foto
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJournals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400">
                  Tidak ada data jurnal untuk filter ini
                </td>
              </tr>
            ) : (
              filteredJournals.slice(0, 50).map((j, i) => {
                const schedule = state.schedules.find(
                  (s) => s.id === j.scheduleId,
                );
                const cls = state.classes.find((c) => c.id === j.classId);
                const subject = state.subjects.find(
                  (s) => s.id === j.subjectId,
                );

                const att = j.attendance || [];
                const summary = { H: 0, S: 0, I: 0, A: 0 };
                att.forEach((a) => {
                  if (summary[a.status] !== undefined) summary[a.status]++;
                });

                return (
                  <tr
                    key={j.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-gray-500">{i + 1}</td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      <div className="font-medium">
                        {format(new Date(j.date), "dd/MM/yyyy")}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {schedule?.startTime || "-"} s.d.{" "}
                        {schedule?.endTime || "-"}
                      </div>
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {cls?.name}
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {subject?.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex gap-2 text-[10px] font-mono">
                        <span className="text-success font-medium">
                          H:{summary.H}
                        </span>
                        <span className="text-info font-medium">
                          S:{summary.S}
                        </span>
                        <span className="text-warning font-medium">
                          I:{summary.I}
                        </span>
                        <span className="text-terra font-medium">
                          A:{summary.A}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 min-w-[150px]">
                      {j.material || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {j.photos && j.photos.length > 0 ? (
                        <button
                          onClick={() =>
                            setPreviewPhoto(
                              "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
                            )
                          }
                          className="inline-flex items-center justify-center bg-nabawi/10 hover:bg-nabawi/20 text-nabawi text-[10px] font-bold px-2 py-1 rounded transition-colors"
                        >
                          {j.photos.length} Foto
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      );
    }

    if (reportType === "nilai") {
      const filteredGrades = state.grades.filter((g) => {
        if (selectedClass !== "all" && g.classId !== selectedClass)
          return false;
        if (selectedSubject !== "all" && g.subjectId !== selectedSubject)
          return false;
        return true;
      });

      return (
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="border-b border-gray-100">
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                No
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Siswa
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Kelas
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Mapel
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                NH
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                UTS
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                UAS
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                NA
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-400">
                  Tidak ada data nilai untuk filter ini
                </td>
              </tr>
            ) : (
              filteredGrades.slice(0, 50).map((g, i) => {
                const student = state.students.find(
                  (s) => s.id === g.studentId,
                );
                const cls = state.classes.find((c) => c.id === g.classId);
                const subject = state.subjects.find(
                  (s) => s.id === g.subjectId,
                );
                return (
                  <tr
                    key={g.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-gray-500">{i + 1}</td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      <div className="font-medium">{student?.name}</div>
                      <div className="text-[9px] text-gray-400">
                        {student?.nisn}
                      </div>
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {cls?.name}
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {subject?.name}
                    </td>
                    <td className="p-3 text-center font-mono">
                      {g.nilaiHarian ?? "-"}
                    </td>
                    <td className="p-3 text-center font-mono">
                      {g.uts ?? "-"}
                    </td>
                    <td className="p-3 text-center font-mono">
                      {g.uas ?? "-"}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-nabawi-dark">
                      {g.nilaiAkhir ?? "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      );
    }

    if (reportType === "absensi") {
      const monthJournals = state.journals.filter((j) => {
        if (month && !j.date.startsWith(month)) return false;
        if (selectedClass !== "all" && j.classId !== selectedClass)
          return false;
        if (selectedSubject !== "all" && j.subjectId !== selectedSubject)
          return false;
        return true;
      });

      const students = state.students.filter(
        (s) => selectedClass === "all" || s.classId === selectedClass,
      );

      const attendanceSummary = students.map((student) => {
        const counts = { H: 0, S: 0, I: 0, A: 0 };
        monthJournals.forEach((j) => {
          const rec = j.attendance?.find((a) => a.studentId === student.id);
          if (rec && counts[rec.status] !== undefined) {
            counts[rec.status]++;
          }
        });
        return { student, counts };
      });

      return (
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="border-b border-gray-100">
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                No
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Siswa
              </th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">
                Kelas
              </th>
              <th className="p-3 font-semibold text-success text-center">H</th>
              <th className="p-3 font-semibold text-info text-center">S</th>
              <th className="p-3 font-semibold text-warning text-center">I</th>
              <th className="p-3 font-semibold text-terra text-center">A</th>
              <th className="p-3 font-semibold text-gray-700 text-center">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceSummary.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-400">
                  Tidak ada data absensi untuk filter ini
                </td>
              </tr>
            ) : (
              attendanceSummary.slice(0, 50).map(({ student, counts }, i) => {
                const cls = state.classes.find((c) => c.id === student.classId);
                const total = counts.H + counts.S + counts.I + counts.A;
                return (
                  <tr
                    key={student.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-gray-500">{i + 1}</td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-[9px] text-gray-400">
                        {student.nisn}
                      </div>
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {cls?.name}
                    </td>
                    <td className="p-3 text-center text-success font-mono">
                      {counts.H}
                    </td>
                    <td className="p-3 text-center text-info font-mono">
                      {counts.S}
                    </td>
                    <td className="p-3 text-center text-warning font-mono">
                      {counts.I}
                    </td>
                    <td className="p-3 text-center text-terra font-mono">
                      {counts.A}
                    </td>
                    <td className="p-3 text-center text-gray-700 font-bold font-mono bg-gray-50">
                      {total}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-nabawi/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-terra/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Pusat Laporan
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">Generate, Cetak, & Export Data Sekolah</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mt-4">
          {["Pilih Laporan", "Konfigurasi Filter", "Preview & Export"].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  i + 1 <= step ? "bg-nabawi shadow-[0_0_8px_rgba(45,90,61,0.3)]" : "bg-gray-100"
                }`}
              />
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${i + 1 <= step ? "text-nabawi" : "text-gray-400"}`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Pilih Jenis Laporan */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-nabawi rounded-full" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                  Pilih Jenis Laporan
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => {
                  const isActive = reportType === type.id;
                  const colorClass = getColorClasses(type.color, isActive);
                  
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReportType(type.id)}
                      className={`relative group p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between overflow-hidden ${
                        isActive
                          ? "border-nabawi bg-white shadow-xl shadow-nabawi/5"
                          : "border-white bg-white/60 hover:bg-white hover:border-gray-200 shadow-sm"
                      }`}
                    >
                      {/* Selection Indicator Background */}
                      {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-nabawi/5 rounded-full -mr-16 -mt-16" />}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${colorClass} ${isActive ? 'shadow-lg' : ''}`}
                        >
                          {type.icon === 'calendar' ? <CalendarDays className="w-6 h-6" /> : type.icon === 'graduation' ? <GraduationCap className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3
                            className={`font-bold text-[15px] ${isActive ? "text-nabawi-dark" : "text-gray-900"}`}
                          >
                            {type.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">
                            {type.desc}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        {isActive ? (
                          <div className="w-6 h-6 rounded-full bg-nabawi flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-100 group-hover:border-gray-300 transition-colors" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Filter */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-nabawi rounded-full" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                  Konfigurasi Filter
                </h2>
              </div>

              <div className="space-y-4 bg-white/70 backdrop-blur-sm p-5 rounded-3xl border border-white shadow-xl shadow-gray-200/50">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">Parameter Laporan</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Guru filter — for jadwal_guru and jurnal */}
                  {(reportType === 'jadwal_guru' || reportType === 'jurnal') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">PILIH GURU</label>
                      <div className="relative">
                        <select
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all appearance-none shadow-sm font-medium"
                        >
                          <option value="all">Semua Guru Pengajar</option>
                          {state.teachers.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kelas filter — for jadwal, absensi, nilai */}
                  {(reportType === 'jadwal' || reportType === 'absensi' || reportType === 'nilai') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">PILIH KELAS</label>
                      <div className="relative">
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all appearance-none shadow-sm font-medium"
                        >
                          <option value="all">Semua Kelas Terdaftar</option>
                          {state.classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mapel filter — for jadwal_guru, nilai, absensi */}
                  {(reportType === 'jadwal_guru' || reportType === 'nilai' || reportType === 'absensi') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">MATA PELAJARAN</label>
                      <div className="relative">
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all appearance-none shadow-sm font-medium"
                        >
                          <option value="all">Semua Mata Pelajaran</option>
                          {state.subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bulan filter — for absensi, nilai, jurnal */}
                  {(reportType === 'absensi' || reportType === 'nilai' || reportType === 'jurnal') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">PERIODE BULAN</label>
                      <div className="relative">
                        <input
                          type="month"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all shadow-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 p-3 bg-nabawi/5 rounded-2xl border border-nabawi/10">
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-nabawi text-white flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3 h-3" />
                    </div>
                    <p className="text-[10px] text-nabawi-dark font-medium leading-relaxed">
                      Pastikan filter sudah sesuai sebelum lanjut ke preview. Laporan akan di-generate berdasarkan data terbaru di sistem.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Export */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full space-y-4"
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-nabawi rounded-full" />
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                    Preview Laporan
                  </h2>
                </div>
                <div className="text-[10px] font-bold text-nabawi bg-nabawi/10 px-2 py-1 rounded-full uppercase">
                  Ready to Export
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-2xl shadow-gray-200 overflow-hidden flex flex-col flex-1 min-h-0 relative">
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-5" />
                
                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-900 leading-none mb-1">
                        {reportTypes.find((t) => t.id === reportType)?.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Dihasilkan pada {new Date().toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Scope</span>
                    <span className="text-[10px] font-bold text-nabawi-dark bg-nabawi/5 px-2 py-0.5 rounded-lg border border-nabawi/10">
                      {selectedClass === "all"
                        ? "Seluruh Sekolah"
                        : state.classes.find((c) => c.id === selectedClass)?.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-gray-50/30 p-2 sm:p-4 relative z-10">
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-full">
                     {reportType === 'jadwal' ? renderJadwalPreview() : reportType === 'jadwal_guru' ? renderJadwalGuruPreview() : renderPreviewTable()}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-20 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200/50 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
        {step < 3 ? (
          <Button
            disabled={step === 1 && !reportType}
            onClick={() => setStep((s) => s + 1)}
            className="w-full h-14 rounded-2xl bg-nabawi hover:bg-nabawi-dark text-white font-bold text-base shadow-lg shadow-nabawi/20 active:scale-[0.98] transition-all"
          >
            Selanjutnya
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => reportType === 'jadwal' ? handlePrintJadwalKelas() : reportType === 'jadwal_guru' ? handlePrintJadwalGuru() : handleExport("pdf")}
              className="flex-1 h-14 rounded-2xl bg-terra hover:bg-terra-muted text-white font-bold shadow-lg shadow-terra/20 active:scale-[0.98] transition-all"
            >
              <Printer className="w-5 h-5 mr-2" /> CETAK PDF
            </Button>
            <Button
              onClick={() => handleExport("excel")}
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold active:scale-[0.98] transition-all"
            >
              <Download className="w-5 h-5 mr-2" /> EXCEL
            </Button>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewPhoto}
                alt="Preview Bukti Mengajar"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
