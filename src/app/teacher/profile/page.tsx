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
  CheckCircle2, Clock, BookOpen, Eye, EyeOff, Camera, X, Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { state, dispatch, logout } = useApp();
  const currentUser = state.currentUser;

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    nip: currentUser?.nip || '',
    phone: '',
    avatar: currentUser?.avatar || '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Update current user
    const updatedUser = { ...currentUser, ...profileForm };
    dispatch({ type: 'SET_USER', payload: updatedUser });
    
    // Update teacher record if possible
    const teacherRecord = state.teachers.find(t => t.id === currentUser.id);
    if (teacherRecord) {
      dispatch({ 
        type: 'UPDATE_TEACHER', 
        payload: { ...teacherRecord, name: profileForm.name, nip: profileForm.nip, email: profileForm.email, phone: profileForm.phone, avatar: profileForm.avatar } 
      });
    }

    toast.success('Profil berhasil diperbarui');
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate photo upload using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Edit Profil</h2>
              <button 
                type="button" 
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-nabawi text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-nabawi-dark transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Nama Lengkap</Label>
                <Input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="h-10 text-sm rounded-xl" required />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Email</Label>
                <Input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="h-10 text-sm rounded-xl" required />
              </div>
              <div>
                <Label className="text-xs text-gray-600">NIP</Label>
                <Input value={profileForm.nip} onChange={e => setProfileForm({...profileForm, nip: e.target.value})} className="h-10 text-sm rounded-xl" required />
              </div>
              <div>
                <Label className="text-xs text-gray-600">No. WhatsApp</Label>
                <Input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="h-10 text-sm rounded-xl" />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-10 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white font-semibold">
              <Save className="w-4 h-4 mr-2" /> Simpan Profil
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-nabawi/10 flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-nabawi" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{currentUser?.name || 'Guru'}</h1>
              <p className="text-sm text-gray-500">{currentUser?.email || '-'}</p>
              <p className="text-xs text-gray-400 mt-0.5">NIP: {currentUser?.nip || '-'}</p>
            </div>
            <button 
              onClick={() => {
                setProfileForm({
                  name: currentUser?.name || '',
                  email: currentUser?.email || '',
                  nip: currentUser?.nip || '',
                  phone: state.teachers.find(t => t.id === currentUser?.id)?.phone || '',
                  avatar: currentUser?.avatar || '',
                });
                setIsEditingProfile(true);
              }}
              className="text-xs font-semibold text-nabawi hover:underline shrink-0"
            >
              Edit
            </button>
          </div>
        )}
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
