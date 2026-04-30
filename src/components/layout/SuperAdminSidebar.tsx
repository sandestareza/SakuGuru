'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { LayoutDashboard, Building2, CreditCard, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, state } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/superadmin', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/superadmin/tenants', label: 'Tenants (Sekolah)', icon: <Building2 className="w-5 h-5" /> },
    { href: '/superadmin/billing', label: 'Tagihan Pusat', icon: <CreditCard className="w-5 h-5" /> },
    { href: '/superadmin/settings', label: 'Settings & Logs', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50 text-slate-300">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <span className="text-slate-900 font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SakuGuru<span className="text-gold">.</span></h1>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
            {state.currentUser?.name?.charAt(0) || 'SA'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-white truncate">{state.currentUser?.name}</h2>
            <p className="text-xs text-slate-500 truncate">{state.currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'text-gold font-medium bg-gold/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive ? 'text-gold' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="activeNavSuperAdmin" className="absolute left-0 w-1 h-6 bg-gold rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-terra hover:bg-terra/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}
