import React from 'react';
import { TopBar } from './TopBar';
import { LeftNav } from './LeftNav';
import { RightPanel } from '../panels/RightPanel';
import { BottomControls } from './BottomControls';
import { PerceptionScene } from '../../three/PerceptionScene';
import { usePerception } from '../../context/PerceptionContext';

// 8 Pages
import { LivePerception } from '../../pages/LivePerception';
import { AdaptiveMap } from '../../pages/AdaptiveMap';
import { DynamicObjects } from '../../pages/DynamicObjects';
import { TerrainAnalysis } from '../../pages/TerrainAnalysis';
import { Performance } from '../../pages/Performance';
import { Benchmark } from '../../pages/Benchmark';
import { Replay } from '../../pages/Replay';
import { Settings } from '../../pages/Settings';

export const AppShell: React.FC = () => {
  const { activePage } = usePerception();

  return (
    <div className="w-screen h-screen flex flex-col bg-[#06080d] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Persistent Top Status Bar */}
      <TopBar />

      {/* 2. Middle Row: LeftNav | Central 3D Perception Viewport | RightPanel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Navigation */}
        <LeftNav />

        {/* Central 3D Perception Viewport (Dominant Center Stage) */}
        <main className="flex-1 relative h-full overflow-hidden bg-[#06080d]">
          {/* Central 3D Canvas Scene is permanently active */}
          <PerceptionScene />

          {/* Active Page Contextual Overlays */}
          {activePage === 'live-perception' && <LivePerception />}
          {activePage === 'adaptive-map' && <AdaptiveMap />}
          {activePage === 'dynamic-objects' && <DynamicObjects />}
          {activePage === 'terrain-analysis' && <TerrainAnalysis />}
          {activePage === 'performance' && <Performance />}
          {activePage === 'benchmark' && <Benchmark />}
          {activePage === 'replay' && <Replay />}
          {activePage === 'settings' && <Settings />}
        </main>

        {/* Right Information Panel (Collapsible, Contextual Telemetry & Inspectors) */}
        <RightPanel />
      </div>

      {/* 3. Persistent Bottom Visualization Controls */}
      <BottomControls />
    </div>
  );
};
