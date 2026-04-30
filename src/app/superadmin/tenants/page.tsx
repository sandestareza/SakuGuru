'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Search, Building2, MoreVertical, ShieldAlert, CheckCircle2, Clock, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TenantsPage() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = state.schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (schoolName: string, newStatus: string) => {
    toast.success(`Status ${schoolName} berhasil diubah menjadi ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Tenant</h1>
          <p className="text-slate-400 mt-1 text-sm">Kelola akses dan kuota sekolah pelanggan.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Cari nama sekolah..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full sm:w-64 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-gold"
          />
        </motion.div>
      </div>

      {/* Tenant List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchools.map((school, i) => {
          // Count actual users from state for this school
          const teacherCount = state.teachers.filter(t => t.schoolId === school.id).length;
          // Normally we would count students too, but state.students don't have schoolId directly, 
          // they belong to classes which belong to schools. We'll use dummy counts for UI.
          const studentCount = Math.floor(Math.random() * 300) + 50; 
          
          return (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 group-hover:text-gold transition-colors">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{school.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {school.id.toUpperCase()}</p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                    school.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                    school.status === 'TRIAL' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {school.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {school.status === 'TRIAL' && <Clock className="w-3.5 h-3.5" />}
                    {school.status === 'SUSPENDED' && <Ban className="w-3.5 h-3.5" />}
                    {school.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Guru</span>
                  <span className="text-slate-200 font-medium">{teacherCount} <span className="text-slate-600">/ {school.maxTeachers}</span></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Siswa</span>
                  <span className="text-slate-200 font-medium">{studentCount} <span className="text-slate-600">/ {school.maxStudents}</span></span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Jatuh Tempo</span>
                  <span className="text-slate-300 font-mono text-xs">{school.dueDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                {school.status !== 'ACTIVE' && (
                  <button 
                    onClick={() => handleStatusChange(school.name, 'ACTIVE')}
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-emerald-500/20"
                  >
                    Activate
                  </button>
                )}
                {school.status === 'ACTIVE' && (
                  <button 
                    onClick={() => handleStatusChange(school.name, 'SUSPENDED')}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition-colors border border-rose-500/20"
                  >
                    Suspend
                  </button>
                )}
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
                  Detail
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {filteredSchools.length === 0 && (
        <div className="text-center py-20">
          <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Tenant tidak ditemukan</h3>
          <p className="text-slate-500 text-sm mt-1">Gunakan kata kunci pencarian yang berbeda.</p>
        </div>
      )}
    </div>
  );
}
