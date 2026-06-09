'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Play, Pause, RefreshCw, Layers, Trash2 } from 'lucide-react';
import { MetricsGrid } from '@/components/MetricsGrid';
import { StreamTerminal } from '@/components/StreamTerminal';
import { ComplianceVault } from '@/components/ComplianceVault';
import { generateTransaction } from '@/lib/mockDataStream';
import { DEFAULT_CONFIG, MaskingConfig } from '@/lib/maskingEngine';

export default function AnonymXDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [lastRaw, setLastRaw] = useState<any>(null);
  const [lastMasked, setLastMasked] = useState<any>(null);
  const [maskingConfig, setMaskingConfig] = useState<MaskingConfig>(DEFAULT_CONFIG);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
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
        body: JSON.stringify({ payload: raw, config: maskingConfig })
      });
      const data = await res.json();

      setLastMasked(data.masked);
      setMetrics(prev => ({
        complianceScore: 90 + Math.random() * 10,
        throughput: 12 + Math.random() * 5,
        entropyReduction: data.metadata.entropyReduction,
        latency: data.metadata.latencies,
        piiFound: data.metadata.piiFound
      }));

      // Add to audit logs
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        target: raw.target_db || 'Iceberg:default',
        type: data.metadata.piiFound.length > 0 ? 'MASK_SUCCESS' : 'NO_PII_FOUND',
        info: data.metadata.piiFound.length > 0 
          ? `Sanitized: ${data.metadata.piiFound.join(', ')}`
          : 'Clean payload verified',
        status: 'Verified'
      };

      setAuditLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
    } catch (err) {
      console.error('Processing failed', err);
    }
  }, [maskingConfig]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(processNext, 1800);
    }
    return () => clearInterval(interval);
  }, [isActive, processNext]);

  // Initial process
  useEffect(() => {
    if (mounted && !lastMasked) {
      processNext();
    }
  }, [mounted, processNext, lastMasked]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-cyber-emerald/30">
      {/* Header */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
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
            <h1 className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2 text-white/90">
              Anonym<span className="text-cyber-emerald">X</span>
              <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded border border-white/10 font-mono text-white/40">v2.5.0</span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Federated Privacy Mesh Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/[0.03] border border-white/5 p-2 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2 ml-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-cyber-emerald shadow-[0_0_8px_#00ff66]" : "bg-white/20"}`} />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">{isActive ? "Pipeline Active" : "Operational Idle"}</span>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 border ${isActive ? "bg-crimson/20 border-crimson/50 text-crimson hover:bg-crimson/30" : "bg-cyber-emerald/10 border-cyber-emerald/50 text-cyber-emerald hover:bg-cyber-emerald/20"}`}
          >
            {isActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            {isActive ? "Kill Switch" : "Enable Stream"}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Control Plane <span className="text-white/20 font-light text-xl">/ Phase 2</span></h2>
            <p className="text-white/40 text-xs mt-2 font-mono uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyber-emerald rounded-full" /> 
              FPE & Hash-based PII scrubbing synchronized with Iceberg cluster
            </p>
          </div>
          <div className="flex gap-3">
            <button className="glass flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors border border-white/5">
              <RefreshCw size={12} /> Sync Nodes
            </button>
            <button 
              onClick={() => { setAuditLogs([]); setMetrics(m => ({ ...m, piiFound: [] })); }}
              className="glass flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase text-crimson/60 hover:text-crimson transition-colors border border-crimson/10"
            >
              <Trash2 size={12} /> Purge Buffer
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricsGrid 
          complianceScore={metrics.complianceScore}
          throughput={isActive ? metrics.throughput : 0}
          entropyReduction={metrics.entropyReduction}
        />

        {/* Live Stream Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-l-2 border-crimson pl-4">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Transformer Cluster 01</h3>
              <p className="text-xs text-white/20 font-mono mt-1">Status: {isActive ? 'TRANSFORMING' : 'READY'}</p>
            </div>
            <div className="text-[9px] font-mono text-white/20 bg-white/5 px-2 py-1 rounded">BUFFER_USAGE: {(auditLogs.length * 2).toFixed(1)}%</div>
          </div>
          <StreamTerminal 
            rawJson={lastRaw} 
            maskedJson={lastMasked || { status: 'Awaiting transformation...' }}
            latency={metrics.latency}
            piiFound={metrics.piiFound}
            config={maskingConfig}
            onConfigChange={setMaskingConfig}
          />
        </div>

        {/* Compliance Section */}
        <ComplianceVault logs={auditLogs} />
      </div>

      {/* Footer Decoration */}
      <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-white/10 uppercase tracking-[0.5em] pb-12">
        <div>AnonymX Distributed Engine • No-Log Architecture</div>
        <div className="flex gap-8">
          <span>GCC-REG-COMPLIANCE-882</span>
          <span>Zero-Trust Verified</span>
        </div>
      </footer>
    </main>
  );
}
