import React from 'react';
import { Layers, CheckSquare, Square } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const ResolutionLegend: React.FC = () => {
  const { settings, updateSettings, telemetry } = usePerception();

  const items = [
    { label: '5 cm', name: 'Fine (Near / Refined)', color: '#00f0ff', count: telemetry.fineRegions },
    { label: '10 cm', name: 'Medium-Fine (Active)', color: '#10b981', count: telemetry.mediumFineRegions },
    { label: '25 cm', name: 'Medium (Mid-Range)', color: '#f59e0b', count: telemetry.mediumRegions },
    { label: '50 cm', name: 'Coarse (Far-Field)', color: '#8b5cf6', count: telemetry.coarseRegions },
  ];

  return (
    <div className="absolute bottom-20 left-4 z-10 p-3 rounded-lg hud-panel text-xs font-mono-tech border border-cyan-500/20 backdrop-blur-md w-64 shadow-xl">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wider text-[11px] uppercase">
          <Layers size={14} />
          <span>A-FUSE 2.5D Resolution</span>
        </div>
        <button
          onClick={() => updateSettings({ showGrid: !settings.showGrid })}
          className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
          title="Toggle Grid Overlay"
        >
          {settings.showGrid ? <CheckSquare size={13} className="text-cyan-400" /> : <Square size={13} />}
          <span className="text-[10px]">{settings.showGrid ? 'GRID ON' : 'GRID OFF'}</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shadow-sm inline-block flex-shrink-0"
                style={{ backgroundColor: it.color, boxShadow: `0 0 8px ${it.color}60` }}
              />
              <span className="font-bold text-slate-200">{it.label}</span>
              <span className="text-slate-400 text-[10px] truncate max-w-[90px]">{it.name}</span>
            </div>
            <span className="text-slate-400 text-[10px] font-mono-tech">{it.count}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Dynamic Refinement</span>
        </span>
        <span className="text-cyan-300 font-semibold">ACTIVE</span>
      </div>
    </div>
  );
};
