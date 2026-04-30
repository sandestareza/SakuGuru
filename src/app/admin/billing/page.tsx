'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Tagihan SaaS</h1>
            <p className="text-xs text-gray-500">Info Pembayaran</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-linear-to-br from-nabawi via-nabawi-light to-nabawi rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90 font-medium">Status Berlangganan</span>
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" /> Aktif
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Paket Premium</h2>
            <p className="text-xs opacity-75">Siklus tagihan: Bulanan (Rp 250.000)</p>
          </div>
        </motion.div>

        {/* Current Invoice */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Tagihan Mendatang</h3>
              <p className="text-[10px] text-gray-400">INV-202605</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Rp 250.000</p>
              <p className="text-[10px] text-terra-muted font-medium flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> Jatuh tempo 5 Mei
              </p>
            </div>
          </div>
          <Button className="w-full h-10 rounded-xl bg-nabawi hover:bg-nabawi-dark text-white text-sm">
            Bayar Sekarang
          </Button>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 px-1">Riwayat Pembayaran</h3>
          <div className="space-y-2">
            {[
              { id: 'INV-202604', date: '5 Apr 2026', amount: '250.000', status: 'Lunas' },
              { id: 'INV-202603', date: '5 Mar 2026', amount: '250.000', status: 'Lunas' },
              { id: 'INV-202602', date: '5 Feb 2026', amount: '250.000', status: 'Lunas' },
            ].map((inv, i) => (
              <div key={inv.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{inv.id}</p>
                    <p className="text-[10px] text-gray-500">{inv.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">Rp {inv.amount}</p>
                  <p className="text-[10px] text-success font-medium">{inv.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
