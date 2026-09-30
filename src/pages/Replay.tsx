import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Film,
  Database,
} from 'lucide-react';
import { usePerception } from '../context/PerceptionContext';
import { perceptionService } from '../services/PerceptionStreamService';

export const Replay: React.FC = () => {
  const {
    isStreaming,
    toggleStreaming,
    dataSource,
    recordedFrameIndex,
    recordedFrameCount,
    loadRecordedFrame,
    activeDataset,
    pointCloudStats,
  } = usePerception();

  const isRecorded = dataSource === 'recorded';
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [replayBuffer, setReplayBuffer] = useState<any[]>(() => perceptionService.getReplayBuffer());
  const [currentSimFrameIdx, setCurrentSimFrameIdx] = useState<number>(() => {
    const buf = perceptionService.getReplayBuffer();
    return Math.max(0, buf.length - 1);
  });

  // Update simulation buffer periodically
  useEffect(() => {
    if (isRecorded) return;
    const timer = setInterval(() => {
      const buf = perceptionService.getReplayBuffer();
      setReplayBuffer([...buf]);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecorded]);

  // Simulation playback loop
  useEffect(() => {
    if (isRecorded || !isPlaying || replayBuffer.length === 0) return;

    const intervalMs = Math.round(100 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentSimFrameIdx((prev) => {
        if (prev >= replayBuffer.length - 1) {
          return 0; // Loop replay
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRecorded, isPlaying, playbackSpeed, replayBuffer.length]);

  // Recorded dataset playback loop
  useEffect(() => {
    if (!isRecorded || !isPlaying || recordedFrameCount <= 1) return;

    const intervalMs = Math.round(100 / playbackSpeed);
    const timer = setInterval(() => {
      const nextIdx = (recordedFrameIndex + 1) % recordedFrameCount;
      loadRecordedFrame(nextIdx);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRecorded, isPlaying, playbackSpeed, recordedFrameIndex, recordedFrameCount, loadRecordedFrame]);

  // Apply sim replay frame when scrubbing sim
  const activeSimReplayFrame = !isRecorded ? replayBuffer[currentSimFrameIdx] || null : null;
  useEffect(() => {
    if (!isRecorded && activeSimReplayFrame) {
      perceptionService.applyReplayFrame(activeSimReplayFrame);
    }
  }, [isRecorded, activeSimReplayFrame]);

  const currentIdx = isRecorded ? recordedFrameIndex : currentSimFrameIdx;
  const maxIdx = isRecorded ? Math.max(0, recordedFrameCount - 1) : Math.max(0, replayBuffer.length - 1);
  const frameDisplay = isRecorded
    ? `#${recordedFrameIndex + 1}`
    : `#${activeSimReplayFrame ? activeSimReplayFrame.frameNumber : currentSimFrameIdx}`;
  const totalDisplay = isRecorded ? recordedFrameCount : Math.max(1, replayBuffer.length);

  const handleSeek = (newIdx: number) => {
    setIsPlaying(false);
    if (isRecorded) {
      loadRecordedFrame(newIdx);
    } else {
      setCurrentSimFrameIdx(newIdx);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (isRecorded) {
      const prev = Math.max(0, recordedFrameIndex - 1);
      loadRecordedFrame(prev);
    } else {
      setCurrentSimFrameIdx((p) => Math.max(0, p - 1));
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (isRecorded) {
      const next = Math.min(recordedFrameCount - 1, recordedFrameIndex + 1);
      loadRecordedFrame(next);
    } else {
      setCurrentSimFrameIdx((p) => Math.min(replayBuffer.length - 1, p + 1));
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 max-w-lg pointer-events-auto backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400 font-mono-tech font-bold text-sm">
          {isRecorded ? <Database size={16} /> : <Film size={16} />}
          <span>
            {isRecorded ? 'RECORDED LiDAR DATASET REPLAY' : 'SIMULATION BUFFER REPLAY WORKSTATION'}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          {isRecorded
            ? `Temporal scrubber for ${activeDataset?.name || 'KITTI'} (${activeDataset?.format.toUpperCase() || 'BIN'}). Step through raw recorded scans with measured timing and point cloud statistics.`
            : 'Frame-by-frame temporal inspection. Scrub through recorded simulated LiDAR point clouds, ego odometry, and dynamic object trajectories.'}
        </p>
      </div>

      {/* Center Playback Overlay Status */}
      <div className="mx-auto pointer-events-auto">
        <div className="hud-panel px-4 py-2 rounded-full border border-cyan-400/40 text-xs font-mono-tech flex items-center gap-3 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-cyan-400" />
            <span className="text-slate-400">{isRecorded ? 'DATASET SCAN:' : 'FRAME:'}</span>
            <span className="text-cyan-300 font-bold">{frameDisplay}</span>
            <span className="text-slate-400">/ {totalDisplay}</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {isRecorded && pointCloudStats ? (
            <div className="text-slate-300">
              Points: <span className="text-emerald-400 font-bold">{pointCloudStats.processedPointCount.toLocaleString()}</span>
            </div>
          ) : (
            <div className="text-slate-300">
              Speed: <span className="text-emerald-400 font-bold">{playbackSpeed}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Playback Controls Console */}
      <div className="pointer-events-auto max-w-3xl w-full mx-auto">
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/40 shadow-2xl space-y-3">
          {/* Timeline Scrubber Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>{isRecorded ? `Scan 0 / ${totalDisplay}` : '00:00.00'}</span>
              <span className="text-cyan-300 font-bold">
                {isRecorded
                  ? `${activeDataset?.name} [${activeDataset?.format.toUpperCase()}]`
                  : `Buffer: ${replayBuffer.length} Frames`}
              </span>
              <span>{isRecorded ? `Scan ${totalDisplay - 1}` : 'LIVE'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxIdx}
              value={currentIdx}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed Multipliers */}
            <div className="flex items-center gap-1 text-xs font-mono-tech">
              {[0.25, 0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded cursor-pointer transition-all ${
                    playbackSpeed === spd
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Transport Controls (Prev, Play/Pause, Next) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleStepBack}
                title="Step Backward (1 Frame)"
                className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
              >
                <SkipBack size={15} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer transition-all"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
              </button>

              <button
                onClick={handleStepForward}
                title="Step Forward (1 Frame)"
                className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
              >
                <SkipForward size={15} />
              </button>
            </div>

            {/* Reset to Live / First Frame */}
            <button
              onClick={() => {
                setIsPlaying(false);
                if (isRecorded) {
                  loadRecordedFrame(0);
                } else {
                  setCurrentSimFrameIdx(replayBuffer.length - 1);
                  if (!isStreaming) toggleStreaming();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono-tech hover:bg-emerald-900 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{isRecorded ? 'Reset to First Scan' : 'Jump to Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
