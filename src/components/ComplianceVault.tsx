'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, CheckCircle2, History } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, timestamp: '2026-06-09T19:40:12Z', target: 'Iceberg:finance_ops', type: 'MASK_SUCCESS', info: 'PII Scrub: 4 tokens sanitized' },
  { id: 2, timestamp: '2026-06-09T19:40:15Z', target: 'Iceberg:customer_360', type: 'MASK_SUCCESS', info: 'PII Scrub: 2 tokens sanitized' },
  { id: 3, timestamp: '2026-06-09T19:40:18Z', target: 'Iceberg:bnpl_ledger', type: 'ENCRYPT_FPE', info: 'Phone format preserved' },
  { id: 4, timestamp: '2026-06-09T19:40:21Z', target: 'Iceberg:finance_ops', type: 'MASK_SUCCESS', info: 'PII Scrub: 5 tokens sanitized' },
];

export const ComplianceVault: React.FC = () => {
  return (
    <motion.div 
      className="glass rounded-xl overflow-hidden mt-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <History size={20} className="text-electric-cyan" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Compliance Audit Vault</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search audit trails..." 
              className="bg-black/40 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white/80 focus:outline-none focus:border-electric-cyan/50 transition-colors w-64"
            />
          </div>
          <button className="bg-electric-cyan/10 hover:bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/20 rounded px-3 py-1.5 text-[10px] font-bold transition-all uppercase tracking-tight">
            Export Report
          </button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-white/40 uppercase tracking-tighter">
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Target Database</th>
              <th className="px-6 py-3 font-medium">Action Type</th>
              <th className="px-6 py-3 font-medium">Audit Logs</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-mono text-white/60">{log.timestamp}</td>
                <td className="px-6 py-4 font-bold text-electric-cyan/80">{log.target}</td>
                <td className="px-6 py-4">
                  <span className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white/80">
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/50">{log.info}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-cyber-emerald">
                    <CheckCircle2 size={12} />
                    <span className="font-bold uppercase tracking-tight text-[10px]">Verified</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white/5 px-6 py-4 flex justify-center border-t border-white/5">
        <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">End of available audit synchronization</span>
      </div>
    </motion.div>
  );
};
