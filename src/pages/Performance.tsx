import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';

export const Performance: React.FC = () => {
  const { telemetry, dataSource, pointCloudStats, activeDataset } = usePerception();

  // Maintain historical arrays for real-time SVG charting
  const [history, setHistory] = useState<{
    fps: number[];
    actualFps: number[];
    latency: number[];
    ram: number[];
    gpu: number[];
  }>({
    fps: Array(30).fill(38),
    actualFps: Array(30).fill(60),
    latency: Array(30).fill(27),
    ram: Array(30).fill(412),
    gpu: Array(30).fill(64),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setHistory((prev) => ({
        fps: [...prev.fps.slice(1), telemetry.fps],
        actualFps: [...prev.actualFps.slice(1), telemetry.actualFps],
        latency: [...prev.latency.slice(1), telemetry.latency],
        ram: [...prev.ram.slice(1), telemetry.ram],
        gpu: [...prev.gpu.slice(1), telemetry.gpu],
      }));
    }, 400);

    return () => clearInterval(timer);
  }, [telemetry]);

  // Helper to render an SVG sparkline path
  const renderSparkline = (
    data: number[],
    min: number,
    max: number,
    color: string,
    width = 320,
    height = 65
  ) => {
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const normalized = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
      const y = height - normalized * (height - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaData = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

    return (
      <svg className="w-full h-16 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Subtle grid lines */}
        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
        {/* Gradient fill */}
        <path d={areaData} fill={color} fillOpacity="0.12" />
        {/* Stroke line */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Latest point circle */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3.5"
            fill={color}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  };

  const isRecorded = dataSource === 'recorded';

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between overflow-y-auto">
      {/* Top Banner */}
      <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 max-w-lg pointer-events-auto backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400 font-mono-tech font-bold text-sm">
          <Activity size={16} />
          <span>PERCEPTION PIPELINE TELEMETRY & RUNTIME PROFILER</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          Distinguishing genuine browser WebGL rendering runtime performance <span className="text-cyan-300 font-bold">[MEASURED]</span> from recorded pipeline I/O profiler metrics and simulated perception loops.
        </p>
      </div>

      {/* Measured Ingestion Profiler Banner (Phase 2) */}
      {isRecorded && pointCloudStats && (
        <div className="hud-panel p-3.5 rounded-lg border border-emerald-500/40 max-w-4xl w-full mx-auto pointer-events-auto my-2 space-y-2 font-mono-tech text-xs bg-slate-950/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Database size={14} />
              REAL LiDAR INGESTION PIPELINE BREAKDOWN [MEASURED]
            </span>
            <span className="text-[10px] text-slate-400">
              Dataset: <strong className="text-cyan-300">{activeDataset?.name}</strong> ({activeDataset?.format.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">1. BINARY I/O PARSE</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{pointCloudStats.loadTimeMs.toFixed(2)} ms</div>
              <div className="text-[9px] text-slate-500">IEEE-754 buffer decoding</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">2. PREPROCESSING</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{pointCloudStats.preprocessTimeMs.toFixed(2)} ms</div>
              <div className="text-[9px] text-slate-500">Range, height & voxel filter</div>
            </div>

            <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">3. GPU BUFFER UPLOAD</div>
              <div className="text-sm font-bold text-purple-300 mt-0.5">{pointCloudStats.uploadTimeMs.toFixed(2)} ms</div>
              <div className="text-[9px] text-slate-500">WebGL Float32Array bind</div>
            </div>

            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400">TOTAL LATENCY</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {(pointCloudStats.loadTimeMs + pointCloudStats.preprocessTimeMs + pointCloudStats.uploadTimeMs).toFixed(2)} ms
              </div>
              <div className="text-[9px] text-emerald-400/70">Ingestion turnaround</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-4xl w-full mx-auto my-auto">
        {/* Chart 1: Runtime FPS */}
        <div className="hud-panel p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" /> WebGL Render FPS [MEASURED]
            </span>
            <span className="text-cyan-400 font-bold text-sm">{telemetry.actualFps} FPS</span>
          </div>
          {renderSparkline(history.actualFps, 30, 75, '#00f0ff')}
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
            <span>Historical (Last 12s)</span>
            <span className="text-cyan-300">Target smooth 60 FPS where hardware permits</span>
          </div>
        </div>

        {/* Chart 2: Pipeline Latency */}
        <div className="hud-panel p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />{' '}
              {isRecorded ? 'Pipeline Processing Latency [MEASURED]' : 'Perception Latency [SIMULATED]'}
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              {isRecorded && pointCloudStats
                ? (pointCloudStats.loadTimeMs + pointCloudStats.preprocessTimeMs + pointCloudStats.uploadTimeMs).toFixed(1)
                : telemetry.latency}{' '}
              ms
            </span>
          </div>
          {renderSparkline(history.latency, 15, 45, '#10b981')}
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
            <span>Historical (Last 12s)</span>
            <span>Target: &lt; 35ms for 30Hz loop</span>
          </div>
        </div>

        {/* Chart 3: Memory Footprint */}
        <div className="hud-panel p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <HardDrive size={14} className="text-amber-400" /> RAM Memory Allocation [SIMULATED]
            </span>
            <span className="text-amber-300 font-bold text-sm">{telemetry.ram} MB</span>
          </div>
          {renderSparkline(history.ram, 350, 480, '#f59e0b')}
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
            <span>Historical (Last 12s)</span>
            <span>Budget: &lt; 1,024 MB Mobile UGV (Simulated)</span>
          </div>
        </div>

        {/* Chart 4: GPU Utilization */}
        <div className="hud-panel p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu size={14} className="text-purple-400" /> GPU Compute Load [SIMULATED]
            </span>
            <span className="text-purple-300 font-bold text-sm">{telemetry.gpu}%</span>
          </div>
          {renderSparkline(history.gpu, 40, 90, '#a855f7')}
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
            <span>Historical (Last 12s)</span>
            <span>Point Cloud & Quad Shaders (Simulated)</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="hud-panel p-2.5 rounded-lg border border-slate-800 max-w-4xl w-full mx-auto flex items-center justify-between pointer-events-auto text-xs font-mono-tech">
        <span className="text-slate-400">
          Mode: <strong className={isRecorded ? 'text-emerald-400' : 'text-cyan-400'}>{isRecorded ? 'RECORDED DATASET' : 'SIMULATION ENGINE'}</strong>
        </span>
        <span className="text-slate-400">
          Throughput: <strong className="text-slate-200">{telemetry.pointsPerFrame.toLocaleString()}</strong> pts/frame
        </span>
        <span className="text-slate-400">
          Active 2.5D Cells: <strong className="text-cyan-400">{isRecorded ? 'RAW LIDAR (PHASE 2)' : telemetry.activeCells}</strong>
        </span>
      </div>
    </div>
  );
};
