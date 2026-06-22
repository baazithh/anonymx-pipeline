'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  score: number; // 0 to 100
}

export const RiskGauge: React.FC<Props> = ({ score }) => {
  const isHighRisk = score < 60;
  const isMedRisk = score >= 60 && score < 85;
  
  const getColor = () => {
    if (isHighRisk) return 'text-crimson';
    if (isMedRisk) return 'text-amber-400';
    return 'text-cyber-emerald';
  };

  const getGlow = () => {
    if (isHighRisk) return 'shadow-[0_0_15px_rgba(255,51,102,0.5)]';
    if (isMedRisk) return 'shadow-[0_0_15px_rgba(251,191,36,0.5)]';
    return 'shadow-[0_0_15px_rgba(0,255,102,0.5)]';
  };

  return (
    <div className="glass rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <Database size={40} />
      </div>
      
      <div className="relative w-32 h-32 mb-4">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="364.4"
            initial={{ strokeDashoffset: 364.4 }}
            animate={{ strokeDashoffset: 364.4 - (364.4 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`${getColor()}`}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black tracking-tighter ${getColor()}`}>
            {score.toFixed(0)}%
          </span>
          <span className="text-[8px] font-mono uppercase text-white/40 tracking-[0.2em]">Safety</span>
        </div>
      </div>

      <div className="text-center">
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-center ${getColor()}`}>
          {isHighRisk ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
          {isHighRisk ? 'Critical Leak Risk' : isMedRisk ? 'Elevated PII Risk' : 'Zero Trust SECURED'}
        </div>
        <p className="text-[9px] text-white/30 font-mono mt-2 uppercase">
          Dynamic Data Entropy Protection
        </p>
      </div>

      <motion.div 
        className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${getGlow()}`}
      />
    </div>
  );
};

import { Database } from 'lucide-react';
