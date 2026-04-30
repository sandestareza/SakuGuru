'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileSpreadsheet, MoreVertical, GraduationCap, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function MasterDataPage() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Filtered Data
  const filteredTeachers = useMemo(() => {
    return state.teachers.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.nip?.includes(searchQuery)
    );
  }, [state.teachers, searchQuery]);

  const filteredStudents = useMemo(() => {
    let filtered = state.students;
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.classId === selectedClass);
    }
    return filtered.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.nisn?.includes(searchQuery)
    );
  }, [state.students, selectedClass, searchQuery]);

  const handleSimulateAction = (action: string) => {
    toast.success(`${action} berhasil (Simulasi Dummy)`);
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Master Data</h1>
        <p className="text-sm text-gray-500">Kelola data inti sekolah</p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="guru" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl h-10 p-1 shrink-0">
          <TabsTrigger value="guru" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            Guru
          </TabsTrigger>
          <TabsTrigger value="siswa" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            Siswa
          </TabsTrigger>
          <TabsTrigger value="kelas" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm truncate">
            Kelas/Mapel
          </TabsTrigger>
        </TabsList>

        {/* Tab: Guru */}
        <TabsContent value="guru" className="flex-1 flex flex-col mt-4 min-h-0">
          <div className="flex gap-2 mb-3 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari nama atau NIP..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl text-sm"
              />
            </div>
            <Button onClick={() => handleSimulateAction('Tambah Guru')} className="h-10 w-10 p-0 rounded-xl bg-nabawi hover:bg-nabawi-dark shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-4">
            {filteredTeachers.map((teacher, i) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-nabawi/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-nabawi" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{teacher.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">NIP: {teacher.nip || '-'}</p>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            {filteredTeachers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Tidak ada data ditemukan</div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Siswa */}
        <TabsContent value="siswa" className="flex-1 flex flex-col mt-4 min-h-0">
          <div className="flex flex-col gap-2 mb-3 shrink-0">
            <div className="flex gap-2">
              <select 
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi"
              >
                <option value="all">Semua Kelas</option>
                {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button 
                onClick={() => handleSimulateAction('Import Excel')} 
                variant="outline" 
                className="h-10 flex-1 rounded-xl text-success border-success/30 hover:bg-success/5 hover:text-success"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Impor Excel
              </Button>
              <Button onClick={() => handleSimulateAction('Tambah Siswa')} className="h-10 w-10 p-0 rounded-xl bg-nabawi hover:bg-nabawi-dark shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari nama atau NISN..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-4">
            {filteredStudents.map((student, i) => {
              const cls = state.classes.find(c => c.id === student.classId);
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{student.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{cls?.name || '-'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">NISN: {student.nisn || '-'}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Tidak ada data ditemukan</div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Kelas & Mapel */}
        <TabsContent value="kelas" className="flex-1 flex flex-col mt-4 min-h-0 space-y-4 overflow-y-auto pb-4">
          {/* Section: Kelas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Daftar Kelas</h2>
              <Button onClick={() => handleSimulateAction('Tambah Kelas')} variant="ghost" size="sm" className="h-8 text-nabawi hover:text-nabawi-dark hover:bg-nabawi/5">
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {state.classes.map((cls, i) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col"
                >
                  <span className="text-sm font-bold text-gray-900">{cls.name}</span>
                  <span className="text-[10px] text-gray-500">Tingkat {cls.grade}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: Mapel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Mata Pelajaran</h2>
              <Button onClick={() => handleSimulateAction('Tambah Mapel')} variant="ghost" size="sm" className="h-8 text-nabawi hover:text-nabawi-dark hover:bg-nabawi/5">
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2">
              {state.subjects.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-gold-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{sub.name}</h3>
                    <p className="text-[10px] text-gray-500">Kode: {sub.id.toUpperCase()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
