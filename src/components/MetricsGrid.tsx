'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Zap, Lock } from 'lucide-react';

interface Props {
  complianceScore: number;
  throughput: number;
  entropyReduction: number;
}

export const MetricsGrid: React.FC<Props> = ({ complianceScore, throughput, entropyReduction }) => {
  const isHealthy = complianceScore > 90;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <motion.div 
        className="glass p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between items-start">
          <Shield className={isHealthy ? "text-cyber-emerald" : "text-crimson"} size={24} />
          <span className={`text-xs font-bold px-2 py-1 rounded ${isHealthy ? "bg-cyber-emerald/20 text-cyber-emerald" : "bg-crimson/20 text-crimson"}`}>
            {isHealthy ? "HARDENED" : "VULNERABLE"}
          </span>
        </div>
        <h3 className="text-white/60 text-sm font-medium">Compliance Score</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold font-mono transition-colors duration-500 ${isHealthy ? "text-cyber-emerald glow-emerald" : "text-crimson glow-crimson"}`}>
            {complianceScore.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${isHealthy ? "bg-cyber-emerald" : "bg-crimson"}`}
            initial={{ width: 0 }}
            animate={{ width: `${complianceScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <motion.div 
        className="glass p-6 rounded-xl flex flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-start">
          <Activity className="text-electric-cyan" size={24} />
          <Zap className="text-electric-cyan/40 animate-pulse" size={16} />
        </div>
        <h3 className="text-white/60 text-sm font-medium">Active Throughput</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono text-electric-cyan glow-cyan">
            {throughput.toFixed(2)}
          </span>
          <span className="text-white/40 text-xs">events/sec</span>
        </div>
        <div className="mt-4 flex gap-1 items-end h-6">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-full bg-electric-cyan/30 rounded-t-sm"
              initial={{ height: "20%" }}
              animate={{ height: `${20 + (i * 7) % 80}%` }} // Use deterministic values for initial layout
              transition={{ 
                repeat: Infinity, 
                duration: 1 + (i * 0.1) % 2, 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="glass p-6 rounded-xl flex flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-start">
          <Lock className="text-white" size={24} />
        </div>
        <h3 className="text-white/60 text-sm font-medium">Data Entropy Index</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono text-white">
            -{entropyReduction.toFixed(1)}%
          </span>
          <span className="text-white/40 text-xs">reduction</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['FPE', 'REGEX', 'HASH', 'AES-256'].map((tag) => (
            <span key={tag} className="text-[10px] font-bold border border-white/20 px-2 py-0.5 rounded text-white/60">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
