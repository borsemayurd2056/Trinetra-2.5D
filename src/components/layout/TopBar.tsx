import React from 'react';
import { Shield, Clock, Cpu, HardDrive, Database } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const TopBar: React.FC = () => {
  const {
    missionTime,
    telemetry,
    isStreaming,
    dataSource,
    setDataSource,
    activeDataset,
  } = usePerception();

  return (
    <header className="h-14 w-full bg-[#070a10]/95 border-b border-cyan-500/20 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* --- BRANDING & MISSION TITLE --- */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
          <Shield size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider text-slate-100 font-mono-tech">
              A-FUSE <span className="text-cyan-400">2.5D</span>
            </h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono-tech font-bold border border-cyan-500/40">
              PHASE 2
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono-tech hidden sm:block">
            Adaptive Variable-Resolution 2.5D LiDAR Perception
          </p>
        </div>
      </div>

      {/* --- DATA SOURCE SELECTOR (PHASE 2) --- */}
      <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
        <span className="text-[10px] font-mono-tech uppercase text-slate-400 font-bold ml-1.5 hidden md:inline">
          DATA SOURCE:
        </span>
        <button
          onClick={() => setDataSource('simulation')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono-tech transition-all cursor-pointer ${
            dataSource === 'simulation'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)] font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Switch to Synthetic 3D Simulation"
        >
          <Cpu size={12} />
          <span>SIMULATION</span>
        </button>

        <button
          onClick={() => setDataSource('recorded')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono-tech transition-all cursor-pointer ${
            dataSource === 'recorded'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Switch to Real Recorded LiDAR Dataset (.bin / .pcd / .ply)"
        >
          <Database size={12} />
          <span>RECORDED LiDAR</span>
        </button>
      </div>

      {/* --- MISSION STATUS TELEMETRY --- */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-mono-tech">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
          <Clock size={13} className="text-cyan-400" />
          <span className="text-slate-400 uppercase text-[10px]">Time</span>
          <span className="text-cyan-300 font-bold">{missionTime}</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
          <Cpu size={13} className="text-emerald-400" />
          <span className="text-slate-400 uppercase text-[10px]">Render</span>
          <span className="text-emerald-400 font-bold">{telemetry.actualFps} FPS</span>
        </div>
      </div>

      {/* --- SYSTEM STATE & CONNECTION --- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono-tech shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStreaming ? (dataSource === 'recorded' ? 'bg-emerald-400' : 'bg-cyan-400') : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isStreaming ? (dataSource === 'recorded' ? 'bg-emerald-500' : 'bg-cyan-500') : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-bold text-slate-200 tracking-wide text-[11px]">
            {dataSource === 'recorded' ? 'RECORDED STREAM' : isStreaming ? 'SIMULATION LIVE' : 'STREAM PAUSED'}
          </span>
        </div>

        {dataSource === 'recorded' && activeDataset && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono-tech text-emerald-400 px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">
            <HardDrive size={13} />
            <span className="text-[10px] font-bold uppercase">{activeDataset.format} DATASET</span>
          </div>
        )}
      </div>
    </header>
  );
};
