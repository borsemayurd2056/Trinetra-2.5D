import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const ResolutionPanel: React.FC = () => {
  const { telemetry } = usePerception();

  const total =
    telemetry.fineRegions +
    telemetry.mediumFineRegions +
    telemetry.mediumRegions +
    telemetry.coarseRegions;

  const pctFine = ((telemetry.fineRegions / total) * 100).toFixed(1);
  const pctMedFine = ((telemetry.mediumFineRegions / total) * 100).toFixed(1);
  const pctMed = ((telemetry.mediumRegions / total) * 100).toFixed(1);
  const pctCoarse = ((telemetry.coarseRegions / total) * 100).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 font-semibold tracking-wider uppercase">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Layers size={13} />
          Adaptive Resolution
        </span>
        <span className="text-slate-400 text-[10px]">{total} Active Cells</span>
      </div>

      {/* Proportional Segmented Bar */}
      <div className="h-3 w-full rounded bg-slate-900 overflow-hidden flex border border-slate-800">
        <div style={{ width: `${pctFine}%` }} className="bg-cyan-400" title={`5cm: ${pctFine}%`} />
        <div style={{ width: `${pctMedFine}%` }} className="bg-emerald-400" title={`10cm: ${pctMedFine}%`} />
        <div style={{ width: `${pctMed}%` }} className="bg-amber-400" title={`25cm: ${pctMed}%`} />
        <div style={{ width: `${pctCoarse}%` }} className="bg-indigo-500" title={`50cm: ${pctCoarse}%`} />
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-1.5 text-xs font-mono-tech">
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-cyan-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="text-cyan-300 font-bold">5 cm</span>
            <span className="text-slate-400 text-[10px]">Fine (Near / Refined)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-200 font-bold">{telemetry.fineRegions}</span>
            <span className="text-[10px] text-slate-400 ml-1.5">({pctFine}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-emerald-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-emerald-300 font-bold">10 cm</span>
            <span className="text-slate-400 text-[10px]">Medium-Fine (Active)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-200 font-bold">{telemetry.mediumFineRegions}</span>
            <span className="text-[10px] text-slate-400 ml-1.5">({pctMedFine}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-amber-300 font-bold">25 cm</span>
            <span className="text-slate-400 text-[10px]">Medium (Mid-Range)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-200 font-bold">{telemetry.mediumRegions}</span>
            <span className="text-[10px] text-slate-400 ml-1.5">({pctMed}% )</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-indigo-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
            <span className="text-indigo-300 font-bold">50 cm</span>
            <span className="text-slate-400 text-[10px]">Coarse (Far Field)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-200 font-bold">{telemetry.coarseRegions}</span>
            <span className="text-[10px] text-slate-400 ml-1.5">({pctCoarse}%)</span>
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-start gap-2">
        <Sparkles size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">A-FUSE Refinement Rule:</span> Distant actors and high-risk terrain trigger local 5cm/10cm refinement cells independently of distance.
        </div>
      </div>
    </div>
  );
};
