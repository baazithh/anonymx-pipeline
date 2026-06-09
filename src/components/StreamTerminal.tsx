'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  rawJson: any;
  maskedJson: any;
  latency: number;
  piiFound: string[];
}

export const StreamTerminal: React.FC<Props> = ({ rawJson, maskedJson, latency, piiFound }) => {
  const rawRef = useRef<HTMLDivElement>(null);
  const maskedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawRef.current) rawRef.current.scrollTop = rawRef.current.scrollHeight;
    if (maskedRef.current) maskedRef.current.scrollTop = maskedRef.current.scrollHeight;
  }, [rawJson, maskedJson]);

  const highlightPII = (json: any) => {
    const str = JSON.stringify(json, null, 2);
    // Rough highlighting for demo
    return str.split('\n').map((line, i) => {
      const isPII = line.toLowerCase().includes('name') || 
                    line.toLowerCase().includes('email') || 
                    line.toLowerCase().includes('phone') || 
                    line.toLowerCase().includes('address');
      
      return (
        <div key={i} className={`whitespace-pre-wrap ${isPII ? "text-crimson font-bold" : "text-white/80"}`}>
          {line}
        </div>
      );
    });
  };

  const highlightMasked = (json: any) => {
    const str = JSON.stringify(json, null, 2);
    return str.split('\n').map((line, i) => {
      const isMasked = line.includes('X-AnonUser') || 
                       line.includes('@anon-domain.internal') ||
                       (line.match(/\d/) && (line.toLowerCase().includes('phone') || line.toLowerCase().includes('address')));

      return (
        <div key={i} className={`whitespace-pre-wrap ${isMasked ? "text-cyber-emerald font-bold glow-emerald" : "text-white/60"}`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 rounded-xl overflow-hidden glass h-[500px]">
      <div className="flex flex-col h-full overflow-hidden border-r border-white/10">
        <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-crimson" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">INGRESS_STREAM / RAW_PII</span>
          </div>
          <AlertCircle size={14} className="text-crimson animate-pulse" />
        </div>
        <div ref={rawRef} className="flex-1 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={JSON.stringify(rawJson)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {highlightPII(rawJson)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
        <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-cyber-emerald" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">EGRESS_PIPELINE / MASKED_LZ</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-cyber-emerald">{latency.toFixed(2)}ms</span>
            <Database size={14} className="text-cyber-emerald" />
          </div>
        </div>
        <div ref={maskedRef} className="flex-1 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={JSON.stringify(maskedJson)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {highlightMasked(maskedJson)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
