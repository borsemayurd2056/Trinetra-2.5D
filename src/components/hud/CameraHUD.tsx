import React from 'react';
import { Video, Eye, Compass, RotateCcw, Crosshair, Navigation } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';
import type { CameraMode } from '../../types/perception';

export const CameraHUD: React.FC = () => {
  const { cameraMode, setCameraMode, setFocusTarget } = usePerception();

  const modes: { id: CameraMode; label: string; icon: React.ReactNode }[] = [
    { id: 'orbit', label: 'Orbit', icon: <Compass size={14} /> },
    { id: 'follow', label: 'Follow UGV', icon: <Crosshair size={14} /> },
    { id: 'top', label: 'Top-Down 2.5D', icon: <Eye size={14} /> },
    { id: 'firstPerson', label: 'Sensor POV', icon: <Video size={14} /> },
    { id: 'free', label: 'Free Fly', icon: <Navigation size={14} /> },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-lg hud-panel text-xs font-mono-tech border border-cyan-500/20 backdrop-blur-md">
      {modes.map((m) => {
        const isActive = cameraMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setCameraMode(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.25)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        );
      })}

      <div className="h-4 w-px bg-slate-700 mx-1" />

      <button
        onClick={() => {
          setCameraMode('orbit');
          setFocusTarget([0, 0, 0]);
        }}
        title="Reset Camera Target"
        className="flex items-center gap-1 px-2 py-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 cursor-pointer"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};
