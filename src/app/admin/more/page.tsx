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
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="px-1 pt-2"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-nabawi rounded-full" />
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Menu Lainnya</h1>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Fitur Tambahan SakuGuru</p>
      </motion.div>

      {/* Menu List */}
      <div className="grid grid-cols-1 gap-4">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={item.href} className="group relative flex items-center gap-5 bg-white rounded-[1.8rem] p-5 border border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-nabawi/10 transition-all active:scale-[0.98] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125" />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative z-10 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="text-base font-black text-gray-900 tracking-tight mb-1 uppercase leading-none">{item.label}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">{item.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-nabawi group-hover:text-white transition-all relative z-10">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Logout Button */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }} 
        className="pt-6"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 text-terra text-xs font-black uppercase tracking-widest hover:bg-terra/5 rounded-2xl transition-all bg-white border border-terra/20 shadow-xl shadow-terra/5 active:scale-95"
        >
          <LogOut className="w-5 h-5" /> Keluar dari Akun Admin
        </button>
      </motion.div>
    </div>
  );
}
