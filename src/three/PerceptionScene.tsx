import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { EgoVehicle } from './EgoVehicle';
import { DynamicEntities } from './DynamicEntities';
import { AdaptiveGridVisualizer } from './AdaptiveGridVisualizer';
import { LidarPointCloud } from './LidarPointCloud';
import { TerrainMesh } from './TerrainMesh';
import { usePerception } from '../context/PerceptionContext';

export const PerceptionScene: React.FC = () => {
  const { setSelectedObject, setSelectedCell } = usePerception();

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-[#06080d]">
      <Canvas
        camera={{ position: [24, 20, 32], fov: 52, near: 0.2, far: 450 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerDown={(e) => {
          // If clicking empty scene, deselect active inspectors
          if (e.target === e.currentTarget) {
            setSelectedObject(null);
            setSelectedCell(null);
          }
        }}
      >
        {/* Deep atmospheric fog for perception depth */}
        <color attach="background" args={['#06080d']} />
        <fog attach="fog" args={['#06080d', 45, 160]} />

        {/* Tactical Lighting */}
        <ambientLight intensity={0.55} color="#94a3b8" />
        <directionalLight
          position={[40, 60, 30]}
          intensity={1.2}
          color="#f8fafc"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={180}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />
        {/* Soft cyan ground bounce light */}
        <directionalLight position={[-20, -10, -20]} intensity={0.25} color="#00f0ff" />

        {/* 3D Modules */}
        <CameraController />
        <TerrainMesh />
        <EgoVehicle />
        <DynamicEntities />
        <AdaptiveGridVisualizer />
        <LidarPointCloud />
      </Canvas>
    </div>
  );
};
