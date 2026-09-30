import React from 'react';
import { CompassRose } from '../components/hud/CompassRose';
import { CameraHUD } from '../components/hud/CameraHUD';
import { ResolutionLegend } from '../components/hud/ResolutionLegend';

export const LivePerception: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* HUD Overlays (Interactive elements have pointer-events-auto) */}
      <div className="pointer-events-auto">
        <CompassRose />
      </div>

      <div className="pointer-events-auto">
        <CameraHUD />
      </div>

      <div className="pointer-events-auto">
        <ResolutionLegend />
      </div>
    </div>
  );
};
