import React, { useState } from 'react';
import { BarChart3, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BENCHMARK_COMPARISONS } from '../services/mockDataGenerator';
import type { BenchmarkComparison } from '../types/perception';

export const Benchmark: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<BenchmarkComparison>(
    BENCHMARK_COMPARISONS[3] // Default to A-FUSE
  );

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between overflow-y-auto">
      {/* Top Banner with Strict Disclaimer */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="hud-panel p-3.5 rounded-lg border border-purple-500/40 max-w-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-purple-400 font-mono-tech font-bold text-sm">
            <BarChart3 size={16} />
            <span>ALGORITHMIC BENCHMARK & ARCHITECTURAL COMPARISON</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Comparative evaluation of variable-resolution 2.5D representations against standard baseline grids in dynamic UGV scenarios.
          </p>

          {/* CRITICAL SIMULATED DATA DISCLAIMER */}
          <div className="mt-2.5 p-2 rounded bg-amber-950/60 border border-amber-500/50 flex items-center gap-2 text-xs font-mono-tech text-amber-300">
            <AlertOctagon size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider">DEMO / SIMULATED DATA:</span> Values presented in this Phase 1 benchmark are simulated estimates for architectural design. Physical hardware empirical measurements will be conducted in Phase 4.
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Section */}
      <div className="pointer-events-auto max-w-4xl w-full my-auto space-y-4">
        {/* Algorithm Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {BENCHMARK_COMPARISONS.map((algo) => {
            const isSelected = selectedAlgo.name === algo.name;
            const isAfuse = algo.name.includes('A-FUSE');
            return (
              <div
                key={algo.name}
                onClick={() => setSelectedAlgo(algo)}
                className={`p-3 rounded-lg hud-panel cursor-pointer transition-all border text-xs font-mono-tech ${
                  isSelected
                    ? isAfuse
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'border-purple-400 bg-purple-950/60'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100">{algo.name}</div>
                  {isAfuse && (
                    <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      PROPOSED
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{algo.resolutionLabel}</div>

                <div className="mt-3 space-y-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Sim. FPS:</span>
                    <span className="text-cyan-300 font-bold">{algo.fps}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Latency:</span>
                    <span className="text-emerald-400 font-bold">{algo.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Memory:</span>
                    <span className="text-amber-300 font-bold">{algo.memoryMb} MB</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-purple-300 font-bold">{algo.perceptionAccuracy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Algorithm Deep-Dive Panel */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 text-xs font-mono-tech space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-cyan-400 font-bold text-sm">{selectedAlgo.name}</span>
              <span className="text-slate-400 text-xs ml-2">({selectedAlgo.resolutionLabel})</span>
            </div>
            <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30">
              SIMULATED PROFILE
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[12px]">
            {selectedAlgo.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={13} /> Architectural Advantages
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed">{selectedAlgo.pros}</div>
            </div>

            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/30">
              <div className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                <ShieldAlert size={13} /> Trade-offs & Limitations
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed">{selectedAlgo.cons}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="hud-panel p-2.5 rounded-lg border border-slate-800 max-w-4xl w-full flex items-center justify-between pointer-events-auto text-xs font-mono-tech">
        <span className="text-slate-400">
          Spatial Scheme: <strong className="text-slate-200">2.5D Elevation Grid with Local Refinement</strong>
        </span>
        <span className="text-amber-400 font-bold">
          STATUS: SIMULATED BASELINE FOR DESIGN VALIDATION
        </span>
      </div>
    </div>
  );
};
