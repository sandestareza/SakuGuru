'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { CreditCard, Search, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SuperAdminBillingPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [search, setSearch] = useState('');

  const filteredRecords = state.billingRecords.filter(record => {
    if (filter !== 'all' && record.status !== filter) return false;
    const school = state.schools.find(s => s.id === record.schoolId);
    if (search && school && !school.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalRevenue = state.billingRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
    
  const pendingRevenue = state.billingRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const overdueRevenue = state.billingRecords
    .filter(r => r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSendReminder = () => {
    toast.success('Pengingat tagihan berhasil dikirim ke sekolah terkait.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Billing Center</h1>
          <p className="text-slate-400 mt-1 text-sm">Pusat kelola tagihan SaaS untuk semua Tenant.</p>
        </motion.div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-400">Total Pendapatan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{formatRupiah(totalRevenue)}</h2>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-400">Tagihan Pending</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{formatRupiah(pendingRevenue)}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-400">Tagihan Overdue</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-rose-400">{formatRupiah(overdueRevenue)}</h2>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Tagihan' },
            { id: 'paid', label: 'Lunas' },
            { id: 'pending', label: 'Pending' },
            { id: 'overdue', label: 'Overdue' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.id 
                  ? 'bg-gold text-slate-900' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Cari sekolah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full bg-slate-800 border-transparent text-slate-200 placeholder:text-slate-500 focus-visible:ring-gold focus-visible:border-transparent"
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Tenant (Sekolah)</th>
                <th className="p-4">Periode</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((record, i) => {
                const school = state.schools.find(s => s.id === record.schoolId);
                return (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-4 text-sm font-medium text-slate-300">
                      {record.id.toUpperCase()}
                      <span className="block text-[10px] text-slate-500 mt-0.5">Jatuh Tempo: {record.dueDate}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-gold/50 transition-colors">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">{school?.name || 'Unknown School'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{record.period}</td>
                    <td className="p-4 text-sm font-bold text-white">{formatRupiah(record.amount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        record.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        record.status === 'pending' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {record.status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {record.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {record.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {record.status !== 'paid' && (
                        <Button 
                          onClick={handleSendReminder}
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <Send className="w-3 h-3 mr-1.5" /> Reminder
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    Tidak ada tagihan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
