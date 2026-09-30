import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';
import type { DetectedObject } from '../types/perception';

export const DynamicEntities: React.FC = () => {
  const {
    objects,
    selectedObject,
    setSelectedObject,
    settings,
    visualizationMode,
    dataSource,
  } = usePerception();

  // In Phase 2 recorded LiDAR mode, AI 3D object detection is not active
  if (dataSource === 'recorded') return null;

  const getObjectColor = (obj: DetectedObject): string => {
    if (visualizationMode === 'resolution') {
      if (obj.resolution === 0.05) return '#00f0ff';
      if (obj.resolution === 0.10) return '#10b981';
      if (obj.resolution === 0.25) return '#f59e0b';
      return '#8b5cf6';
    }
    if (obj.type === 'vehicle') return '#38bdf8';
    if (obj.type === 'pedestrian') return '#fb923c';
    if (obj.type === 'cyclist') return '#4ade80';
    return '#f43f5e';
  };

  return (
    <group>
      {objects.map((obj) => {
        const isSelected = selectedObject?.id === obj.id;
        const [x, y, z] = obj.position;
        const [l, w, h] = obj.dimensions;
        const color = getObjectColor(obj);

        return (
          <group
            key={obj.id}
            position={[x, z, y]}
            rotation={[0, -obj.heading + Math.PI / 2, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(obj);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* --- 3D MESH GEOMETRY --- */}
            {obj.type === 'vehicle' && (
              <group position={[0, h / 2, 0]}>
                {/* Main Body */}
                <mesh castShadow>
                  <boxGeometry args={[w, h * 0.65, l]} />
                  <meshStandardMaterial
                    color={isSelected ? '#00f0ff' : '#1e293b'}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
                {/* Cabin */}
                <mesh position={[0, h * 0.45, -l * 0.1]} castShadow>
                  <boxGeometry args={[w * 0.85, h * 0.45, l * 0.55]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Headlights / Taillights */}
                <mesh position={[0, 0, l * 0.49]}>
                  <boxGeometry args={[w * 0.8, 0.1, 0.05]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
                <mesh position={[0, 0, -l * 0.49]}>
                  <boxGeometry args={[w * 0.8, 0.1, 0.05]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}

            {obj.type === 'pedestrian' && (
              <group position={[0, h / 2, 0]}>
                {/* Torso */}
                <mesh position={[0, 0.15, 0]} castShadow>
                  <capsuleGeometry args={[0.22, 0.65, 8, 12]} />
                  <meshStandardMaterial
                    color={isSelected ? '#00f0ff' : '#ea580c'}
                    roughness={0.6}
                  />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.72, 0]}>
                  <sphereGeometry args={[0.16, 12, 12]} />
                  <meshStandardMaterial color="#fed7aa" />
                </mesh>
              </group>
            )}

            {obj.type === 'cyclist' && (
              <group position={[0, h / 2, 0]}>
                {/* Bicycle frame */}
                <mesh castShadow>
                  <boxGeometry args={[0.3, 0.8, 1.6]} />
                  <meshStandardMaterial color="#16a34a" />
                </mesh>
                {/* Rider */}
                <mesh position={[0, 0.35, 0]}>
                  <capsuleGeometry args={[0.2, 0.5, 8, 12]} />
                  <meshStandardMaterial color="#22c55e" />
                </mesh>
              </group>
            )}

            {obj.type === 'static_obstacle' && (
              <group position={[0, h / 2, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[w, h, l]} />
                  <meshStandardMaterial
                    color={isSelected ? '#00f0ff' : '#64748b'}
                    roughness={0.8}
                    metalness={0.2}
                  />
                </mesh>
              </group>
            )}

            {/* --- 3D BOUNDING BOX WIREFRAME --- */}
            {settings.showBoundingBoxes && (
              <group position={[0, h / 2, 0]}>
                <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(w + 0.2, h + 0.2, l + 0.2)]} />
                  <lineBasicMaterial
                    color={isSelected ? '#00f0ff' : color}
                    linewidth={isSelected ? 2 : 1}
                    transparent
                    opacity={isSelected ? 0.95 : 0.6}
                  />
                </lineSegments>

                {/* Corner reticle markers on selected object */}
                {isSelected && (
                  <mesh>
                    <boxGeometry args={[w + 0.35, h + 0.35, l + 0.35]} />
                    <meshBasicMaterial
                      color="#00f0ff"
                      wireframe
                      transparent
                      opacity={0.35}
                    />
                  </mesh>
                )}
              </group>
            )}

            {/* --- 3D VELOCITY VECTOR ARROW --- */}
            {obj.dynamic && obj.speed > 0.2 && (
              <group position={[0, h * 0.4, l * 0.5]}>
                {/* Vector stem line */}
                <mesh
                  position={[0, 0, Math.min(3.5, obj.speed * 0.45) / 2]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry
                    args={[0.04, 0.04, Math.min(3.5, obj.speed * 0.45), 6]}
                  />
                  <meshBasicMaterial color="#00f0ff" />
                </mesh>
                {/* Arrowhead */}
                <mesh
                  position={[0, 0, Math.min(3.5, obj.speed * 0.45) + 0.2]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <coneGeometry args={[0.15, 0.4, 8]} />
                  <meshBasicMaterial color="#00f0ff" />
                </mesh>
              </group>
            )}

            {/* --- TACTICAL HUD BILLBOARD LABEL --- */}
            {settings.showLabels && (
              <Html
                position={[0, h + 0.55, 0]}
                center
                distanceFactor={18}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-tech whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.6)] font-bold scale-110'
                      : 'bg-slate-900/85 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <span className="text-cyan-400 font-bold mr-1">#{obj.id.split('-')[1]}</span>
                  <span>{obj.type.toUpperCase()}</span>
                  {obj.dynamic && (
                    <span className="ml-1.5 text-emerald-400">{obj.speed.toFixed(1)}m/s</span>
                  )}
                  <span className="ml-1 text-slate-400 font-normal">
                    {(obj.resolution * 100).toFixed(0)}cm
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* --- HISTORICAL TRAJECTORY TRAILS (Primitive Line) --- */}
      {settings.showTrails &&
        objects.map((obj) => {
          if (!obj.dynamic || obj.trajectory.length < 2) return null;
          const points = obj.trajectory.map((p) => new THREE.Vector3(p[0], p[2], p[1]));
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: obj.type === 'vehicle' ? '#38bdf8' : '#fb923c',
            transparent: true,
            opacity: 0.45,
          });
          const lineMesh = new THREE.Line(lineGeom, lineMat);

          return <primitive key={`trail-${obj.id}`} object={lineMesh} />;
        })}
    </group>
  );
};
