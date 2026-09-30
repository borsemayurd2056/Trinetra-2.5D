import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';

export const EgoVehicle: React.FC = () => {
  const { egoVehicle, settings } = usePerception();
  const lidarPuckRef = useRef<THREE.Group>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  const [x, y, z] = egoVehicle.position;

  useFrame(() => {
    if (lidarPuckRef.current) {
      lidarPuckRef.current.rotation.y = egoVehicle.scannerAngle;
    }
    if (scanBeamRef.current) {
      scanBeamRef.current.rotation.y = egoVehicle.scannerAngle;
    }
  });

  return (
    <group position={[x, z, y]}>
      {/* --- UGV MAIN CHASSIS --- */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 3.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Armored Cabin / Electronics Shell */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.45, 2.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Cyber/Tactical Trim Glow Strips */}
      <mesh position={[0, 0.5, 1.82]}>
        <boxGeometry args={[1.9, 0.08, 0.04]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0, 0.5, -1.82]}>
        <boxGeometry args={[1.9, 0.08, 0.04]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 4 Heavy-Duty All-Terrain Wheels */}
      {[-1.15, 1.15].map((wx, i) =>
        [-1.2, 1.2].map((wz, j) => (
          <group key={`${i}-${j}`} position={[wx, 0.35, wz]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.38, 0.38, 0.3, 16]} />
              <meshStandardMaterial color="#0a0a0c" roughness={0.8} />
            </mesh>
            {/* Wheel hub */}
            <mesh position={[0, wx > 0 ? 0.16 : -0.16, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* --- SENSOR MAST & LIDAR PUCK --- */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.45, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* Spinning LiDAR Unit (Velodyne / Ouster Puck Style) */}
      <group ref={lidarPuckRef} position={[0, 1.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.22, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Optical Glass Ring */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.1, 24]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
        </mesh>
        {/* Forward lens emitter dot */}
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* --- ROTATING SCANNING SWEEP BEAM --- */}
      {settings.showScanBeam && (
        <group ref={scanBeamRef} position={[0, 1.55, 0]}>
          {/* Fan-shaped scanning ray wedge */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, settings.maxRange, 32, 1, 0, Math.PI / 6]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.18}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Central beam laser line */}
          <mesh position={[0, 0, settings.maxRange / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, settings.maxRange, 6]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* --- SENSOR RANGE FOOTPRINT RINGS --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[settings.nearThreshold - 0.1, settings.nearThreshold, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[settings.midThreshold - 0.1, settings.midThreshold, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[settings.farThreshold - 0.1, settings.farThreshold, 64]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[settings.maxRange - 0.15, settings.maxRange, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* --- HEADING INDICATOR ARROW --- */}
      <group position={[0, 0.1, 2.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 1.0, 16]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* --- COORDINATE AXES (UGV Frame) --- */}
      <axesHelper args={[2.5]} />
    </group>
  );
};
