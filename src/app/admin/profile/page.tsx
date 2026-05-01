'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Shield, LogOut, Eye, EyeOff, UserCog, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const router = useRouter();
  const { state, dispatch, logout } = useApp();
  const currentUser = state.currentUser;
  const currentSchool = currentUser?.schoolId ? state.schools.find(s => s.id === currentUser.schoolId) : null;

  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    name: currentSchool?.name || '',
    npsn: currentSchool?.npsn || '10123456',
    address: currentSchool?.address || '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

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

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSchool) {
      dispatch({
        type: 'UPDATE_SCHOOL',
        payload: {
          ...currentSchool,
          name: schoolForm.name,
          npsn: schoolForm.npsn,
          address: schoolForm.address,
        }
      });
      toast.success('Informasi sekolah berhasil diperbarui');
      setIsEditingSchool(false);
    }
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
            <UserCog className="w-8 h-8 text-nabawi" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{currentUser?.name || 'Admin'}</h1>
            <p className="text-sm text-gray-500">{currentUser?.email || '-'}</p>
            <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Role: {currentUser?.role}
            </span>
          </div>
        </div>
      </motion.div>

      {/* School Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Informasi Sekolah</h2>
          </div>
          {currentSchool && (
            <button 
              onClick={() => {
                if (!isEditingSchool) {
                  setSchoolForm({
                    name: currentSchool.name || '',
                    npsn: currentSchool.npsn || '10123456',
                    address: currentSchool.address || '',
                  });
                }
                setIsEditingSchool(!isEditingSchool);
              }}
              className="text-xs text-nabawi font-medium hover:underline"
            >
              {isEditingSchool ? 'Batal' : 'Edit'}
            </button>
          )}
        </div>

        {isEditingSchool && currentSchool ? (
          <form onSubmit={handleSaveSchool} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Nama Sekolah</Label>
              <Input 
                value={schoolForm.name}
                onChange={e => setSchoolForm({...schoolForm, name: e.target.value})}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">NPSN</Label>
              <Input 
                value={schoolForm.npsn}
                onChange={e => setSchoolForm({...schoolForm, npsn: e.target.value})}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Alamat Lengkap</Label>
              <Input 
                value={schoolForm.address}
                onChange={e => setSchoolForm({...schoolForm, address: e.target.value})}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-10 mt-2 text-sm font-semibold rounded-xl bg-nabawi hover:bg-nabawi-dark">
              Simpan Perubahan
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Nama Sekolah</p>
              <p className="text-sm font-medium text-gray-900">{currentSchool?.name || 'Belum diatur'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">NPSN</p>
              <p className="text-sm font-medium text-gray-900">{currentSchool?.npsn || '10123456'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Alamat Lengkap</p>
              <p className="text-sm font-medium text-gray-900">{currentSchool?.address || 'Belum diatur'}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Ganti Password</h2>
        </div>
        
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
            className="w-full h-10 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white text-sm font-semibold mt-2"
          >
            Simpan Password
          </Button>
        </form>
      </motion.div>

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
