import React from 'react';
import { Compass } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const CompassRose: React.FC = () => {
  const { egoVehicle } = usePerception();
  const headingDeg = Math.round(((-egoVehicle.heading * 180) / Math.PI + 360) % 360);

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-3 px-3 py-2 rounded-lg hud-panel text-xs font-mono-tech border border-cyan-500/20 backdrop-blur-md">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <Compass
          size={24}
          className="text-cyan-400 transition-transform duration-200"
          style={{ transform: `rotate(${headingDeg}deg)` }}
        />
        <div className="absolute -top-1 text-[8px] font-bold text-cyan-300">N</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">UGV Heading</div>
        <div className="text-cyan-300 font-bold">{headingDeg}° TRUE</div>
      </div>
      <div className="h-6 w-px bg-slate-700 mx-1" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Position</div>
        <div className="text-slate-200">
          X:{egoVehicle.position[0].toFixed(1)} Y:{egoVehicle.position[1].toFixed(1)}
        </div>
      </div>
    </div>
  );
};
