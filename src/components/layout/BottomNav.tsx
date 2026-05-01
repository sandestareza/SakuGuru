'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calendar, User, BoxIcon, ClipboardList } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <nav className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-2 py-2 pointer-events-auto max-w-lg w-full">
        <div className="flex items-center justify-around h-12">
          {items.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/teacher' && item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full group"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-nabawi/10 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  />
                )}
                
                <motion.span 
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0 
                  }}
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-nabawi' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {item.icon}
                </motion.span>
                
                <span className={`relative z-10 text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
                  isActive ? 'text-nabawi' : 'text-gray-400 group-hover:text-gray-500'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-nabawi shadow-[0_0_8px_rgba(45,90,61,0.5)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Pre-configured nav items for each role
export const teacherNavItems: NavItem[] = [
  { href: '/teacher', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
  { href: '/teacher/academic', label: 'Akademik', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/teacher/calendar', label: 'Kalender', icon: <Calendar className="w-5 h-5" /> },
  { href: '/teacher/profile', label: 'Profil', icon: <User className="w-5 h-5" /> },
];

export const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { href: '/admin/master', label: 'Master', icon: <BoxIcon className="w-5 h-5" /> },
  { href: '/admin/schedules', label: 'Jadwal', icon: <Calendar className="w-5 h-5" /> },
  { href: '/admin/reports', label: 'Laporan', icon: <ClipboardList className="w-5 h-5" /> },
];
