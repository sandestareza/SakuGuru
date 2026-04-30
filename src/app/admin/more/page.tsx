'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { FileText, CreditCard, CalendarDays, User, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MorePage() {
  const router = useRouter();
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/admin/reports',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      label: 'Laporan Center',
      desc: 'Cetak rekap absensi, nilai, dan jurnal',
      bg: 'bg-blue-50',
    },
    {
      href: '/admin/billing',
      icon: <CreditCard className="w-6 h-6 text-gold-dark" />,
      label: 'Tagihan SaaS',
      desc: 'Kelola pembayaran dan langganan',
      bg: 'bg-gold/10',
    },
    {
      href: '/admin/calendar',
      icon: <CalendarDays className="w-6 h-6 text-nabawi" />,
      label: 'Kalender Akademik',
      desc: 'Atur libur, ujian, dan kegiatan',
      bg: 'bg-nabawi/10',
    },
    {
      href: '/admin/profile',
      icon: <User className="w-6 h-6 text-purple-500" />,
      label: 'Profil Sekolah',
      desc: 'Pengaturan akun dan profil admin',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900">Menu Lainnya</h1>
        <p className="text-sm text-gray-500">Akses fitur tambahan SakuGuru</p>
      </motion.div>

      {/* Menu List */}
      <div className="space-y-3">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={item.href} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{item.label}</h3>
                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Logout Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-terra text-sm font-medium hover:bg-terra/5 rounded-xl transition-colors bg-white border border-terra/20"
        >
          <LogOut className="w-5 h-5" /> Keluar dari Akun Admin
        </button>
      </motion.div>
    </div>
  );
}
