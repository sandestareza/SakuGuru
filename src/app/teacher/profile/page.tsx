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
  CheckCircle2, Clock, BookOpen, Eye, EyeOff, Camera, X, Save,
  PencilIcon
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
    <div className="p-4 space-y-6 pb-24">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-gray-200/50 border-2 border-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <User className="w-32 h-32 text-nabawi" />
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-nabawi rounded-full" />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Edit Profil</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-gray-50 shadow-xl overflow-hidden flex items-center justify-center">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-200" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-nabawi text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg border-2 border-white hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</Label>
                <Input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="h-12 text-sm rounded-2xl bg-gray-50 border-white focus:bg-white shadow-inner" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</Label>
                <Input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="h-12 text-sm rounded-2xl bg-gray-50 border-white focus:bg-white shadow-inner" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIP</Label>
                <Input value={profileForm.nip} onChange={e => setProfileForm({...profileForm, nip: e.target.value})} className="h-12 text-sm rounded-2xl bg-gray-50 border-white focus:bg-white shadow-inner" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp</Label>
                <Input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="h-12 text-sm rounded-2xl bg-gray-50 border-white focus:bg-white shadow-inner" />
              </div>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full h-14 rounded-2xl bg-nabawi hover:bg-nabawi-dark text-white font-black uppercase tracking-widest shadow-xl shadow-nabawi/20 flex items-center justify-center gap-3 transition-all"
            >
              <Save className="w-5 h-5" /> Simpan Perubahan
            </motion.button>
          </form>
        ) : (
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-nabawi/10 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-nabawi" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">{currentUser?.name || 'Guru'}</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{currentUser?.email || '-'}</p>
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-nabawi/5 rounded-full border border-nabawi/10">
                 <span className="text-[10px] font-black text-nabawi uppercase tracking-tighter">NIP: {currentUser?.nip || '-'}</span>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
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
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-nabawi hover:bg-nabawi hover:text-white transition-all shadow-sm"
            >
              <PencilIcon className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm rounded-2xl h-14 p-1.5 border-2 border-white shadow-sm">
          <TabsTrigger value="history" className="rounded-xl text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-nabawi data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <History className="w-4 h-4 mr-2" /> Riwayat
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-nabawi data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <Shield className="w-4 h-4 mr-2" /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Tab: History Jurnal */}
        <TabsContent value="history" className="space-y-4 outline-none">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Riwayat Jurnal Terkirim</h2>
            <div className="h-px flex-1 bg-gray-100 ml-4" />
          </div>

          {completedJournals.length > 0 ? (
            <div className="space-y-4">
              {completedJournals.map((journal, i) => {
                const cls = state.classes.find(c => c.id === journal.classId);
                const subject = state.subjects.find(s => s.id === journal.subjectId);
                const hadirCount = journal.attendance?.filter(a => a.status === 'H').length || 0;
                const totalCount = journal.attendance?.length || 0;

                return (
                  <motion.div
                    key={journal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white rounded-[2rem] p-5 border-2 border-white shadow-xl shadow-gray-200/40 hover:border-nabawi/10 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{subject?.name || '-'}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cls?.name || '-'}</p>
                          </div>
                        </div>
                        {journal.material && (
                          <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 mb-3">
                             <p className="text-[11px] font-medium text-gray-500 leading-relaxed line-clamp-2">{journal.material}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-gray-900 uppercase">
                          {journal.submittedAt ? format(parseISO(journal.submittedAt), 'd MMM', { locale: localeId }) : journal.date}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          {journal.submittedAt ? format(parseISO(journal.submittedAt), 'HH:mm') : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-1 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                        <User className="w-3 h-3 text-gray-400" /> 
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{hadirCount}/{totalCount} Siswa</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                        <Camera className="w-3 h-3 text-gray-400" /> 
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{journal.photos?.length || 0} Bukti</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-white shadow-2xl shadow-gray-200/50">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Belum Ada Riwayat</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Security */}
        <TabsContent value="security" className="outline-none">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-gray-200/50 border-2 border-white"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Ganti Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Lama</Label>
                <div className="relative group">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-2xl text-sm pr-12 bg-gray-50 border-white focus:bg-white shadow-inner transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-nabawi transition-colors"
                  >
                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru</Label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-12 rounded-2xl text-sm bg-gray-50 border-white focus:bg-white shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Password</Label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="h-12 rounded-2xl text-sm bg-gray-50 border-white focus:bg-white shadow-inner"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-14 rounded-2xl bg-gold hover:bg-gold-dark text-nabawi-dark font-black uppercase tracking-widest shadow-xl shadow-gold/20 transition-all mt-4"
              >
                Simpan Password Baru
              </motion.button>
            </form>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 text-terra font-black uppercase tracking-[0.2em] text-[10px] bg-terra/5 hover:bg-terra/10 rounded-2xl transition-all border border-terra/10"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </motion.div>
    </div>
  );
}
