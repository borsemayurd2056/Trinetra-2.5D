import React from 'react';
import {
  Sparkles,
  Mountain,
  Tag,
  Flame,
  Shield,
  Layers,
  Radar,
  Box,
  Hash,
  Footprints,
} from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';
import type { VisualizationMode } from '../../types/perception';

export const BottomControls: React.FC = () => {
  const {
    visualizationMode,
    setVisualizationMode,
    settings,
    updateSettings,
  } = usePerception();

  const layers: { id: VisualizationMode; label: string; icon: React.ReactNode }[] = [
    { id: 'lidar', label: 'LiDAR', icon: <Radar size={13} /> },
    { id: 'semantic', label: 'Semantic', icon: <Tag size={13} /> },
    { id: 'elevation', label: 'Elevation', icon: <Mountain size={13} /> },
    { id: 'dynamic', label: 'Dynamic', icon: <Flame size={13} /> },
    { id: 'traversability', label: 'Traversability', icon: <Shield size={13} /> },
    { id: 'confidence', label: 'Confidence', icon: <Sparkles size={13} /> },
    { id: 'resolution', label: 'Resolution', icon: <Layers size={13} /> },
  ];

  return (
    <footer className="h-14 w-full bg-[#070a10]/95 border-t border-cyan-500/20 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md overflow-x-auto gap-4">
      {/* --- VISUALIZATION LAYER SELECTOR --- */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] font-mono-tech uppercase text-slate-400 font-bold mr-1 hidden sm:inline">
          Layer:
        </span>
        {layers.map((layer) => {
          const isActive = visualizationMode === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setVisualizationMode(layer.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              {layer.icon}
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-6 w-px bg-slate-800 flex-shrink-0" />

      {/* --- QUICK DISPLAY TOGGLES --- */}
      <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-mono-tech">
        <button
          onClick={() => updateSettings({ showPoints: !settings.showPoints })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showPoints
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle LiDAR Point Cloud"
        >
          <Radar size={12} />
          <span>Points</span>
        </button>

        <button
          onClick={() => updateSettings({ showGrid: !settings.showGrid })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showGrid
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle 2.5D Adaptive Grid"
        >
          <Layers size={12} />
          <span>Grid</span>
        </button>

        <button
          onClick={() => updateSettings({ showBoundingBoxes: !settings.showBoundingBoxes })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showBoundingBoxes
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle 3D Bounding Boxes"
        >
          <Box size={12} />
          <span>Boxes</span>
        </button>

        <button
          onClick={() => updateSettings({ showLabels: !settings.showLabels })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showLabels
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle Object Labels"
        >
          <Hash size={12} />
          <span>Labels</span>
        </button>

        <button
          onClick={() => updateSettings({ showTrails: !settings.showTrails })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showTrails
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle Motion Trails"
        >
          <Footprints size={12} />
          <span>Trails</span>
        </button>

        <button
          onClick={() => updateSettings({ showScanBeam: !settings.showScanBeam })}
          className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all ${
            settings.showScanBeam
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
          }`}
          title="Toggle Rotating Scanning Beam"
        >
          <Radar size={12} />
          <span>Beam</span>
        </button>
      </div>
    </footer>
  );
};
