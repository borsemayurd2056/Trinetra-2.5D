import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';
import { perceptionService } from '../services/PerceptionStreamService';

export const LidarPointCloud: React.FC = () => {
  const { visualizationMode, settings } = usePerception();
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame(() => {
    if (!settings.showPoints || !geometryRef.current) return;

    const bufferData = perceptionService.getPointCloudBuffers(visualizationMode);

    const posAttr = geometryRef.current.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = geometryRef.current.getAttribute('color') as THREE.BufferAttribute;

    if (!posAttr || posAttr.count !== bufferData.count) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(bufferData.positions, 3)
      );
      geometryRef.current.setAttribute(
        'color',
        new THREE.BufferAttribute(bufferData.colors, 3)
      );
    } else {
      (posAttr.array as Float32Array).set(bufferData.positions);
      (colAttr.array as Float32Array).set(bufferData.colors);
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  if (!settings.showPoints) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={settings.pointSize * 0.12}
        vertexColors
        transparent
        opacity={0.92}
        sizeAttenuation
        blending={THREE.NormalBlending}
      />
    </points>
  );
};
