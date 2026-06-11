'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, ShieldCheck, AlertCircle, Settings2, ToggleLeft, ToggleRight } from 'lucide-react';
import { MaskingConfig } from '@/lib/maskingEngine';

interface Props {
  rawJson: any;
  maskedJson: any;
  latency: number;
  piiFound: string[];
  config: MaskingConfig;
  onConfigChange: (newConfig: MaskingConfig) => void;
}

export const StreamTerminal: React.FC<Props> = ({ rawJson, maskedJson, latency, piiFound, config, onConfigChange }) => {
  const rawRef = useRef<HTMLDivElement>(null);
  const maskedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawRef.current) rawRef.current.scrollTop = rawRef.current.scrollHeight;
    if (maskedRef.current) maskedRef.current.scrollTop = maskedRef.current.scrollHeight;
  }, [rawJson, maskedJson]);

  const toggleRule = (key: keyof MaskingConfig) => {
    onConfigChange({ ...config, [key]: !config[key] });
  };

  const highlightPII = (json: any) => {
    const str = JSON.stringify(json, null, 2);
    return str.split('\n').map((line, i) => {
      const isPII = line.toLowerCase().match(/name|email|phone|address|cc|card|iban|bank|id|national|emirates/);
      
      return (
        <div key={i} className={`whitespace-pre-wrap px-2 ${isPII ? "text-crimson/90 font-bold bg-crimson/5 border-l-2 border-crimson" : "text-white/70"}`}>
          {line}
        </div>
      );
    });
  };

  const highlightMasked = (json: any) => {
    const str = JSON.stringify(json, null, 2);
    return str.split('\n').map((line, i) => {
      const isMasked = line.includes('X-AnonUser') || 
                       line.includes('@anon-') ||
                       line.includes('XXXX') ||
                       line.includes('X-ID-') ||
                       line.includes('784-XXXX') ||
                       (line.match(/\d/) && (line.toLowerCase().includes('phone') || line.toLowerCase().includes('address')));

      return (
        <div key={i} className={`whitespace-pre-wrap px-2 ${isMasked ? "text-cyber-emerald font-bold glow-emerald bg-cyber-emerald/5 border-l-2 border-cyber-emerald" : "text-white/50"}`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
      {/* Configuration Sidebar */}
      <div className="lg:w-64 glass rounded-xl border border-white/5 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 size={16} className="text-white/40" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Masking Rules</h4>
        </div>
        
        {(Object.keys(config) as Array<keyof MaskingConfig>).map((key) => (
          <button 
            key={key}
            onClick={() => toggleRule(key)}
            className="flex items-center justify-between group p-2 rounded hover:bg-white/5 transition-colors"
          >
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter group-hover:text-white/80">
              {key.replace('mask', '').replace(/([A-Z])/g, ' $1')}
            </span>
            {config[key] ? (
              <ToggleRight className="text-cyber-emerald" size={20} />
            ) : (
              <ToggleLeft className="text-white/20" size={20} />
            )}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="bg-black/40 rounded p-3 text-[9px] font-mono leading-relaxed">
            <span className="text-cyber-emerald font-bold">Active Sensors:</span>
            <div className="mt-1 space-y-1 text-white/40">
              {piiFound.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyber-emerald" />
                  {p.toUpperCase()}
                </div>
              ))}
              {piiFound.length === 0 && <div>NO PII DETECTED</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Terminals Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-xl overflow-hidden glass border border-white/5">
        <div className="flex flex-col h-full overflow-hidden border-r border-white/10">
          <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-crimson" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">INGRESS_STREAM</span>
            </div>
            <AlertCircle size={14} className="text-crimson animate-pulse" />
          </div>
          <div ref={rawRef} className="flex-1 p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar bg-black/20">
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
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">EGRESS_PIPELINE</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-cyber-emerald">{latency.toFixed(2)}ms</span>
              <Database size={14} className="text-cyber-emerald" />
            </div>
          </div>
          <div ref={maskedRef} className="flex-1 p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar bg-black/20">
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
    </div>
  );
};
