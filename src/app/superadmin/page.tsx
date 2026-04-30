'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Building2, Users, GraduationCap, Database, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { state } = useApp();

  // Metrics Calculation
  const metrics = useMemo(() => {
    const totalTenants = 5; // Hardcoded dummy since we have 5 schools in dummy data
    const totalTeachers = state.teachers.length;
    const totalStudents = state.students.length;
    const storageUsage = '12.4 GB';

    return { totalTenants, totalTeachers, totalStudents, storageUsage };
  }, [state]);

  // Dummy Chart Data
  const revenueData = [40, 55, 45, 70, 60, 85, 100];
  const maxRevenue = Math.max(...revenueData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of SakuGuru SaaS platform performance.</p>
      </motion.div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Tenants', value: metrics.totalTenants, icon: <Building2 className="w-5 h-5 text-blue-400" />, trend: '+12%', color: 'from-blue-500/20 to-blue-500/0' },
          { label: 'Total Teachers', value: metrics.totalTeachers, icon: <Users className="w-5 h-5 text-purple-400" />, trend: '+5%', color: 'from-purple-500/20 to-purple-500/0' },
          { label: 'Total Students', value: metrics.totalStudents, icon: <GraduationCap className="w-5 h-5 text-emerald-400" />, trend: '+8%', color: 'from-emerald-500/20 to-emerald-500/0' },
          { label: 'Storage Used', value: metrics.storageUsage, icon: <Database className="w-5 h-5 text-gold" />, trend: '+2%', color: 'from-gold/20 to-gold/0' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-50`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  {item.icon}
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> {item.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white">{item.value}</h3>
              <p className="text-sm text-slate-400 mt-1 font-medium">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Revenue</h2>
              <p className="text-sm text-slate-400">Recurring SaaS subscriptions</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gold">Rp 12.5M</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                <ArrowUpRight className="w-3 h-3" /> +15.3% this month
              </p>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-4">
            {revenueData.map((val, i) => {
              const height = (val / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-800 rounded-t-sm rounded-b-md relative flex-1 flex items-end overflow-hidden group-hover:bg-slate-700 transition-colors">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className="w-full bg-linear-to-t from-gold-dark to-gold rounded-t-sm"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium group-hover:text-slate-300">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">Recent Tenant Activity</h2>
          <div className="space-y-6">
            {[
              { time: '10 mins ago', title: 'New Tenant Registered', desc: 'SMA Muhammadiyah 2', status: 'success' },
              { time: '2 hours ago', title: 'Payment Received', desc: 'INV-202604 paid by SMP IT Bina Insani', status: 'success' },
              { time: '5 hours ago', title: 'Storage Warning', desc: 'MA Al-Hidayah reached 90% quota', status: 'warning' },
              { time: '1 day ago', title: 'Account Suspended', desc: 'SDIT Nurul Fikri (Overdue 30 days)', status: 'error' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                    activity.status === 'success' ? 'bg-emerald-400' :
                    activity.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  {i !== 3 && <div className="w-px h-full bg-slate-800 mt-2" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{activity.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.desc}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
