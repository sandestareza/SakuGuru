'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('sakuguru_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const routes: Record<string, string> = {
        guru: '/teacher',
        admin: '/admin',
        superadmin: '/superadmin',
      };
      router.replace(routes[user.role] || '/login');
    } else {
      router.replace('/login');
    }
  }, [router, state.currentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-nabawi via-nabawi-light to-nabawi">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
          <BookOpen className="w-8 h-8 text-gold animate-pulse" />
        </div>
        <p className="text-white/60 text-sm">Memuat...</p>
      </motion.div>
    </div>
  );
}
