'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calendar, User } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/teacher' && item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-nabawi"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                />
              )}
              <span className={`transition-colors duration-200 ${
                isActive ? 'text-nabawi' : 'text-gray-400'
              }`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? 'text-nabawi' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
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
  { href: '/admin/master', label: 'Master', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/admin/schedules', label: 'Jadwal', icon: <Calendar className="w-5 h-5" /> },
  { href: '/admin/more', label: 'Lainnya', icon: <User className="w-5 h-5" /> },
];
