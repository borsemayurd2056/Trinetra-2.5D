import React from 'react';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';
import type { ResolutionLevel } from '../types/perception';

export const AdaptiveGridVisualizer: React.FC = () => {
  const { cells, selectedCell, setSelectedCell, settings, dataSource } = usePerception();

  // In Phase 2 recorded LiDAR mode, adaptive 2.5D grid mapping is scheduled for Phase 3
  if (dataSource === 'recorded' || !settings.showGrid) return null;

  const getCellColor = (res: ResolutionLevel, isRefined: boolean): string => {
    if (isRefined) {
      return res === 0.05 ? '#00f0ff' : '#34d399';
    }
    switch (res) {
      case 0.05:
        return '#00e5ff'; // 5cm Cyan
      case 0.10:
        return '#10b981'; // 10cm Emerald
      case 0.25:
        return '#f59e0b'; // 25cm Amber
      case 0.50:
      default:
        return '#6366f1'; // 50cm Violet
    }
  };

  return (
    <group>
      {cells.map((cell) => {
        const isSelected = selectedCell?.id === cell.id;
        const color = getCellColor(cell.resolution, cell.isRefinedLocally);
        const cellSize = 3.8;

        return (
          <group
            key={cell.id}
            position={[cell.x, cell.elevation + 0.04, cell.y]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCell(cell);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'crosshair';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Cell flat tile surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[cellSize * 0.95, cellSize * 0.95]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isSelected ? 0.6 : cell.isRefinedLocally ? 0.35 : 0.15}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Cell border lines showing internal subdivision based on resolution */}
            <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(cellSize * 0.95, cellSize * 0.95)]} />
              <lineBasicMaterial
                color={isSelected ? '#00f0ff' : color}
                linewidth={isSelected ? 3 : 1}
                transparent
                opacity={isSelected ? 0.95 : cell.isRefinedLocally ? 0.75 : 0.4}
              />
            </lineSegments>

            {/* Internal crosshairs for 5cm or refined cells */}
            {(cell.resolution === 0.05 || cell.isRefinedLocally) && (
              <group position={[0, 0.01, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[cellSize * 0.9, 0.01, 0.04]} />
                  <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.04, 0.01, cellSize * 0.9]} />
                  <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>
              </group>
            )}

            {/* Pulsing selection reticle on active selected cell */}
            {isSelected && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[cellSize, 0.4, cellSize]} />
                <meshBasicMaterial
                  color="#00f0ff"
                  wireframe
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
