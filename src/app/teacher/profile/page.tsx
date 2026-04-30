'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  User, History, Shield, LogOut, ChevronRight,
  CheckCircle2, Clock, BookOpen, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { state, logout } = useApp();
  const currentUser = state.currentUser;

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // History — all completed journals for this teacher
  const completedJournals = state.journals
    .filter(j => j.teacherId === 't1' && j.status === 'completed')
    .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    toast.success('Password berhasil diubah');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-nabawi/10 flex items-center justify-center">
            <User className="w-8 h-8 text-nabawi" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{currentUser?.name || 'Guru'}</h1>
            <p className="text-sm text-gray-500">{currentUser?.email || '-'}</p>
            <p className="text-xs text-gray-400 mt-0.5">NIP: {currentUser?.nip || '-'}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl h-10 p-1">
          <TabsTrigger value="history" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            <History className="w-4 h-4 mr-1.5" /> Riwayat
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-nabawi data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4 mr-1.5" /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Tab: History Jurnal */}
        <TabsContent value="history" className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 px-1">Riwayat Jurnal Terkirim</h2>

          {completedJournals.length > 0 ? (
            completedJournals.map((journal, i) => {
              const cls = state.classes.find(c => c.id === journal.classId);
              const subject = state.subjects.find(s => s.id === journal.subjectId);
              const hadirCount = journal.attendance?.filter(a => a.status === 'H').length || 0;
              const totalCount = journal.attendance?.length || 0;

              return (
                <motion.div
                  key={journal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-semibold text-gray-900">{subject?.name || '-'}</span>
                      </div>
                      <p className="text-xs text-gray-500">{cls?.name || '-'}</p>
                      {journal.material && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{journal.material}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">
                        {journal.submittedAt ? format(parseISO(journal.submittedAt), 'd MMM yyyy', { locale: localeId }) : journal.date}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {journal.submittedAt ? format(parseISO(journal.submittedAt), 'HH:mm') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {hadirCount}/{totalCount} hadir
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      📷 {journal.photos?.length || 0} foto
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada riwayat jurnal</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Security */}
        <TabsContent value="security" className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Ganti Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Password Lama</Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    className="h-10 rounded-xl text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Password Baru</Label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Konfirmasi Password Baru</Label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white text-sm font-semibold"
              >
                Simpan Password
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-terra text-sm font-medium hover:bg-terra/5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </motion.div>
    </div>
  );
}
