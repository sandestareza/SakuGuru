'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Settings, ShieldAlert, Activity, UserCog, CheckCircle2, AlertTriangle, Info, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function SettingsAndLogsPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('logs');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pengaturan sistem berhasil disimpan.');
  };

  const handleBackup = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Mempersiapkan backup database...',
        success: 'Backup database berhasil diselesaikan!',
        error: 'Gagal melakukan backup',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Logs</h1>
        <p className="text-slate-400 mt-1 text-sm">Konfigurasi global platform dan pemantauan sistem.</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl h-12 w-full sm:w-auto inline-flex">
          <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-gold text-slate-400 px-6">
            System Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-gold text-slate-400 px-6">
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-gold text-slate-400 px-6">
            My Profile
          </TabsTrigger>
        </TabsList>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="mt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Activity Logs
              </h2>
              <span className="text-xs text-slate-500 font-mono">Last 24 Hours</span>
            </div>
            <div className="divide-y divide-slate-800">
              {state.systemLogs.map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex gap-4 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="shrink-0 mt-0.5">
                    {log.level === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                    {log.level === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {log.level === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{log.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                      <span>{format(parseISO(log.timestamp), 'dd MMM yyyy, HH:mm:ss')}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">{log.source}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold" /> Konfigurasi Platform
              </h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Harga Dasar Langganan (Bulanan)</Label>
                  <Input defaultValue="1500000" className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-gold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Pajak / PPN (%)</Label>
                  <Input defaultValue="11" className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-gold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Email Bantuan (Support)</Label>
                  <Input defaultValue="support@sakuguru.id" className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-gold" />
                </div>
                <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-slate-900 font-bold">
                  Simpan Konfigurasi
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-400" /> Maintenance & Backup
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Lakukan pencadangan (backup) database secara manual jika diperlukan. Sistem sudah melakukan backup otomatis setiap jam 02:00 AM.
              </p>
              <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Terakhir Backup</p>
                  <p className="text-sm font-semibold text-slate-200">29 Apr 2026, 02:00:00</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <Button onClick={handleBackup} variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                Jalankan Manual Backup
              </Button>
            </motion.div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-purple-400" /> Akun Super Admin
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-white">
                {state.currentUser?.name?.charAt(0) || 'SA'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{state.currentUser?.name}</h3>
                <p className="text-sm text-slate-400">{state.currentUser?.email}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Ganti Password</Label>
                <Input type="password" placeholder="Password Baru" className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-gold" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Konfirmasi Password Baru</Label>
                <Input type="password" placeholder="Ulangi Password" className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-gold" />
              </div>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white w-full">
                Perbarui Profil
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
