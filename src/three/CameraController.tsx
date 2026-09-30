import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePerception } from '../context/PerceptionContext';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const { cameraMode, focusTarget, egoVehicle } = usePerception();

  const prevMode = useRef(cameraMode);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (cameraMode === 'top') {
      camera.position.set(0, 75, 0.1);
      controlsRef.current.target.set(0, 0, 0);
      camera.up.set(0, 0, -1);
    } else if (cameraMode === 'firstPerson') {
      const [ex, ey, ez] = egoVehicle.position;
      camera.position.set(ex, ez + 1.8, ey + 0.2);
      controlsRef.current.target.set(ex, ez + 1.6, ey + 15);
      camera.up.set(0, 1, 0);
    } else if (cameraMode === 'follow') {
      const [ex, ey, ez] = egoVehicle.position;
      camera.position.set(ex - 8, ez + 6, ey - 12);
      controlsRef.current.target.set(ex, ez + 1, ey + 4);
      camera.up.set(0, 1, 0);
    } else if (cameraMode === 'orbit') {
      if (prevMode.current === 'top' || prevMode.current === 'firstPerson') {
        camera.position.set(22, 18, 30);
        controlsRef.current.target.set(0, 0, 0);
        camera.up.set(0, 1, 0);
      }
    } else if (cameraMode === 'free') {
      camera.up.set(0, 1, 0);
    }
    prevMode.current = cameraMode;
    controlsRef.current.update();
  }, [cameraMode, camera, egoVehicle.position]);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (cameraMode === 'follow') {
      const [ex, ey, ez] = egoVehicle.position;
      const targetPos = new THREE.Vector3(ex, ez + 1, ey);
      controlsRef.current.target.lerp(targetPos, 0.08);

      const desiredCamPos = new THREE.Vector3(ex - 6, ez + 6, ey - 14);
      camera.position.lerp(desiredCamPos, 0.08);
      controlsRef.current.update();
    } else if (cameraMode === 'firstPerson') {
      const [ex, ey, ez] = egoVehicle.position;
      camera.position.set(ex, ez + 1.8, ey + 0.3);
      controlsRef.current.target.set(ex, ez + 1.6, ey + 25);
      controlsRef.current.update();
    } else if (focusTarget && cameraMode !== 'free') {
      const targetVec = new THREE.Vector3(focusTarget[0], focusTarget[2] || 0.5, focusTarget[1]);
      controlsRef.current.target.lerp(targetVec, 0.06);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={
        cameraMode === 'top'
          ? 0.01
          : cameraMode === 'free'
          ? Math.PI - 0.01
          : Math.PI / 2 - 0.02
      }
      minPolarAngle={cameraMode === 'free' ? 0.01 : 0.01}
      minDistance={2}
      maxDistance={250}
    />
  );
};
