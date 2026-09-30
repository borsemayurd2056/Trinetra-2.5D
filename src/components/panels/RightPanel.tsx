import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Activity, Layers, Crosshair } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';
import { SystemStatusPanel } from './SystemStatusPanel';
import { ResolutionPanel } from './ResolutionPanel';
import { ObjectTrackerPanel } from './ObjectTrackerPanel';
import { ObjectInspector } from './ObjectInspector';
import { CellInspector } from './CellInspector';

export const RightPanel: React.FC = () => {
  const { selectedObject, selectedCell } = usePerception();
  const [activeTab, setActiveTab] = useState<'status' | 'resolution' | 'tracks'>('status');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto-switch view if an object or cell is selected
  const isInspecting = !!selectedObject || !!selectedCell;

  return (
    <aside
      className={`relative h-full transition-all duration-300 flex-shrink-0 z-20 flex ${
        isCollapsed ? 'w-0' : 'w-80 md:w-88'
      }`}
    >
      {/* Collapse / Expand Tab Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-14 bg-slate-900/90 border border-slate-700/80 border-r-0 rounded-l-md flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer z-30 shadow-lg"
        title={isCollapsed ? 'Expand Telemetry Panel' : 'Collapse Panel for Full 3D View'}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Panel Content Container */}
      <div
        className={`w-full h-full hud-panel border-l border-cyan-500/20 flex flex-col overflow-hidden transition-opacity ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Navigation Tabs Header */}
        {!isInspecting && (
          <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1 gap-1 flex-shrink-0">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-tech flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity size={12} />
              <span>STATUS</span>
            </button>

            <button
              onClick={() => setActiveTab('resolution')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-tech flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'resolution'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers size={12} />
              <span>A-FUSE</span>
            </button>

            <button
              onClick={() => setActiveTab('tracks')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-tech flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tracks'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Crosshair size={12} />
              <span>TRACKS</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {selectedObject ? (
            <ObjectInspector />
          ) : selectedCell ? (
            <CellInspector />
          ) : (
            <>
              {activeTab === 'status' && <SystemStatusPanel />}
              {activeTab === 'resolution' && <ResolutionPanel />}
              {activeTab === 'tracks' && <ObjectTrackerPanel />}
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
