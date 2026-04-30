'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { ArrowLeft, FileText, Download, Printer, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ReportsPage() {
  const router = useRouter();
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const reportTypes = [
    { id: 'absensi', title: 'Rekap Absensi', desc: 'Kehadiran siswa per kelas' },
    { id: 'nilai', title: 'Rekap Nilai', desc: 'Nilai Harian, UTS, UAS, NA' },
    { id: 'jurnal', title: 'Jurnal KBM', desc: 'Laporan materi & foto bukti mengajar' },
  ];

  const handleExport = (type: 'pdf' | 'excel') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Menyiapkan file ${type.toUpperCase()}...`,
        success: `Laporan berhasil diunduh (${type.toUpperCase()})`,
        error: 'Gagal mengunduh laporan',
      }
    );
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Pusat Laporan</h1>
            <p className="text-xs text-gray-500">Cetak & Export Data</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mt-3">
          {['Pilih', 'Filter', 'Preview'].map((s, i) => (
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
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Pilih Jenis Laporan</h2>
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    reportType === type.id 
                      ? 'border-nabawi bg-nabawi/5' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      reportType === type.id ? 'bg-nabawi text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm ${reportType === type.id ? 'text-nabawi-dark' : 'text-gray-900'}`}>
                        {type.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                    </div>
                  </div>
                  {reportType === type.id && <CheckCircle2 className="w-5 h-5 text-nabawi" />}
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
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Filter Data</h2>
              
              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Pilih Kelas</label>
                  <select 
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi"
                  >
                    <option value="all">Semua Kelas</option>
                    {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Periode Bulan</label>
                  <input 
                    type="month"
                    value={month}
                    onChange={e => setMonth(e.target.value)}
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
              <h2 className="text-sm font-semibold text-gray-800">Preview Data (Simulasi)</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    {reportTypes.find(t => t.id === reportType)?.title}
                  </span>
                  <span className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded border">
                    {selectedClass === 'all' ? 'Semua Kelas' : state.classes.find(c => c.id === selectedClass)?.name}
                  </span>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center flex-col text-center">
                  <FileText className="w-12 h-12 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Data Preview Ready</p>
                  <p className="text-xs text-gray-400 max-w-[200px] mt-1">
                    Silakan gunakan tombol export di bawah untuk mengunduh laporan lengkap.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        {step < 3 ? (
          <Button 
            className="w-full h-12 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white font-semibold"
            disabled={step === 1 && !reportType}
            onClick={() => setStep(s => s + 1)}
          >
            Selanjutnya
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExport('pdf')}
              className="flex-1 h-12 rounded-xl bg-terra hover:bg-terra-muted text-white font-semibold"
            >
              <Printer className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button 
              onClick={() => handleExport('excel')}
              className="flex-1 h-12 rounded-xl bg-success hover:bg-success-dark text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" /> Excel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
