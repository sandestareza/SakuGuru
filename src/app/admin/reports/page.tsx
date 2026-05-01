"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ReportsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [month, setMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const reportTypes = [
    {
      id: "absensi",
      title: "Rekap Absensi",
      desc: "Kehadiran siswa per kelas",
    },
    { id: "nilai", title: "Rekap Nilai", desc: "Nilai Harian, UTS, UAS, NA" },
    {
      id: "jurnal",
      title: "Jurnal KBM",
      desc: "Laporan materi & foto bukti mengajar",
    },
  ];

  const handleExport = (type: "pdf" | "excel") => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: `Menyiapkan file ${type.toUpperCase()}...`,
      success: `Laporan berhasil diunduh (${type.toUpperCase()})`,
      error: "Gagal mengunduh laporan",
    });
  };

  const renderPreviewTable = () => {
    if (reportType === "jurnal") {
      const filteredJournals = state.journals.filter((j) => {
        if (selectedClass !== "all" && j.classId !== selectedClass)
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
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">
              Pusat Laporan
            </h1>
            <p className="text-xs text-gray-500">Cetak & Export Data</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mt-3">
          {["Pilih", "Filter", "Preview"].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1 w-full rounded-full transition-all duration-300 ${
                  i + 1 <= step ? "bg-nabawi" : "bg-gray-200"
                }`}
              />
              <span
                className={`text-[9px] ${i + 1 <= step ? "text-nabawi font-medium" : "text-gray-400"}`}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Pilih Jenis Laporan
              </h2>
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    reportType === type.id
                      ? "border-nabawi bg-nabawi/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        reportType === type.id
                          ? "bg-nabawi text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-sm ${reportType === type.id ? "text-nabawi-dark" : "text-gray-900"}`}
                      >
                        {type.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                  {reportType === type.id && (
                    <CheckCircle2 className="w-5 h-5 text-nabawi" />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 2: Filter */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Filter Data
              </h2>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Pilih Kelas
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi"
                  >
                    <option value="all">Semua Kelas</option>
                    {state.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Pilih Mapel
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi"
                  >
                    <option value="all">Semua Mapel</option>
                    {state.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Periode Bulan
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Export */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-semibold text-gray-800">
                Preview Data (Simulasi)
              </h2>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    {reportTypes.find((t) => t.id === reportType)?.title}
                  </span>
                  <span className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded border">
                    {selectedClass === "all"
                      ? "Semua Kelas"
                      : state.classes.find((c) => c.id === selectedClass)?.name}
                  </span>
                </div>
                <div className="flex-1 overflow-auto bg-white">
                  {renderPreviewTable()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-20 z-10 p-4 bg-white border-t border-gray-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        {step < 3 ? (
          <Button
            className="w-full h-12 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white font-semibold"
            disabled={step === 1 && !reportType}
            onClick={() => setStep((s) => s + 1)}
          >
            Selanjutnya
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("pdf")}
              className="flex-1 h-12 rounded-xl bg-terra hover:bg-terra-muted text-white font-semibold"
            >
              <Printer className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button
              onClick={() => handleExport("excel")}
              className="flex-1 h-12 rounded-xl bg-success hover:bg-success-dark text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" /> Excel
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
