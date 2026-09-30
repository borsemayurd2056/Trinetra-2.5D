import React from 'react';
import { X, Crosshair, Navigation, Gauge, ShieldCheck, Eye } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const ObjectInspector: React.FC = () => {
  const { selectedObject, setSelectedObject, setFocusTarget } = usePerception();

  if (!selectedObject) return null;

  const directionStr =
    Math.abs(selectedObject.velocity[0]) > Math.abs(selectedObject.velocity[1])
      ? selectedObject.velocity[0] > 0
        ? '+X (East)'
        : '-X (West)'
      : selectedObject.velocity[1] > 0
      ? '+Y (North)'
      : '-Y (South)';

  return (
    <div className="p-3.5 rounded-lg hud-panel-elevated border border-cyan-400/50 space-y-3 font-mono-tech text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-bold text-cyan-300 text-sm tracking-wide">
            OBJECT #{selectedObject.id.replace('OBJ-', '')}
          </span>
        </div>
        <button
          onClick={() => setSelectedObject(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/80 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Class</span>
          <span className="text-cyan-300 font-bold uppercase">{selectedObject.type}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">State</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedObject.dynamic
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {selectedObject.state}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Navigation size={12} /> Distance
          </span>
          <span className="text-slate-200 font-bold">{selectedObject.distance} m</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Gauge size={12} /> Velocity
          </span>
          <span className="text-emerald-400 font-bold">{selectedObject.speed.toFixed(1)} m/s</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Direction</span>
          <span className="text-slate-200">{directionStr}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={12} /> Confidence
          </span>
          <span className="text-cyan-300 font-bold">
            {(selectedObject.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Resolution</span>
          <span
            className="font-bold px-2 py-0.5 rounded text-[10px]"
            style={{
              backgroundColor:
                selectedObject.resolution === 0.05
                  ? 'rgba(0,240,255,0.15)'
                  : 'rgba(16,185,129,0.15)',
              color:
                selectedObject.resolution === 0.05
                  ? '#00f0ff'
                  : '#10b981',
              border: `1px solid ${
                selectedObject.resolution === 0.05
                  ? 'rgba(0,240,255,0.4)'
                  : 'rgba(16,185,129,0.4)'
              }`,
            }}
          >
            {(selectedObject.resolution * 100).toFixed(0)} cm (A-FUSE Refined)
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-400">Footprint</span>
          <span className="text-slate-300 text-[11px]">
            {selectedObject.dimensions[0]}m × {selectedObject.dimensions[1]}m × {selectedObject.dimensions[2]}m
          </span>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          onClick={() => {
            setFocusTarget(selectedObject.position);
          }}
          className="flex-1 py-1.5 px-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Eye size={13} />
          <span>Focus Camera</span>
        </button>
        <button
          onClick={() => setSelectedObject(null)}
          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
