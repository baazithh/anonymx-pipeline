'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Play, Pause, RefreshCw, Layers } from 'lucide-react';
import { MetricsGrid } from '@/components/MetricsGrid';
import { StreamTerminal } from '@/components/StreamTerminal';
import { ComplianceVault } from '@/components/ComplianceVault';
import { generateTransaction } from '@/lib/mockDataStream';

export default function AnonymXDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [lastRaw, setLastRaw] = useState<any>(null);
  const [lastMasked, setLastMasked] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    complianceScore: 100,
    throughput: 0,
    entropyReduction: 0,
    latency: 0,
    piiFound: [] as string[]
  });

  useEffect(() => {
    setMounted(true);
    setLastRaw(generateTransaction());
  }, []);

  const processNext = useCallback(async () => {
    const raw = generateTransaction();
    setLastRaw(raw);

    try {
      const res = await fetch('/api/mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raw)
      });
      const data = await res.json();

      setLastMasked(data.masked);
      setMetrics(prev => ({
        complianceScore: 95 + Math.random() * 5,
        throughput: 12 + Math.random() * 5,
        entropyReduction: data.metadata.entropyReduction,
        latency: data.metadata.latencies,
        piiFound: data.metadata.piiFound
      }));
    } catch (err) {
      console.error('Processing failed', err);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(processNext, 1500);
    }
    return () => clearInterval(interval);
  }, [isActive, processNext]);

  // Initial process
  useEffect(() => {
    if (!lastMasked) {
      processNext();
    }
  }, [processNext, lastMasked]);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-cyber-emerald/30">
      {/* Header */}
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="text-cyber-emerald" size={32} />
            <motion.div 
              className="absolute -inset-1 bg-cyber-emerald/20 blur-lg rounded-full"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2">
              Anonym<span className="text-cyber-emerald">X</span>
              <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded border border-white/10 font-mono text-white/40">v2.4.0</span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Zero-Trust Data Masking Pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-cyber-emerald animate-pulse" : "bg-white/20"}`} />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{isActive ? "Pipeline Active" : "Pipeline Idle"}</span>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300 border ${isActive ? "bg-crimson/10 border-crimson/50 text-crimson hover:bg-crimson/20" : "bg-cyber-emerald/10 border-cyber-emerald/50 text-cyber-emerald hover:bg-cyber-emerald/20"}`}
          >
            {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isActive ? "Stop Pipeline" : "Start Pipeline"}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Real-Time Masking Control Plane</h2>
            <p className="text-white/40 text-sm mt-1">Orchestrating FPE & Regex-based PII scrubbing across GCC FinTech endpoints.</p>
          </div>
          <div className="flex gap-2">
            <button className="glass flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-white/60 hover:text-white transition-colors">
              <RefreshCw size={12} /> Sync Schema
            </button>
            <button className="glass flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-white/60 hover:text-white transition-colors">
              <Layers size={12} /> Edge Nodes: 14
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <MetricsGrid 
          complianceScore={metrics.complianceScore}
          throughput={isActive ? metrics.throughput : 0}
          entropyReduction={metrics.entropyReduction}
        />

        {/* Live Stream Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 border-l-2 border-crimson pl-3">Live Data Transformer</h3>
            <div className="text-[10px] font-mono text-white/20">BUFFER_STATUS: NOMINAL</div>
          </div>
          <StreamTerminal 
            rawJson={lastRaw} 
            maskedJson={lastMasked || { status: 'Awaiting transformation...' }}
            latency={metrics.latency}
            piiFound={metrics.piiFound}
          />
        </div>

        {/* Compliance Section */}
        <ComplianceVault />
      </div>

      {/* Footer Decoration */}
      <footer className="mt-24 pt-12 border-t border-white/5 text-center text-[10px] font-mono text-white/10 uppercase tracking-[0.5em]">
        System Architecture: Federated Identity Masking • GCC-REG-COMPLIANCE-882
      </footer>
    </main>
  );
}
