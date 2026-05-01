'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import BottomNav, { teacherNavItems } from '@/components/layout/BottomNav';
import Topbar from '@/components/layout/Topbar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (!state.currentUser) {
      const saved = localStorage.getItem('sakuguru_user');
      if (!saved) {
        router.replace('/login');
      }
    }
  }, [state.currentUser, router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
      {/* Decorative elements - Premium Glow */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] bg-nabawi/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-terra/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[20%] left-[10%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

      <Topbar />
      <main className="pb-bottom-nav w-full lg:max-w-3/4 mx-auto flex-1 relative z-10">
        {children}
      </main>
      <BottomNav items={teacherNavItems} />
    </div>
  );
}
