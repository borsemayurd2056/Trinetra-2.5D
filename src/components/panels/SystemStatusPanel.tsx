import React from 'react';
import { Activity, Cpu, HardDrive, Zap, Radio, CheckCircle2, AlertCircle, Database, Layers } from 'lucide-react';
import { usePerception } from '../../context/PerceptionContext';

export const SystemStatusPanel: React.FC = () => {
  const {
    telemetry,
    isStreaming,
    toggleStreaming,
    dataSource,
    pointCloudStats,
    activeDataset,
  } = usePerception();

  const isRecorded = dataSource === 'recorded';

  return (
    <div className="space-y-4">
      {/* --- SYSTEM PIPELINE STATUS --- */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2 font-semibold tracking-wider uppercase">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio size={13} className="animate-pulse" />
            System Status
          </span>
          <button
            onClick={toggleStreaming}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              isStreaming
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
            }`}
          >
            {isStreaming ? (isRecorded ? 'PLAYBACK: ACTIVE' : 'STREAM: LIVE') : 'STREAM: PAUSED'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">LiDAR</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> {isRecorded ? 'RECORDED' : 'SIMULATED'}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">AI MODEL</span>
            {isRecorded ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1" title="Real AI segmentation/detection activates in Phase 3">
                <AlertCircle size={11} /> PHASE 3
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> READY
              </span>
            )}
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">2.5D MAP</span>
            {isRecorded ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle size={11} /> RAW ONLY
              </span>
            ) : (
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> ACTIVE
              </span>
            )}
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">DATA STREAM</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />{' '}
              {isRecorded ? 'DATASET' : 'SYNTH'}
            </span>
          </div>
        </div>
      </div>

      {/* --- RECORDED LIDAR STATS (PHASE 2) --- */}
      {isRecorded && pointCloudStats && (
        <div>
          <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2 font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Database size={13} />
              Real Point Cloud Stats
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              {activeDataset?.format.toUpperCase() || 'BIN'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono-tech">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
              <span className="text-slate-400">RAW / PROC POINTS</span>
              <span className="text-slate-200 font-bold">
                {pointCloudStats.rawPointCount.toLocaleString()} / <span className="text-cyan-300">{pointCloudStats.processedPointCount.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
              <span className="text-slate-400">AVG REFLECTIVITY</span>
              <span className="text-amber-300 font-bold">
                {(pointCloudStats.avgIntensity * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900/50 border border-slate-800/80 space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
                <span>Spatial Bounding Box (m)</span>
                <span className="text-cyan-400">{activeDataset?.coordinatePreset.toUpperCase() || 'KITTI'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300">
                <div>X: [{pointCloudStats.minX.toFixed(1)}, {pointCloudStats.maxX.toFixed(1)}]</div>
                <div>Y: [{pointCloudStats.minY.toFixed(1)}, {pointCloudStats.maxY.toFixed(1)}]</div>
                <div>Z: [{pointCloudStats.minZ.toFixed(1)}, {pointCloudStats.maxZ.toFixed(1)}]</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500">LOAD</div>
                <div className="text-xs text-cyan-300 font-bold">{pointCloudStats.loadTimeMs.toFixed(1)}ms</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500">PREPROC</div>
                <div className="text-xs text-emerald-300 font-bold">{pointCloudStats.preprocessTimeMs.toFixed(1)}ms</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500">GPU UPLOAD</div>
                <div className="text-xs text-purple-300 font-bold">{pointCloudStats.uploadTimeMs.toFixed(1)}ms</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REAL-TIME PERFORMANCE TELEMETRY --- */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2 font-semibold tracking-wider uppercase">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Activity size={13} />
            Telemetry Metrics
          </span>
          <span className="text-[10px] text-slate-400">{isRecorded ? 'Dataset Replay' : 'Target 40Hz'}</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono-tech">
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap size={12} className="text-cyan-400" /> BROWSER RUNTIME FPS (MEASURED)
            </span>
            <span className="text-cyan-300 font-bold">{telemetry.actualFps} FPS</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" /> ENGINE FPS ({isRecorded ? 'PLAYBACK' : 'SIMULATED'})
            </span>
            <span className="text-amber-300 font-bold">{telemetry.fps} FPS</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" /> {isRecorded ? 'TOTAL PIPELINE (MEASURED)' : 'LATENCY (SIMULATED)'}
            </span>
            <span className="text-emerald-400 font-bold">
              {isRecorded && pointCloudStats
                ? (pointCloudStats.loadTimeMs + pointCloudStats.preprocessTimeMs + pointCloudStats.uploadTimeMs).toFixed(1)
                : telemetry.latency}{' '}
              ms
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive size={12} className="text-cyan-400" /> RAM USAGE (SIMULATED)
            </span>
            <span className="text-slate-200 font-bold">{telemetry.ram} MB</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu size={12} className="text-purple-400" /> GPU LOAD (SIMULATED)
            </span>
            <span className="text-purple-300 font-bold">{telemetry.gpu}%</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400">POINTS / FRAME</span>
            <span className="text-slate-200 font-mono-tech">{telemetry.pointsPerFrame.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
