import React from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Layers,
  Eye,
  Activity,
  RotateCcw,
  Check,
  Database,
  Filter,
} from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';
import type { CoordinatePreset } from '../types/lidar';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    dataSource,
    setDataSource,
    preprocessingConfig,
    updatePreprocessingConfig,
    availableDatasets,
    activeDataset,
    selectDataset,
  } = usePerception();

  const handleResetDefaults = () => {
    updateSettings({
      maxRange: 75,
      pointSize: 2.2,
      pointDensity: 1.0,
      scanFrequency: 10,
      nearThreshold: 12,
      midThreshold: 28,
      farThreshold: 52,
      refinementSensitivity: 0.85,
      fineRegionBudget: 250,
      showGrid: true,
      showPoints: true,
      showBoundingBoxes: true,
      showLabels: true,
      showTrails: true,
      showTerrain: true,
      showScanBeam: true,
      objectSpeed: 1.0,
      terrainComplexity: 1.0,
    });
    updatePreprocessingConfig({
      minRange: 1.0,
      maxRange: 80.0,
      minHeight: -3.0,
      maxHeight: 5.0,
      voxelSize: 0.1,
      downsampleFactor: 1,
      coordinatePreset: 'kitti',
      invertX: false,
      invertY: false,
      invertZ: false,
      swapYZ: false,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 max-w-lg backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400 font-mono-tech font-bold text-sm">
            <SettingsIcon size={16} />
            <span>A-FUSE 2.5D PERCEPTION & SIMULATION CONFIGURATION</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Real-time sensor calibration, adaptive variable-resolution tuning thresholds, and procedural simulation engine parameters. Modifications apply instantaneously to the 3D perception scene.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="hud-panel px-3 py-2 rounded-lg border border-slate-700 text-xs font-mono-tech text-slate-300 hover:text-cyan-300 hover:bg-slate-800 flex items-center gap-1.5 pointer-events-auto cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="pointer-events-auto max-w-4xl w-full my-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 0: Phase 2 LiDAR Ingestion & Dataset Selection */}
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/40 md:col-span-2 space-y-3 font-mono-tech text-xs bg-slate-950/70">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Database size={15} />
              <span>LiDAR DATA INGESTION & PIPELINE SOURCE (PHASE 2)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {dataSource === 'recorded' ? 'MODE: RECORDED DATASET' : 'MODE: SIMULATION'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source switch */}
            <div className="space-y-2">
              <label className="text-slate-400 text-[11px] block font-semibold">Active Data Source:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDataSource('simulation')}
                  className={`p-2 rounded text-center border font-bold cursor-pointer transition-all ${
                    dataSource === 'simulation'
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SIMULATION
                </button>
                <button
                  type="button"
                  onClick={() => setDataSource('recorded')}
                  className={`p-2 rounded text-center border font-bold cursor-pointer transition-all ${
                    dataSource === 'recorded'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RECORDED LiDAR
                </button>
              </div>

              {/* Coordinate Preset */}
              <div className="pt-2">
                <label className="text-slate-400 text-[11px] block font-semibold mb-1">Coordinate Transform Preset:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['kitti', 'ouster', 'velodyne', 'standard'] as CoordinatePreset[]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updatePreprocessingConfig({ coordinatePreset: preset })}
                      className={`px-1.5 py-1 rounded text-[10px] text-center border font-bold cursor-pointer transition-all uppercase ${
                        preprocessingConfig.coordinatePreset === preset
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dataset Picker */}
            <div className="space-y-2">
              <label className="text-slate-400 text-[11px] block font-semibold">Select Recorded Dataset:</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {availableDatasets.map((ds) => {
                  const isSelected = activeDataset?.id === ds.id;
                  return (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => {
                        selectDataset(ds.id);
                        if (dataSource !== 'recorded') setDataSource('recorded');
                      }}
                      className={`w-full p-2 rounded text-left border cursor-pointer transition-all flex items-center justify-between text-[11px] ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{ds.name}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            ds.format === 'bin' ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            .{ds.format.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{ds.description} • {ds.frameCount} frame{ds.frameCount > 1 ? 's' : ''}</div>
                      </div>
                      {isSelected && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Card 1: Preprocessing & Filtering Pipeline */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 space-y-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold">
            <Filter size={14} />
            <span>POINT CLOUD PREPROCESSING FILTERS</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Radial Range Pass-Through:</span>
                <span className="text-cyan-300 font-bold">{preprocessingConfig.minRange}m - {preprocessingConfig.maxRange}m</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={preprocessingConfig.minRange}
                  onChange={(e) => updatePreprocessingConfig({ minRange: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
                <input
                  type="range"
                  min={20}
                  max={120}
                  step={5}
                  value={preprocessingConfig.maxRange}
                  onChange={(e) => updatePreprocessingConfig({ maxRange: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Height Z Bounds Filter:</span>
                <span className="text-cyan-300 font-bold">{preprocessingConfig.minHeight}m to +{preprocessingConfig.maxHeight}m</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min={-6.0}
                  max={0.0}
                  step={0.2}
                  value={preprocessingConfig.minHeight}
                  onChange={(e) => updatePreprocessingConfig({ minHeight: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={preprocessingConfig.maxHeight}
                  onChange={(e) => updatePreprocessingConfig({ maxHeight: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Voxel Grid Downsampling:</span>
                <span className="text-[10px] text-slate-500">Spatial hash decimation</span>
              </div>
              <button
                type="button"
                onClick={() => updatePreprocessingConfig({ voxelSize: preprocessingConfig.voxelSize > 0 ? 0 : 0.1 })}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer border ${
                  preprocessingConfig.voxelSize > 0
                    ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {preprocessingConfig.voxelSize > 0 ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {preprocessingConfig.voxelSize > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Voxel Leaf Size:</span>
                  <span className="text-emerald-300 font-bold">{(preprocessingConfig.voxelSize * 100).toFixed(0)} cm</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.50}
                  step={0.05}
                  value={preprocessingConfig.voxelSize}
                  onChange={(e) => updatePreprocessingConfig({ voxelSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card 2: LiDAR Sensor Calibration */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 space-y-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold">
            <Sliders size={14} />
            <span>LiDAR SENSOR PARAMETERS</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Max Sensor Range:</span>
                <span className="text-cyan-300 font-bold">{settings.maxRange} m</span>
              </div>
              <input
                type="range"
                min={30}
                max={120}
                step={5}
                value={settings.maxRange}
                onChange={(e) => updateSettings({ maxRange: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Point Size:</span>
                <span className="text-cyan-300 font-bold">{settings.pointSize} px</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.2}
                value={settings.pointSize}
                onChange={(e) => updateSettings({ pointSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Scan Frequency:</span>
                <span className="text-cyan-300 font-bold">{settings.scanFrequency} Hz ({(settings.scanFrequency * 60)} RPM)</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={settings.scanFrequency}
                onChange={(e) => updateSettings({ scanFrequency: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Adaptive Resolution Thresholds */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 space-y-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400 font-bold">
            <Layers size={14} />
            <span>ADAPTIVE RESOLUTION THRESHOLDS</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Near Field (5cm Fine Zone):</span>
                <span className="text-cyan-300 font-bold">&lt; {settings.nearThreshold} m</span>
              </div>
              <input
                type="range"
                min={6}
                max={25}
                value={settings.nearThreshold}
                onChange={(e) => updateSettings({ nearThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Mid Field (10cm Med-Fine Zone):</span>
                <span className="text-emerald-300 font-bold">{settings.nearThreshold} - {settings.midThreshold} m</span>
              </div>
              <input
                type="range"
                min={settings.nearThreshold + 5}
                max={45}
                value={settings.midThreshold}
                onChange={(e) => updateSettings({ midThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Refinement Sensitivity:</span>
                <span className="text-amber-300 font-bold">{(settings.refinementSensitivity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.05}
                value={settings.refinementSensitivity}
                onChange={(e) => updateSettings({ refinementSensitivity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Simulation Controls */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 space-y-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-bold">
            <Activity size={14} />
            <span>DYNAMIC SIMULATION CONTROLS</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Dynamic Object Speed:</span>
                <span className="text-amber-300 font-bold">{settings.objectSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.2}
                value={settings.objectSpeed}
                onChange={(e) => updateSettings({ objectSpeed: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Terrain Relief & Complexity:</span>
                <span className="text-purple-300 font-bold">{settings.terrainComplexity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.5}
                step={0.1}
                value={settings.terrainComplexity}
                onChange={(e) => updateSettings({ terrainComplexity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Visualization Toggles */}
        <div className="hud-panel p-4 rounded-lg border border-slate-800 space-y-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-purple-400 font-bold">
            <Eye size={14} />
            <span>HUD & 3D OVERLAYS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'showPoints', label: 'LiDAR Points' },
              { key: 'showGrid', label: 'Adaptive Grid' },
              { key: 'showBoundingBoxes', label: '3D Bounding Boxes' },
              { key: 'showLabels', label: 'Entity Labels' },
              { key: 'showTrails', label: 'Historical Trails' },
              { key: 'showTerrain', label: '3D Ground Mesh' },
              { key: 'showScanBeam', label: 'Rotating Scan Beam' },
            ].map(({ key, label }) => {
              const active = (settings as any)[key];
              return (
                <button
                  key={key}
                  onClick={() => updateSettings({ [key]: !active })}
                  className={`p-2 rounded text-left flex items-center justify-between border cursor-pointer transition-all ${
                    active
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="truncate mr-1 text-[11px]">{label}</span>
                  {active && <Check size={12} className="text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="hud-panel p-2.5 rounded-lg border border-slate-800 max-w-4xl w-full flex items-center justify-between pointer-events-auto text-xs font-mono-tech">
        <span className="text-slate-400">Settings storage: Local Session State</span>
        <span className="text-emerald-400 font-bold">READY FOR ROS2 PARAMETER BRIDGE (PHASE 2)</span>
      </div>
    </div>
  );
};
