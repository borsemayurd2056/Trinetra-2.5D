import React from 'react';
import { Crosshair, User, Car, Bike, ShieldAlert } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';
import { DetectedObject, ObjectType } from '../../types/perception';

export const ObjectTrackerPanel: React.FC = () => {
  const { objects, selectedObject, setSelectedObject, setFocusTarget } = usePerception();

  const vehicles = objects.filter((o) => o.type === 'vehicle');
  const pedestrians = objects.filter((o) => o.type === 'pedestrian');
  const cyclists = objects.filter((o) => o.type === 'cyclist');
  const obstacles = objects.filter((o) => o.type === 'static_obstacle');

  const getIcon = (type: ObjectType) => {
    switch (type) {
      case 'vehicle':
        return <Car size={13} className="text-cyan-400" />;
      case 'pedestrian':
        return <User size={13} className="text-amber-400" />;
      case 'cyclist':
        return <Bike size={13} className="text-emerald-400" />;
      case 'static_obstacle':
      default:
        return <ShieldAlert size={13} className="text-rose-400" />;
    }
  };

  const handleSelect = (obj: DetectedObject) => {
    setSelectedObject(obj);
    setFocusTarget(obj.position);
  };

  return (
    <div className="space-y-3">
      {/* Category Counts Header */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2 font-semibold tracking-wider uppercase">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Crosshair size={13} />
            Detected Objects ({objects.length})
          </span>
          <span className="text-[10px] text-slate-400">Active Tracks</span>
        </div>

        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono-tech">
          <div className="p-1.5 rounded bg-slate-900/70 border border-slate-800 text-center">
            <div className="text-slate-400 text-[9px]">VEH</div>
            <div className="text-cyan-300 font-bold">{vehicles.length}</div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/70 border border-slate-800 text-center">
            <div className="text-slate-400 text-[9px]">PED</div>
            <div className="text-amber-300 font-bold">{pedestrians.length}</div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/70 border border-slate-800 text-center">
            <div className="text-slate-400 text-[9px]">CYC</div>
            <div className="text-emerald-300 font-bold">{cyclists.length}</div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/70 border border-slate-800 text-center">
            <div className="text-slate-400 text-[9px]">OBS</div>
            <div className="text-rose-300 font-bold">{obstacles.length}</div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
        {objects.map((obj) => {
          const isSelected = selectedObject?.id === obj.id;
          return (
            <div
              key={obj.id}
              onClick={() => handleSelect(obj)}
              className={`p-2 rounded text-xs font-mono-tech cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-400/80 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  {getIcon(obj.type)}
                  <span>{obj.id}</span>
                  <span className="text-[10px] font-normal text-slate-400 uppercase">
                    {obj.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      obj.dynamic
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {obj.state}
                  </span>
                  <span className="text-cyan-300 font-bold">{obj.distance}m</span>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Speed: {obj.speed > 0 ? `${obj.speed.toFixed(1)} m/s` : '0 m/s'}</span>
                <span>Conf: {(obj.confidence * 100).toFixed(0)}%</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      obj.resolution === 0.05
                        ? '#00f0ff'
                        : obj.resolution === 0.10
                        ? '#10b981'
                        : '#f59e0b',
                  }}
                >
                  {(obj.resolution * 100).toFixed(0)}cm Res
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
