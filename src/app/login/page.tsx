'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, GraduationCap, Shield, UserCog } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'guru', label: 'Guru / Ustadz', icon: <GraduationCap className="w-5 h-5" />, desc: 'Akses jurnal & absensi' },
  { value: 'admin', label: 'Admin Sekolah', icon: <UserCog className="w-5 h-5" />, desc: 'Kelola data & laporan' },
//   { value: 'superadmin', label: 'Super Admin', icon: <Shield className="w-5 h-5" />, desc: 'Kontrol platform SaaS' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('guru');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 800));

    login(selectedRole);

    const routes: Record<UserRole, string> = {
      guru: '/teacher',
      admin: '/admin',
      superadmin: '/superadmin',
    };
    router.push(routes[selectedRole]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-linear-to-br from-nabawi via-nabawi-light to-nabawi">
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <BookOpen className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SakuGuru</h1>
          <p className="text-white/60 text-sm mt-1">Digitalisasi Jurnal Mengajar</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-6 space-y-5"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Masuk ke Akun Anda</h2>
            <p className="text-sm text-gray-500 mt-1">Pilih peran dan masukkan kredensial</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => { setSelectedRole(role.value); setError(''); }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                  selectedRole === role.value
                    ? 'border-nabawi bg-nabawi/5 text-nabawi'
                    : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {selectedRole === role.value && (
                  <motion.div
                    layoutId="activeRole"
                    className="absolute inset-0 rounded-2xl border-2 border-nabawi"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{role.icon}</span>
                <span className="relative z-10 text-xs font-medium leading-tight text-center">{role.label}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email / NIP
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Masukkan email atau NIP"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-nabawi transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-nabawi transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white font-semibold text-base shadow-lg shadow-nabawi/25 transition-all duration-200 hover:shadow-xl hover:shadow-nabawi/30"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <p className="text-center text-xs text-gray-400 pt-2">
            Demo: Pilih peran dan klik Masuk
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-6">
          © 2026 SakuGuru. Platform Digitalisasi Pendidikan.
        </p>
      </motion.div>
    </div>
  );
}
