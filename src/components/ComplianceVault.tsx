'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, History, Download } from 'lucide-react';

interface AuditLog {
  id: string | number;
  timestamp: string;
  target: string;
  type: string;
  info: string;
  status: 'Verified' | 'Pending' | 'Flagged';
}

interface ComplianceVaultProps {
  logs: AuditLog[];
}

export const ComplianceVault: React.FC<ComplianceVaultProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.info.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse(); // Show latest first

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Timestamp,Target,Type,Info,Status", ...logs.map(l => 
        `${l.id},${l.timestamp},${l.target},${l.type},"${l.info}",${l.status}`
      )].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `anonymx_audit_report_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      className="glass rounded-xl overflow-hidden mt-8 border border-white/5"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white/[0.02] border-b border-white/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-electric-cyan/10 rounded-lg">
            <History size={18} className="text-electric-cyan" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">Compliance Audit Vault</h2>
            <p className="text-[10px] text-white/30 font-mono">Immutable transformation blockchain</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Filter audit trails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md py-1.5 pl-9 pr-4 text-xs text-white/80 focus:outline-none focus:border-electric-cyan/50 transition-colors w-full md:w-64"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-cyber-emerald/10 hover:bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/20 rounded px-4 py-1.5 text-[10px] font-bold transition-all uppercase tracking-tight"
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
            <tr className="border-b border-white/10 text-white/40 uppercase tracking-tighter">
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Resource/Target</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Details</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-mono text-white/40 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 font-bold text-electric-cyan/80">{log.target}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                    log.type.includes('SUCCESS') ? 'bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/20' : 'bg-white/10 text-white/80 border border-white/10'
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/60 font-medium">{log.info}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 ${
                    log.status === 'Verified' ? 'text-cyber-emerald' : 'text-amber-400'
                  }`}>
                    <CheckCircle2 size={12} />
                    <span className="font-black uppercase tracking-tighter text-[9px]">{log.status}</span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/20 font-mono uppercase tracking-[0.2em]">
                  No synchronization data found in buffer
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white/[0.02] px-6 py-3 flex justify-between items-center border-t border-white/5">
        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">
          Buffer Integrity: 100%
        </span>
        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">
          Logs in view: {filteredLogs.length}
        </span>
      </div>
    </motion.div>
  );
};
