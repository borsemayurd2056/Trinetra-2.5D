import React from 'react';
import { Mountain, Sliders, CheckCircle, AlertCircle } from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';
import { SIMULATED_TERRAIN_STATS } from '../services/mockDataGenerator';

export const TerrainAnalysis: React.FC = () => {
  const { visualizationMode, setVisualizationMode, dataSource, setDataSource } = usePerception();

  const stats = SIMULATED_TERRAIN_STATS;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Analysis HUD */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="space-y-2 max-w-md">
          {dataSource === 'recorded' && (
            <div className="hud-panel p-3 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-200 text-xs font-mono-tech flex items-start gap-2.5">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <div className="font-bold text-amber-300">TERRAIN & TRAVERSABILITY (AI CLASSIFIER: PHASE 3)</div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Ground plane extraction, slope estimation, and traversability costmap synthesis on recorded LiDAR point clouds will be activated in Phase 3. Switch to SIMULATION to test simulated slope and elevation analysis.
                </p>
                <button
                  onClick={() => setDataSource('simulation')}
                  className="mt-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Switch to SIMULATION Mode
                </button>
              </div>
            </div>
          )}

          <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-400 font-mono-tech font-bold text-sm">
              <Mountain size={16} />
              <span>3D TERRAIN & TRAVERSABILITY ANALYSIS</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Multi-spectral ground analysis assessing elevation variations, surface gradient slope, micro-roughness, obstacle clearance, and traversability safety corridors.
            </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setVisualizationMode('elevation')}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech cursor-pointer transition-all ${
                visualizationMode === 'elevation'
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Elevation Heatmap
            </button>
            <button
              onClick={() => setVisualizationMode('traversability')}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech cursor-pointer transition-all ${
                visualizationMode === 'traversability'
                  ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Traversability Corridor
            </button>
            <button
              onClick={() => setVisualizationMode('semantic')}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech cursor-pointer transition-all ${
                visualizationMode === 'semantic'
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Semantic Ground
            </button>
          </div>
        </div>
        </div>

        {/* Hazard Safety Level Card */}
        <div className="hud-panel p-3 rounded-lg border border-emerald-500/40 text-xs font-mono-tech text-emerald-300 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>UGV NAV STATUS: PASSABLE</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Road corridor verified safe with 0 impassable blockages.
          </div>
        </div>
      </div>

      {/* Bottom Floating Terrain Metrics Panel */}
      <div className="pointer-events-auto max-w-xl w-full">
        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono-tech">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Sliders size={13} />
              TERRAIN TOPOGRAPHY STATISTICS (SIMULATED)
            </span>
            <span className="text-slate-400 text-[10px]">120m × 120m Sector</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Average Slope</div>
              <div className="text-slate-200 font-bold text-sm">{stats.averageSlope}°</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Max Slope</div>
              <div className="text-amber-400 font-bold text-sm">{stats.maxSlope}°</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Mean Roughness</div>
              <div className="text-slate-200 font-bold text-sm">{stats.averageRoughness}</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Traversable Area</div>
              <div className="text-emerald-400 font-bold text-sm">{stats.traversableAreaPercent}%</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">High-Risk Zones</div>
              <div className="text-rose-400 font-bold text-sm">{stats.highRiskAreaCount} Areas</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Road Corridor</div>
              <div className="text-cyan-300 font-bold text-sm">{stats.roadCoveragePercent}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
