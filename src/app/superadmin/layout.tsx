'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!state.currentUser) {
      router.push('/login');
    } else if (state.currentUser.role !== 'superadmin') {
      // Redirect to correct dashboard if trying to access superadmin without rights
      router.push(`/${state.currentUser.role}`);
    }
  }, [state.currentUser, router]);

  if (!mounted || !state.currentUser || state.currentUser.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gold">
        Loading Super Admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-gold selection:text-slate-900 font-sans flex">
      {/* Sidebar for Desktop */}
      <SuperAdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* We can add a top header here later if needed, but the sidebar handles most nav */}
        <div className="flex-1 overflow-x-hidden p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
