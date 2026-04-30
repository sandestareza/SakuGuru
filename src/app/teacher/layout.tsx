'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import BottomNav, { teacherNavItems } from '@/components/layout/BottomNav';

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
    <div className="min-h-screen bg-sand">
      <main className="pb-bottom-nav max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav items={teacherNavItems} />
    </div>
  );
}
