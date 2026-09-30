import type {
  DetectedObject,
  VisualizationMode,
  SimulationSettings,
  ResolutionLevel,
} from '../types/perception';
import { TerrainSimulator } from './terrainSimulator';

export interface LidarPointCloudBuffers {
  positions: Float32Array;
  colors: Float32Array;
  intensities: Float32Array;
  count: number;
}

export class LidarSimulator {
  private terrain: TerrainSimulator;
  private staticPointCache: {
    positions: number[];
    semantics: number[];
    isStaticObstacle: boolean[];
  } | null = null;

  constructor(terrain: TerrainSimulator) {
    this.terrain = terrain;
  }

  /**
   * Pre-generates the static environment point distribution (terrain, road, trees, walls, barriers)
   * to ensure ultra-smooth 60 FPS performance while updating dynamic objects frame-by-frame.
   */
  private initStaticPoints(pointBudget: number) {
    const positions: number[] = [];
    const semantics: number[] = []; // 0: Road, 1: Terrain, 2: Vegetation, 3: Barrier, 4: Obstacle
    const isStaticObstacle: boolean[] = [];

    const radius = 60.0;

    // 1. Terrain and Road points (Rings mimicking 64-beam/128-beam mechanical LiDAR)
    const numRings = Math.floor(Math.sqrt(pointBudget) * 0.7);
    for (let r = 1; r <= numRings; r++) {
      const ringDist = Math.pow(r / numRings, 1.4) * radius;
      const pointsInRing = Math.floor(18 + r * 5.2);
      for (let i = 0; i < pointsInRing; i++) {
        const angle = (i / pointsInRing) * Math.PI * 2 + (r % 2 ? 0.05 : 0);
        const x = Math.cos(angle) * ringDist;
        const y = Math.sin(angle) * ringDist;
        const sample = this.terrain.sample(x, y);

        // Add slight sensor noise (Gaussian approximation ±1.5cm)
        const noiseZ = (Math.random() - 0.5) * 0.03;
        positions.push(x, sample.z + noiseZ, y);

        if (sample.isRoad) {
          semantics.push(0); // Road
          isStaticObstacle.push(false);
        } else if (sample.semanticClass === 'Vegetation') {
          semantics.push(2); // Vegetation
          isStaticObstacle.push(false);
        } else {
          semantics.push(1); // Terrain
          isStaticObstacle.push(false);
        }
      }
    }

    // 2. Concrete Barriers / Guardrails along the road
    for (let y = -45; y <= 45; y += 1.2) {
      const roadCenterX = Math.sin(y * 0.05) * 4.0;
      for (const side of [-1, 1]) {
        const x = roadCenterX + side * 4.8;
        const groundZ = this.terrain.getElevation(x, y);
        // Vertical post points
        for (let h = 0.1; h <= 0.8; h += 0.2) {
          positions.push(x, groundZ + h, y);
          semantics.push(3); // Barrier
          isStaticObstacle.push(true);
        }
      }
    }

    // 3. Trees and Shrubs (Canopy clusters)
    const treePositions = [
      [12, 18], [16, 32], [22, -15], [-18, 25], [-24, -10],
      [28, 8], [-15, -30], [35, -22], [-32, 14], [10, -38]
    ];
    for (const [tx, ty] of treePositions) {
      const groundZ = this.terrain.getElevation(tx, ty);
      // Trunk points
      for (let tz = 0.2; tz <= 2.2; tz += 0.3) {
        positions.push(tx + (Math.random() - 0.5) * 0.3, groundZ + tz, ty + (Math.random() - 0.5) * 0.3);
        semantics.push(2); // Vegetation
        isStaticObstacle.push(true);
      }
      // Canopy cluster
      for (let c = 0; c < 45; c++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const r = 1.2 + Math.random() * 1.5;
        const cx = tx + r * Math.sin(theta) * Math.cos(phi);
        const cy = ty + r * Math.sin(theta) * Math.sin(phi);
        const cz = groundZ + 2.5 + r * Math.cos(theta);
        positions.push(cx, cz, cy);
        semantics.push(2);
        isStaticObstacle.push(true);
      }
    }

    // 4. Large Rocky Boulders / Static Obstacles
    const boulderPositions = [
      [-14, 12], [18, -8], [24, 26], [-20, -18]
    ];
    for (const [bx, by] of boulderPositions) {
      const groundZ = this.terrain.getElevation(bx, by);
      for (let b = 0; b < 30; b++) {
        const ox = bx + (Math.random() - 0.5) * 2.2;
        const oy = by + (Math.random() - 0.5) * 2.2;
        const oz = groundZ + Math.random() * 1.4;
        positions.push(ox, oz, oy);
        semantics.push(4); // Obstacle
        isStaticObstacle.push(true);
      }
    }

    this.staticPointCache = {
      positions,
      semantics,
      isStaticObstacle,
    };
  }

  /**
   * Generates the dynamic point cloud for the current frame
   */
  public generateFrame(
    egoPos: [number, number, number],
    scannerAngle: number,
    objects: DetectedObject[],
    mode: VisualizationMode,
    settings: SimulationSettings
  ): LidarPointCloudBuffers {
    const targetPoints = Math.max(8000, Math.min(25000, Math.floor(settings.pointDensity * 16000)));

    if (!this.staticPointCache || this.staticPointCache.positions.length / 3 !== targetPoints) {
      this.initStaticPoints(targetPoints);
    }

    const staticCache = this.staticPointCache!;
    const staticCount = staticCache.positions.length / 3;

    // Estimate total points including dynamic objects
    let dynamicPointsCount = 0;
    for (const obj of objects) {
      if (obj.type === 'vehicle') dynamicPointsCount += 90;
      else if (obj.type === 'pedestrian') dynamicPointsCount += 35;
      else if (obj.type === 'cyclist') dynamicPointsCount += 50;
      else dynamicPointsCount += 25;
    }

    const totalCount = staticCount + dynamicPointsCount;
    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const intensities = new Float32Array(totalCount);

    let pIdx = 0;
    let cIdx = 0;
    let iIdx = 0;

    // Helper color setters
    const setColor = (r: number, g: number, b: number) => {
      colors[cIdx++] = r;
      colors[cIdx++] = g;
      colors[cIdx++] = b;
    };

    // Helper for elevation colormap
    const setElevationColor = (z: number) => {
      const normalized = Math.max(0, Math.min(1, (z + 2.0) / 6.0));
      if (normalized < 0.25) {
        const t = normalized / 0.25;
        setColor(0.1, 0.3 + 0.6 * t, 0.9);
      } else if (normalized < 0.5) {
        const t = (normalized - 0.25) / 0.25;
        setColor(0.1, 0.9, 0.9 - 0.7 * t);
      } else if (normalized < 0.75) {
        const t = (normalized - 0.5) / 0.25;
        setColor(0.2 + 0.8 * t, 0.9, 0.1);
      } else {
        const t = (normalized - 0.75) / 0.25;
        setColor(1.0, 0.9 - 0.8 * t, 0.1);
      }
    };

    // Helper for resolution colormap: 5cm=cyan, 10cm=emerald, 25cm=amber, 50cm=violet
    const setResolutionColor = (res: ResolutionLevel) => {
      if (res === 0.05) setColor(0.0, 0.95, 1.0); // 5cm Fine Cyan
      else if (res === 0.10) setColor(0.06, 0.82, 0.52); // 10cm Medium-Fine Emerald
      else if (res === 0.25) setColor(0.96, 0.62, 0.04); // 25cm Medium Amber
      else setColor(0.55, 0.36, 0.96); // 50cm Coarse Violet
    };

    // Populate static points
    for (let i = 0; i < staticCount; i++) {
      const x = staticCache.positions[i * 3];
      const z = staticCache.positions[i * 3 + 1];
      const y = staticCache.positions[i * 3 + 2];
      const sem = staticCache.semantics[i];

      positions[pIdx++] = x;
      positions[pIdx++] = z;
      positions[pIdx++] = y;

      const dist = Math.sqrt((x - egoPos[0]) ** 2 + (y - egoPos[1]) ** 2);
      
      // Calculate angular proximity to scanner angle
      const ptAngle = Math.atan2(y - egoPos[1], x - egoPos[0]);
      let angleDiff = Math.abs(ptAngle - scannerAngle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
      const scanHighlight = angleDiff < 0.25 ? 0.35 : 0.0;

      const intensity = Math.max(0.1, Math.min(1.0, 1.0 - (dist / settings.maxRange) * 0.85 + scanHighlight));
      intensities[iIdx++] = intensity;

      // Color based on active visualization mode
      switch (mode) {
        case 'lidar': {
          const val = intensity;
          setColor(val * 0.2, val * 0.9, val * 1.0);
          break;
        }
        case 'semantic': {
          if (sem === 0) setColor(0.35, 0.40, 0.48); // Road: asphalt slate
          else if (sem === 1) setColor(0.38, 0.32, 0.24); // Terrain: earth
          else if (sem === 2) setColor(0.15, 0.65, 0.25); // Vegetation: green
          else if (sem === 3) setColor(0.70, 0.30, 0.85); // Barrier: purple
          else setColor(0.90, 0.25, 0.25); // Obstacle: crimson
          break;
        }
        case 'elevation': {
          setElevationColor(z);
          break;
        }
        case 'dynamic': {
          setColor(0.18, 0.22, 0.28);
          break;
        }
        case 'traversability': {
          if (sem === 0) setColor(0.06, 0.85, 0.45); // Safe green
          else if (sem === 3 || sem === 4) setColor(0.95, 0.15, 0.20); // Impassable red
          else {
            const slope = this.terrain.sample(x, y).slope;
            if (slope > 18) setColor(0.95, 0.15, 0.20);
            else if (slope > 10) setColor(0.95, 0.75, 0.10);
            else setColor(0.10, 0.70, 0.35);
          }
          break;
        }
        case 'confidence': {
          const conf = Math.max(0.65, 1.0 - (dist / 70) * 0.35);
          setColor(0.1, conf * 0.9, 0.4);
          break;
        }
        case 'resolution': {
          let res: ResolutionLevel = 0.50;
          if (dist < settings.nearThreshold) res = 0.05;
          else if (dist < settings.midThreshold) res = 0.10;
          else if (dist < settings.farThreshold) res = 0.25;
          setResolutionColor(res);
          break;
        }
      }
    }

    // Populate dynamic object points (Vehicles, Pedestrians, Cyclists)
    for (const obj of objects) {
      const [ox, oy, oz] = obj.position;
      const [l, w, h] = obj.dimensions;
      const count = obj.type === 'vehicle' ? 90 : obj.type === 'pedestrian' ? 35 : 50;

      for (let j = 0; j < count; j++) {
        const u = (Math.random() - 0.5) * l;
        const v = (Math.random() - 0.5) * w;
        const wZ = Math.random() * h;

        const cosH = Math.cos(obj.heading);
        const sinH = Math.sin(obj.heading);
        const rotX = u * cosH - v * sinH;
        const rotY = u * sinH + v * cosH;

        const px = ox + rotX;
        const py = oy + rotY;
        const pz = oz + wZ;

        positions[pIdx++] = px;
        positions[pIdx++] = pz;
        positions[pIdx++] = py;

        intensities[iIdx++] = 0.95;

        switch (mode) {
          case 'lidar': {
            setColor(0.9, 0.95, 1.0);
            break;
          }
          case 'semantic': {
            if (obj.type === 'vehicle') setColor(0.0, 0.85, 1.0);
            else if (obj.type === 'pedestrian') setColor(1.0, 0.55, 0.1);
            else if (obj.type === 'cyclist') setColor(0.2, 0.95, 0.5);
            else setColor(0.9, 0.2, 0.2);
            break;
          }
          case 'elevation': {
            setElevationColor(pz);
            break;
          }
          case 'dynamic': {
            if (obj.dynamic && obj.speed > 0.5) {
              const speedRatio = Math.min(1.0, obj.speed / 12.0);
              setColor(1.0, 0.2 + (1.0 - speedRatio) * 0.6, 0.1);
            } else {
              setColor(0.5, 0.5, 0.6);
            }
            break;
          }
          case 'traversability': {
            setColor(0.95, 0.15, 0.25);
            break;
          }
          case 'confidence': {
            setColor(0.05, 0.95, 0.5);
            break;
          }
          case 'resolution': {
            setResolutionColor(obj.resolution);
            break;
          }
        }
      }
    }

    return {
      positions,
      colors,
      intensities,
      count: totalCount,
    };
  }
}
