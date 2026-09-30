import React, { useMemo } from 'react';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';
import { perceptionService } from '../services/PerceptionStreamService';

export const TerrainMesh: React.FC = () => {
  const { settings, activePage, visualizationMode, dataSource } = usePerception();

  // In Phase 2 recorded LiDAR mode, display flat reference ground grid
  if (dataSource === 'recorded') {
    if (!settings.showTerrain) return null;
    return (
      <group position={[0, -0.05, 0]}>
        <gridHelper args={[120, 60, '#00f0ff', '#1e293b']} />
      </group>
    );
  }

  // Generate terrain geometry grid matching TerrainSimulator
  const { geometry } = useMemo(() => {
    const size = 120; // 120m x 120m
    const segments = 100;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const terrain = (perceptionService as any).engine.terrain;
    terrain.setComplexity(settings.terrainComplexity);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i); // Note: plane rotated, Z is Y in terrain world

      const sample = terrain.sample(x, z);
      pos.setY(i, sample.z);

      // Vertex color determination
      let r = 0.08, g = 0.11, b = 0.15; // Default dark military ground

      if (sample.isRoad) {
        r = 0.18; g = 0.20; b = 0.24; // Asphalt road
      } else if (visualizationMode === 'elevation' || activePage === 'terrain-analysis') {
        const normZ = Math.max(0, Math.min(1, (sample.z + 2.0) / 6.0));
        r = 0.1 + normZ * 0.8;
        g = 0.3 + (1 - Math.abs(normZ - 0.5) * 2) * 0.6;
        b = 0.8 * (1 - normZ);
      } else if (visualizationMode === 'traversability') {
        if (sample.traversability === 'HIGH') {
          r = 0.06; g = 0.45; b = 0.25;
        } else if (sample.traversability === 'CAUTION') {
          r = 0.65; g = 0.50; b = 0.10;
        } else {
          r = 0.60; g = 0.12; b = 0.15;
        }
      } else if (sample.semanticClass === 'Vegetation') {
        r = 0.09; g = 0.22; b = 0.14;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    return { geometry: geom };
  }, [visualizationMode, activePage, settings.terrainComplexity]);

  if (!settings.showTerrain) return null;

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.75}
          metalness={0.15}
          wireframe={false}
        />
      </mesh>

      {/* Road centerline dashes */}
      <group position={[0, 0.08, 0]}>
        {Array.from({ length: 40 }).map((_, i) => {
          const y = -55 + i * 2.8;
          const roadCenterX = Math.sin(y * 0.05) * 4.0;
          return (
            <mesh
              key={i}
              position={[roadCenterX, 0.1, y]}
              rotation={[-Math.PI / 2, 0, Math.cos(y * 0.05) * 0.2]}
            >
              <planeGeometry args={[0.2, 1.4]} />
              <meshBasicMaterial color="#f8fafc" transparent opacity={0.7} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
