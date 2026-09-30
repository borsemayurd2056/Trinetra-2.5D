import React from 'react';
import {
  Radar,
  Layers,
  Crosshair,
  Mountain,
  Activity,
  BarChart3,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';
import { PageId } from '../../types/navigation';

export const LeftNav: React.FC = () => {
  const { activePage, setActivePage, objects } = usePerception();

  const navItems: {
    id: PageId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'live-perception',
      label: 'Live Perception',
      icon: <Radar size={18} />,
      badge: 'LIVE',
      badgeColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40',
    },
    {
      id: 'adaptive-map',
      label: 'Adaptive 2.5D Map',
      icon: <Layers size={18} />,
      badge: '2.5D',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
    },
    {
      id: 'dynamic-objects',
      label: 'Dynamic Objects',
      icon: <Crosshair size={18} />,
      badge: `${objects.length}`,
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-500/40',
    },
    {
      id: 'terrain-analysis',
      label: 'Terrain Analysis',
      icon: <Mountain size={18} />,
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity size={18} />,
    },
    {
      id: 'benchmark',
      label: 'Benchmark',
      icon: <BarChart3 size={18} />,
      badge: 'SIM',
      badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-500/40',
    },
    {
      id: 'replay',
      label: 'Replay Buffer',
      icon: <RotateCcw size={18} />,
    },
    {
      id: 'settings',
      label: 'Sensor Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <nav className="w-60 bg-[#070a10]/95 border-r border-cyan-500/20 flex flex-col justify-between p-3 select-none backdrop-blur-md z-20 flex-shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] font-mono-tech uppercase text-slate-400 px-3 py-1 font-semibold tracking-wider">
          Perception Views
        </div>

        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                    item.badgeColor || 'text-slate-300 bg-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Defense / Robotics Spec Footer */}
      <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono-tech text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>PIPELINE:</span>
          <span className="text-cyan-400 font-bold">A-FUSE v1.0</span>
        </div>
        <div className="flex justify-between">
          <span>SPATIAL MODEL:</span>
          <span className="text-slate-300">2.5D Adaptive</span>
        </div>
        <div className="flex justify-between">
          <span>CORE ENGINE:</span>
          <span className="text-emerald-400 font-bold">R3F / THREE.JS</span>
        </div>
      </div>
    </nav>
  );
};
