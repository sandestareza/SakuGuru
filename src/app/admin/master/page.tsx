'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, Plus, FileSpreadsheet, MoreVertical, GraduationCap, Users, BookOpen, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Teacher, Student, ClassRoom, Subject } from '@/types';
import { FormSheet } from '@/components/shared/form-sheet';
import { TabsTrigger, TabsContent, Tabs, TabsList } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MasterDataPage() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Teacher Form State
  const [isTeacherSheetOpen, setIsTeacherSheetOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({ name: '', nip: '', email: '', phone: '' });

  // Student Form State
  const [isStudentSheetOpen, setIsStudentSheetOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({ name: '', nisn: '', classId: '', gender: 'L', phone: '', parentName: '' });

  // Class Form State
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState<Partial<ClassRoom>>({ name: '', grade: '' });

  // Subject Form State
  const [isSubjectSheetOpen, setIsSubjectSheetOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ name: '', code: '' });

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

  const handleOpenTeacherForm = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setTeacherForm({ ...teacher });
    } else {
      setEditingTeacher(null);
      setTeacherForm({ name: '', nip: '', email: '', phone: '' });
    }
    setIsTeacherSheetOpen(true);
  };

  const handleSaveTeacher = () => {
    if (!teacherForm.name || !teacherForm.email) {
      toast.error('Nama dan Email wajib diisi');
      return;
    }
    
    if (editingTeacher) {
      dispatch({ type: 'UPDATE_TEACHER', payload: { ...editingTeacher, ...teacherForm } as Teacher });
      toast.success('Data guru berhasil diperbarui');
    } else {
      const newTeacher: Teacher = {
        id: `t${Date.now()}`,
        schoolId: state.currentUser?.schoolId || 'sch1',
        name: teacherForm.name || '',
        nip: teacherForm.nip || '',
        email: teacherForm.email || '',
        phone: teacherForm.phone || ''
      };
      dispatch({ type: 'ADD_TEACHER', payload: newTeacher });
      toast.success('Guru baru berhasil ditambahkan');
    }
    setIsTeacherSheetOpen(false);
  };

  const handleDeleteTeacher = (id: string) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      dispatch({ type: 'DELETE_TEACHER', payload: id });
      toast.success('Data guru berhasil dihapus');
    }
  };

  const handleOpenStudentForm = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({ ...student });
    } else {
      setEditingStudent(null);
      setStudentForm({ name: '', nisn: '', classId: '', gender: 'L', phone: '', parentName: '' });
    }
    setIsStudentSheetOpen(true);
  };

  const handleSaveStudent = () => {
    if (!studentForm.name || !studentForm.classId || !studentForm.gender) {
      toast.error('Nama, Kelas, dan Jenis Kelamin wajib diisi');
      return;
    }
    
    if (editingStudent) {
      dispatch({ type: 'UPDATE_STUDENT', payload: { ...editingStudent, ...studentForm } as Student });
      toast.success('Data siswa berhasil diperbarui');
    } else {
      const newStudent: Student = {
        id: `s${Date.now()}`,
        name: studentForm.name || '',
        nisn: studentForm.nisn || '',
        classId: studentForm.classId || '',
        gender: studentForm.gender as 'L' | 'P',
        phone: studentForm.phone || '',
        parentName: studentForm.parentName || ''
      };
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });
      toast.success('Siswa baru berhasil ditambahkan');
    }
    setIsStudentSheetOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: id });
      toast.success('Data siswa berhasil dihapus');
    }
  };

  const handleOpenClassForm = (cls?: ClassRoom) => {
    if (cls) {
      setEditingClass(cls);
      setClassForm({ ...cls });
    } else {
      setEditingClass(null);
      setClassForm({ name: '', grade: '' });
    }
    setIsClassSheetOpen(true);
  };

  const handleSaveClass = () => {
    if (!classForm.name || !classForm.grade) {
      toast.error('Nama Kelas dan Tingkat wajib diisi');
      return;
    }
    if (editingClass) {
      dispatch({ type: 'UPDATE_CLASS', payload: { ...editingClass, ...classForm } as ClassRoom });
      toast.success('Data kelas berhasil diperbarui');
    } else {
      const newClass: ClassRoom = {
        id: `c${Date.now()}`,
        schoolId: state.currentUser?.schoolId || 'sch1',
        name: classForm.name || '',
        grade: classForm.grade || ''
      };
      dispatch({ type: 'ADD_CLASS', payload: newClass });
      toast.success('Kelas baru berhasil ditambahkan');
    }
    setIsClassSheetOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini?')) {
      dispatch({ type: 'DELETE_CLASS', payload: id });
      toast.success('Kelas berhasil dihapus');
    }
  };

  const handleOpenSubjectForm = (sub?: Subject) => {
    if (sub) {
      setEditingSubject(sub);
      setSubjectForm({ ...sub });
    } else {
      setEditingSubject(null);
      setSubjectForm({ name: '', code: '' });
    }
    setIsSubjectSheetOpen(true);
  };

  const handleSaveSubject = () => {
    if (!subjectForm.name || !subjectForm.code) {
      toast.error('Nama dan Kode Mapel wajib diisi');
      return;
    }
    if (editingSubject) {
      dispatch({ type: 'UPDATE_SUBJECT', payload: { ...editingSubject, ...subjectForm } as Subject });
      toast.success('Data mapel berhasil diperbarui');
    } else {
      const newSubject: Subject = {
        id: `sub${Date.now()}`,
        name: subjectForm.name || '',
        code: subjectForm.code || ''
      };
      dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
      toast.success('Mapel baru berhasil ditambahkan');
    }
    setIsSubjectSheetOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Yakin ingin menghapus mapel ini?')) {
      dispatch({ type: 'DELETE_SUBJECT', payload: id });
      toast.success('Mapel berhasil dihapus');
    }
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
            <Button onClick={() => handleOpenTeacherForm()} className="h-10 w-10 p-0 rounded-xl bg-nabawi hover:bg-nabawi-dark shrink-0">
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 outline-none">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => handleOpenTeacherForm(teacher)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteTeacher(teacher.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <Button onClick={() => handleOpenStudentForm()} className="h-10 w-10 p-0 rounded-xl bg-nabawi hover:bg-nabawi-dark shrink-0">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => handleOpenStudentForm(student)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteStudent(student.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <Button onClick={() => handleOpenClassForm()} variant="ghost" size="sm" className="h-8 text-nabawi hover:text-nabawi-dark hover:bg-nabawi/5">
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
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-900">{cls.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 outline-none">
                        <MoreVertical className="w-3 h-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => handleOpenClassForm(cls)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteClass(cls.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <span className="text-[10px] text-gray-500">Tingkat {cls.grade}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: Mapel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Mata Pelajaran</h2>
              <Button onClick={() => handleOpenSubjectForm()} variant="ghost" size="sm" className="h-8 text-nabawi hover:text-nabawi-dark hover:bg-nabawi/5">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => handleOpenSubjectForm(sub)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteSubject(sub.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Teacher Form Sheet */}
      <FormSheet
        open={isTeacherSheetOpen}
        onOpenChange={setIsTeacherSheetOpen}
        title={editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        description={editingTeacher ? 'Ubah informasi data guru di bawah ini.' : 'Masukkan data guru baru ke dalam sistem.'}
        onSave={handleSaveTeacher}
      >
        <div className="space-y-1.5">
          <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="e.g. Budi Santoso, S.Pd" 
            value={teacherForm.name} 
            onChange={e => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email <span className="text-red-500">*</span></Label>
          <Input 
            type="email"
            placeholder="budi@sekolah.com" 
            value={teacherForm.email} 
            onChange={e => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>NIP / NUPTK</Label>
          <Input 
            placeholder="1980XXXX..." 
            value={teacherForm.nip} 
            onChange={e => setTeacherForm(prev => ({ ...prev, nip: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nomor HP (WhatsApp)</Label>
          <Input 
            placeholder="0812XXXX..." 
            value={teacherForm.phone} 
            onChange={e => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
            className="rounded-xl"
          />
        </div>
      </FormSheet>

      {/* Student Form Sheet */}
      <FormSheet
        open={isStudentSheetOpen}
        onOpenChange={setIsStudentSheetOpen}
        title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        description={editingStudent ? 'Ubah informasi data siswa di bawah ini.' : 'Masukkan data siswa baru ke dalam sistem.'}
        onSave={handleSaveStudent}
      >
        <div className="space-y-1.5">
          <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="e.g. Ahmad Fawwaz" 
            value={studentForm.name} 
            onChange={e => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>NISN</Label>
          <Input 
            placeholder="001234..." 
            value={studentForm.nisn} 
            onChange={e => setStudentForm(prev => ({ ...prev, nisn: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Kelas <span className="text-red-500">*</span></Label>
          <select 
            value={studentForm.classId}
            onChange={e => setStudentForm(prev => ({ ...prev, classId: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            <option value="" disabled>-- Pilih Kelas --</option>
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
          <div className="flex gap-4 mt-2 h-10 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="gender" value="L" checked={studentForm.gender === 'L'} onChange={e => setStudentForm(prev => ({ ...prev, gender: 'L' }))} className="w-4 h-4 text-nabawi focus:ring-nabawi" /> Laki-laki
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="gender" value="P" checked={studentForm.gender === 'P'} onChange={e => setStudentForm(prev => ({ ...prev, gender: 'P' }))} className="w-4 h-4 text-nabawi focus:ring-nabawi" /> Perempuan
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Nama Orang Tua / Wali</Label>
          <Input 
            placeholder="Nama ayah/ibu..." 
            value={studentForm.parentName} 
            onChange={e => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nomor HP Orang Tua (WhatsApp)</Label>
          <Input 
            placeholder="0812XXXX..." 
            value={studentForm.phone} 
            onChange={e => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
            className="rounded-xl"
          />
        </div>
      </FormSheet>

      {/* Class Form Sheet */}
      <FormSheet
        open={isClassSheetOpen}
        onOpenChange={setIsClassSheetOpen}
        title={editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        description={editingClass ? 'Ubah informasi kelas di bawah ini.' : 'Masukkan data kelas baru ke dalam sistem.'}
        onSave={handleSaveClass}
      >
        <div className="space-y-1.5">
          <Label>Nama Kelas <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="e.g. X IPA 1" 
            value={classForm.name} 
            onChange={e => setClassForm(prev => ({ ...prev, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tingkat / Grade <span className="text-red-500">*</span></Label>
          <select 
            value={classForm.grade}
            onChange={e => setClassForm(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-nabawi outline-none"
          >
            <option value="" disabled>-- Pilih Tingkat --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
              <option key={g} value={String(g)}>Tingkat {g}</option>
            ))}
          </select>
        </div>
      </FormSheet>

      {/* Subject Form Sheet */}
      <FormSheet
        open={isSubjectSheetOpen}
        onOpenChange={setIsSubjectSheetOpen}
        title={editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mapel Baru'}
        description={editingSubject ? 'Ubah informasi mapel di bawah ini.' : 'Masukkan data mata pelajaran baru ke dalam sistem.'}
        onSave={handleSaveSubject}
      >
        <div className="space-y-1.5">
          <Label>Nama Mapel <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="e.g. Matematika Dasar" 
            value={subjectForm.name} 
            onChange={e => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Kode Mapel <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="e.g. MTK, B-IND" 
            value={subjectForm.code} 
            onChange={e => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
            className="rounded-xl uppercase"
          />
        </div>
      </FormSheet>
    </div>
  );
}
