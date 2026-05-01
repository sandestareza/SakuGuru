'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import BottomNav, { adminNavItems } from '@/components/layout/BottomNav';
import Topbar from '@/components/layout/Topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (!state.currentUser) {
      const saved = localStorage.getItem('sakuguru_user');
      if (!saved) {
        router.replace('/login');
        return;
      }
      const user = JSON.parse(saved);
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        router.replace('/login');
      }
    } else if (state.currentUser.role !== 'admin' && state.currentUser.role !== 'superadmin') {
      router.replace('/login');
    }
  }, [state.currentUser, router]);

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Topbar />
      <main className="pb-bottom-nav w-full lg:max-w-3/4 mx-auto flex-1">
        {children}
      </main>
      <BottomNav items={adminNavItems} />
    </div>
  );
}
