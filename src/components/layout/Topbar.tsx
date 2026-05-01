'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User as UserIcon } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { Student } from '@/types';
import StudentDetailModal from '@/components/shared/StudentDetailModal';

export default function Topbar() {
  const { state } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.length > 1
    ? state.students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
    : [];

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between shrink-0">
        
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nabawi text-white flex items-center justify-center font-bold text-lg shadow-sm">
            S
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">SakuGuru</span>
        </div>

        {/* Search Area */}
        <div className="flex-1 max-w-xl mx-4 flex justify-end md:justify-center relative" ref={searchRef}>
          {/* Desktop Search Input */}
          <div className="hidden md:flex relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari santri berdasarkan nama/NISN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all outline-none"
            />
          </div>

          {/* Mobile Search Icon */}
          <button 
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchQuery.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 left-0 right-0 md:left-auto md:right-auto md:w-full md:max-w-md bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden mt-2 mx-4 md:mx-0 max-h-96 overflow-y-auto"
              >
                <div className="p-2 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-semibold text-gray-500 px-2">Hasil Pencarian ({searchResults.length})</span>
                  <button onClick={() => setIsSearchOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Santri tidak ditemukan
                  </div>
                ) : (
                  <ul className="py-2">
                    {searchResults.map(student => {
                      const cls = state.classes.find(c => c.id === student.classId);
                      return (
                        <li key={student.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center justify-between group cursor-pointer" onClick={() => handleOpenDetail(student)}>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-nabawi transition-colors">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.nisn} • {cls?.name || '-'}</p>
                          </div>
                          <button 
                            className="px-3 py-1.5 text-[10px] font-bold text-nabawi bg-nabawi/10 hover:bg-nabawi/20 rounded-lg transition-colors"
                          >
                            Detail
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Area */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {state.currentUser?.avatar ? (
              <img src={state.currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Mobile Full Screen Input Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed inset-0 z-50 bg-white p-4 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Cari santri berdasarkan nama/NISN..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-nabawi/20 focus:border-nabawi transition-all outline-none"
                  />
                </div>
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-3 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-2xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {searchQuery.length > 1 ? (
                <div className="flex-1 overflow-auto">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 px-2">Hasil ({searchResults.length})</h3>
                  {searchResults.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                      Santri tidak ditemukan
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {searchResults.map(student => {
                        const cls = state.classes.find(c => c.id === student.classId);
                        return (
                          <li key={student.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between" onClick={() => handleOpenDetail(student)}>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.nisn} • {cls?.name || '-'}</p>
                            </div>
                            <button 
                              className="px-4 py-2 text-xs font-bold text-nabawi bg-nabawi/10 hover:bg-nabawi/20 rounded-xl transition-colors"
                            >
                              Detail
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm mt-10">
                  Ketik nama atau NISN santri
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <StudentDetailModal 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />
    </>
  );
}
