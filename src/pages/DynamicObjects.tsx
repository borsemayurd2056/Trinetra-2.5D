import React from 'react';
import { Crosshair, Eye, Flame, AlertTriangle, AlertCircle } from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';
import type { DetectedObject } from '../types/perception';

export const DynamicObjects: React.FC = () => {
  const {
    objects,
    selectedObject,
    setSelectedObject,
    setFocusTarget,
    setVisualizationMode,
    dataSource,
    setDataSource,
  } = usePerception();

  const dynamicObjects = objects.filter((o) => o.dynamic);
  const hazards = dynamicObjects.filter((o) => o.distance < 15.0);

  const handleFocus = (obj: DetectedObject) => {
    setSelectedObject(obj);
    setFocusTarget(obj.position);
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Tracking Header */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="space-y-2 max-w-md">
          {dataSource === 'recorded' && (
            <div className="hud-panel p-3 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-200 text-xs font-mono-tech flex items-start gap-2.5">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <div className="font-bold text-amber-300">RAW RECORDED POINT CLOUD (AI DETECTION: PHASE 3)</div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  3D oriented bounding boxes, dynamic entity velocity classification, and Kalman tracking on real LiDAR point clouds are scheduled for Phase 3. The raw points are currently rendered in the 3D viewport.
                </p>
                <button
                  onClick={() => setDataSource('simulation')}
                  className="mt-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Switch to SIMULATION to view 3D Trackers
                </button>
              </div>
            </div>
          )}

          <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-400 font-mono-tech font-bold text-sm">
              <Crosshair size={16} />
              <span>DYNAMIC OBJECT TRACKING & TRAJECTORIES</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Continuous Kalman filter multi-object tracking. Visualizing 3D bounding envelopes, velocity vectors, historical breadcrumbs, and 3-second predictive corridors.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => setVisualizationMode('dynamic')}
                className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono-tech flex items-center gap-1.5 hover:bg-amber-900 cursor-pointer"
              >
                <Flame size={12} />
                <span>Highlight Dynamic Actors</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hazard Alert Banner */}
        {hazards.length > 0 && (
          <div className="hud-panel-elevated p-2.5 rounded-lg border border-amber-500/50 flex items-center gap-2 text-xs font-mono-tech text-amber-300 pointer-events-auto">
            <AlertTriangle size={15} className="text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold">PROXIMITY WARNING:</span>{' '}
              <span>{hazards.length} dynamic actor(s) within 15m radius</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Interactive Track Matrix */}
      <div className="pointer-events-auto max-w-3xl w-full">
        <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono-tech">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Crosshair size={13} />
              ACTIVE TRACKS TABLE ({dynamicObjects.length} TRACKED)
            </span>
            <span className="text-slate-400 text-[10px]">Click row to focus camera</span>
          </div>

          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono-tech">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 text-[10px] uppercase">
                  <th className="pb-1.5 pl-1">Track ID</th>
                  <th className="pb-1.5">Type</th>
                  <th className="pb-1.5">Velocity</th>
                  <th className="pb-1.5">Distance</th>
                  <th className="pb-1.5">Confidence</th>
                  <th className="pb-1.5">A-FUSE Res</th>
                  <th className="pb-1.5 text-right pr-1">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dynamicObjects.map((obj) => {
                  const isSelected = selectedObject?.id === obj.id;
                  return (
                    <tr
                      key={obj.id}
                      onClick={() => handleFocus(obj)}
                      className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/60 text-cyan-200' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-1.5 pl-1 font-bold text-cyan-400">#{obj.id.split('-')[1]}</td>
                      <td className="py-1.5 uppercase font-medium">{obj.type}</td>
                      <td className="py-1.5 text-emerald-400 font-bold">{obj.speed.toFixed(1)} m/s</td>
                      <td className="py-1.5">{obj.distance} m</td>
                      <td className="py-1.5 text-cyan-300">{(obj.confidence * 100).toFixed(0)}%</td>
                      <td className="py-1.5 font-bold" style={{ color: obj.resolution === 0.05 ? '#00f0ff' : '#10b981' }}>
                        {(obj.resolution * 100).toFixed(0)}cm
                      </td>
                      <td className="py-1.5 text-right pr-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocus(obj);
                          }}
                          className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] text-cyan-300 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={10} /> Focus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
