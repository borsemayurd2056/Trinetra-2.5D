import React from 'react';
import { X, Grid, Mountain, ArrowUpRight, HelpCircle } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const CellInspector: React.FC = () => {
  const { selectedCell, setSelectedCell } = usePerception();

  if (!selectedCell) return null;

  const { explainability } = selectedCell;

  const getTraversabilityBadge = (trav: string) => {
    switch (trav) {
      case 'HIGH':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'CAUTION':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'LOW':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/40';
      case 'IMPASSABLE':
      default:
        return 'bg-rose-950/80 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-3 font-mono-tech text-xs">
      {/* --- CELL TELEMETRY CARD --- */}
      <div className="p-3.5 rounded-lg hud-panel-elevated border border-cyan-400/50 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Grid size={15} className="text-cyan-400" />
            <span className="font-bold text-cyan-300 text-sm tracking-wide">
              CELL [{selectedCell.x.toFixed(0)}, {selectedCell.y.toFixed(0)}]
            </span>
          </div>
          <button
            onClick={() => setSelectedCell(null)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/80 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Resolution</span>
            <span
              className="font-bold px-2 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor:
                  selectedCell.resolution === 0.05
                    ? 'rgba(0,240,255,0.15)'
                    : selectedCell.resolution === 0.10
                    ? 'rgba(16,185,129,0.15)'
                    : selectedCell.resolution === 0.25
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(99,102,241,0.15)',
                color:
                  selectedCell.resolution === 0.05
                    ? '#00f0ff'
                    : selectedCell.resolution === 0.10
                    ? '#10b981'
                    : selectedCell.resolution === 0.25
                    ? '#f59e0b'
                    : '#818cf8',
              }}
            >
              {(selectedCell.resolution * 100).toFixed(0)} cm
              {selectedCell.isRefinedLocally ? ' (LOCAL REFINED)' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mountain size={12} /> Elevation
            </span>
            <span className="text-slate-200 font-bold">{selectedCell.elevation} m</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Slope</span>
            <span className="text-slate-200">{selectedCell.slope}°</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Roughness</span>
            <span className="text-slate-200">{selectedCell.roughness}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Occupancy</span>
            <span className="text-slate-200 font-bold">{selectedCell.occupancy}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Semantic Class</span>
            <span className="text-cyan-300 font-semibold">{selectedCell.semanticClass}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Confidence</span>
            <span className="text-emerald-400 font-bold">
              {(selectedCell.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Dynamic Activity</span>
            <span className={selectedCell.dynamicProbability > 0.3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {selectedCell.dynamicProbability > 0.3 ? `YES (${selectedCell.dynamicProbability})` : 'NO'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Traversability</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTraversabilityBadge(
                selectedCell.traversability
              )}`}
            >
              {selectedCell.traversability}
            </span>
          </div>
        </div>
      </div>

      {/* --- EXPLAINABLE ADAPTIVE RESOLUTION PANEL --- */}
      <div className="p-3.5 rounded-lg hud-panel-elevated border border-amber-500/40 space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-amber-500/30">
          <HelpCircle size={15} className="text-amber-400" />
          <span className="font-bold text-amber-300 text-sm tracking-wide">
            EXPLAINABILITY: WHY {(selectedCell.resolution * 100).toFixed(0)} cm?
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Distance Factor</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${explainability.distanceFactor * 100}%` }}
                />
              </div>
              <span className="text-slate-200 w-8 text-right">{explainability.distanceFactor}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Dynamic Activity</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${explainability.dynamicActivity * 100}%` }}
                />
              </div>
              <span className="text-slate-200 w-8 text-right">{explainability.dynamicActivity}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Terrain Complexity</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-400"
                  style={{ width: `${explainability.terrainComplexity * 100}%` }}
                />
              </div>
              <span className="text-slate-200 w-8 text-right">{explainability.terrainComplexity}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Risk Score</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-400"
                  style={{ width: `${explainability.risk * 100}%` }}
                />
              </div>
              <span className="text-slate-200 w-8 text-right">{explainability.risk}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Uncertainty</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${explainability.uncertainty * 100}%` }}
                />
              </div>
              <span className="text-slate-200 w-8 text-right">{explainability.uncertainty}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
            <ArrowUpRight size={11} className="text-amber-400" /> A-FUSE FUSION DECISION
          </div>
          <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-200 font-bold text-xs mb-1">
            {explainability.decision}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {explainability.decisionReason}
          </p>
        </div>
      </div>
    </div>
  );
};
