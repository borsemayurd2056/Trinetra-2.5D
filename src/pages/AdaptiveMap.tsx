import React, { useState } from 'react';
import { Layers, Eye, Filter, Sparkles, BarChart2, Info, AlertCircle } from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';
import type { ResolutionLevel } from '../types/perception';

export const AdaptiveMap: React.FC = () => {
  const {
    cells,
    telemetry,
    setCameraMode,
    setVisualizationMode,
    dataSource,
    setDataSource,
  } = usePerception();

  const [filterRes, setFilterRes] = useState<ResolutionLevel | 'all' | 'refined'>('all');

  const filteredCells = cells.filter((c) => {
    if (filterRes === 'all') return true;
    if (filterRes === 'refined') return c.isRefinedLocally;
    return c.resolution === filterRes;
  });

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Banner & Quick Controls */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="space-y-2 max-w-md">
          {dataSource === 'recorded' && (
            <div className="hud-panel p-3 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-200 text-xs font-mono-tech flex items-start gap-2.5">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <div className="font-bold text-amber-300">RAW RECORDED LiDAR ACTIVE (PHASE 2)</div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Adaptive variable-resolution quadtree mesh generation on raw recorded point clouds will be activated in Phase 3. The cells shown below are from the baseline spatial registry. Switch to SIMULATION to test dynamic adaptive splitting.
                </p>
                <button
                  onClick={() => setDataSource('simulation')}
                  className="mt-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Switch to SIMULATION Mode
                </button>
              </div>
            </div>
          )}

          <div className="hud-panel p-3 rounded-lg border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 font-mono-tech font-bold text-sm">
              <Layers size={16} />
              <span>ADAPTIVE VARIABLE-RESOLUTION 2.5D MAP</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Multi-criterion spatial representation concentrating compute precision (5cm / 10cm) on dynamic actors and hazardous terrain while preserving coarse 50cm representation on benign open ground.
            </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                setCameraMode('top');
                setVisualizationMode('resolution');
              }}
              className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono-tech flex items-center gap-1.5 hover:bg-emerald-900 cursor-pointer"
            >
              <Eye size={12} />
              <span>Align Top-Down 2.5D</span>
            </button>
            <button
              onClick={() => setVisualizationMode('resolution')}
              className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-tech flex items-center gap-1.5 hover:bg-cyan-900 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Resolution Layer</span>
            </button>
          </div>
        </div>
        </div>

        {/* Filter Pills */}
        <div className="hud-panel p-2 rounded-lg border border-slate-700 flex items-center gap-1.5 text-xs font-mono-tech pointer-events-auto">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
            <Filter size={12} /> Filter:
          </span>
          <button
            onClick={() => setFilterRes('all')}
            className={`px-2 py-1 rounded cursor-pointer ${
              filterRes === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({cells.length})
          </button>
          <button
            onClick={() => setFilterRes(0.05)}
            className={`px-2 py-1 rounded cursor-pointer ${
              filterRes === 0.05
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5cm ({telemetry.fineRegions})
          </button>
          <button
            onClick={() => setFilterRes(0.10)}
            className={`px-2 py-1 rounded cursor-pointer ${
              filterRes === 0.10
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10cm ({telemetry.mediumFineRegions})
          </button>
          <button
            onClick={() => setFilterRes(0.25)}
            className={`px-2 py-1 rounded cursor-pointer ${
              filterRes === 0.25
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25cm ({telemetry.mediumRegions})
          </button>
          <button
            onClick={() => setFilterRes('refined')}
            className={`px-2 py-1 rounded cursor-pointer flex items-center gap-1 ${
              filterRes === 'refined'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={11} />
            <span>Refined</span>
          </button>
        </div>
      </div>

      {/* Bottom Cell Telemetry Bar */}
      <div className="flex items-end justify-between pointer-events-auto">
        <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 max-w-md w-full">
          <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <BarChart2 size={13} />
              CELL STATS ({filteredCells.length} VISIBLE)
            </span>
            <span className="text-slate-400 text-[10px]">Click any 3D cell to inspect</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-tech">
            <div className="p-1.5 rounded bg-slate-900/60 border border-cyan-900/40">
              <div className="text-[10px] text-slate-400">5cm Cells</div>
              <div className="text-cyan-300 font-bold">{telemetry.fineRegions}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-emerald-900/40">
              <div className="text-[10px] text-slate-400">10cm Cells</div>
              <div className="text-emerald-300 font-bold">{telemetry.mediumFineRegions}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-amber-900/40">
              <div className="text-[10px] text-slate-400">25cm Cells</div>
              <div className="text-amber-300 font-bold">{telemetry.mediumRegions}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-indigo-900/40">
              <div className="text-[10px] text-slate-400">50cm Cells</div>
              <div className="text-indigo-300 font-bold">{telemetry.coarseRegions}</div>
            </div>
          </div>
        </div>

        <div className="hud-panel p-2.5 rounded-lg border border-slate-700 text-xs font-mono-tech text-slate-400 flex items-center gap-2">
          <Info size={14} className="text-cyan-400 flex-shrink-0" />
          <span>Representation: 2.5D Heightfield Elevation + Dynamic Attributes</span>
        </div>
      </div>
    </div>
  );
};
