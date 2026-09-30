import {
  DetectedObject,
  EgoVehicleState,
  MapCell,
  SimulationSettings,
  TelemetryMetrics,
  VisualizationMode,
} from '../types/perception';
import { TerrainSimulator } from './terrainSimulator';
import { LidarSimulator, LidarPointCloudBuffers } from './lidarSimulator';
import { AdaptiveGridSimulator } from './adaptiveGridSimulator';

export class SimulationEngine {
  public terrain: TerrainSimulator;
  public lidar: LidarSimulator;
  public adaptiveGrid: AdaptiveGridSimulator;

  private egoVehicle: EgoVehicleState;
  private objects: DetectedObject[] = [];
  private currentFrameIndex: number = 0;
  private missionStartTime: number = Date.now() - 3600 * 1000 * 4; // 4 hours in
  private scannerAngle: number = 0;

  // Replay buffer (stores simulated frames)
  private replayBuffer: Array<{
    frameNumber: number;
    timestamp: number;
    ego: EgoVehicleState;
    objects: DetectedObject[];
    telemetry: TelemetryMetrics;
  }> = [];
  private maxReplayFrames: number = 200;

  // Real browser FPS measurement
  private frameCount: number = 0;
  private lastFpsUpdateTime: number = performance.now();
  private measuredActualFps: number = 60;

  private settings: SimulationSettings = {
    maxRange: 75,
    pointSize: 2.2,
    pointDensity: 1.0,
    scanFrequency: 10, // 10 Hz (600 RPM)
    nearThreshold: 12,
    midThreshold: 28,
    farThreshold: 52,
    refinementSensitivity: 0.85,
    fineRegionBudget: 250,
    showGrid: true,
    showPoints: true,
    showBoundingBoxes: true,
    showLabels: true,
    showTrails: true,
    showTerrain: true,
    showScanBeam: true,
    vehicleCount: 4,
    pedestrianCount: 3,
    cyclistCount: 1,
    objectSpeed: 1.0,
    terrainComplexity: 1.0,
  };

  constructor() {
    this.terrain = new TerrainSimulator(1.0);
    this.lidar = new LidarSimulator(this.terrain);
    this.adaptiveGrid = new AdaptiveGridSimulator(this.terrain);

    this.egoVehicle = {
      position: [0, 0, 0.4],
      heading: 0,
      speed: 0,
      lidarRpm: 600,
      scannerAngle: 0,
      sensorRange: 75,
      status: 'ONLINE',
    };

    this.initEntities();
  }

  private initEntities() {
    this.objects = [
      // Vehicle 1: Scout Truck heading North
      {
        id: 'OBJ-01',
        type: 'vehicle',
        state: 'MOVING',
        position: [1.8, 14, 0.3],
        velocity: [0.1, 4.8, 0],
        speed: 4.8,
        heading: Math.PI / 2,
        dimensions: [4.4, 1.9, 1.6],
        confidence: 0.96,
        dynamic: true,
        resolution: 0.10,
        distance: 14.1,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Vehicle 2: Autonomous Transport heading South
      {
        id: 'OBJ-02',
        type: 'vehicle',
        state: 'MOVING',
        position: [-1.8, 38, 0.4],
        velocity: [-0.1, -5.2, 0],
        speed: 5.2,
        heading: -Math.PI / 2,
        dimensions: [4.8, 2.0, 1.8],
        confidence: 0.94,
        dynamic: true,
        resolution: 0.10,
        distance: 38.0,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Vehicle 3: Logistics Hauler at intersection
      {
        id: 'OBJ-03',
        type: 'vehicle',
        state: 'MOVING',
        position: [18, -12, 0.5],
        velocity: [-3.2, 0.5, 0],
        speed: 3.2,
        heading: Math.PI,
        dimensions: [5.2, 2.2, 2.1],
        confidence: 0.91,
        dynamic: true,
        resolution: 0.10,
        distance: 21.6,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Vehicle 4: Perimeter Patrol Buggy
      {
        id: 'OBJ-04',
        type: 'vehicle',
        state: 'MOVING',
        position: [-22, -20, 0.6],
        velocity: [2.5, 1.8, 0],
        speed: 3.1,
        heading: 0.6,
        dimensions: [3.8, 1.8, 1.5],
        confidence: 0.89,
        dynamic: true,
        resolution: 0.25,
        distance: 29.7,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Pedestrian 1: Field Engineer crossing road
      {
        id: 'OBJ-05',
        type: 'pedestrian',
        state: 'MOVING',
        position: [-3.5, 8, 0.2],
        velocity: [1.2, 0.1, 0],
        speed: 1.2,
        heading: 0,
        dimensions: [0.6, 0.6, 1.75],
        confidence: 0.97,
        dynamic: true,
        resolution: 0.05,
        distance: 8.7,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Pedestrian 2: Tactical Observer walking shoulder
      {
        id: 'OBJ-06',
        type: 'pedestrian',
        state: 'MOVING',
        position: [4.2, 24, 0.3],
        velocity: [0.0, 1.4, 0],
        speed: 1.4,
        heading: Math.PI / 2,
        dimensions: [0.6, 0.6, 1.8],
        confidence: 0.95,
        dynamic: true,
        resolution: 0.10,
        distance: 24.3,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Pedestrian 3: Distant Observer (64m away! Demonstrates local refinement in 50cm far-field)
      {
        id: 'OBJ-07',
        type: 'pedestrian',
        state: 'MOVING',
        position: [-28, 58, 1.8],
        velocity: [0.8, -0.4, 0],
        speed: 0.9,
        heading: -0.4,
        dimensions: [0.6, 0.6, 1.75],
        confidence: 0.88,
        dynamic: true,
        resolution: 0.10,
        distance: 64.4,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Cyclist 1: Rapid Courier biking on shoulder
      {
        id: 'OBJ-08',
        type: 'cyclist',
        state: 'MOVING',
        position: [3.8, -18, 0.3],
        velocity: [0.2, 4.1, 0],
        speed: 4.1,
        heading: Math.PI / 2,
        dimensions: [1.8, 0.6, 1.6],
        confidence: 0.92,
        dynamic: true,
        resolution: 0.10,
        distance: 18.4,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Static Obstacle 1: Security Barrier Checkpoint
      {
        id: 'OBJ-09',
        type: 'static_obstacle',
        state: 'STATIC',
        position: [6.5, 6.0, 0.5],
        velocity: [0, 0, 0],
        speed: 0,
        heading: 0,
        dimensions: [2.5, 0.8, 1.0],
        confidence: 0.99,
        dynamic: false,
        resolution: 0.05,
        distance: 8.8,
        trajectory: [],
        predictedTrajectory: [],
      },
      // Static Obstacle 2: Weather Sensor Mast
      {
        id: 'OBJ-10',
        type: 'static_obstacle',
        state: 'STATIC',
        position: [-8.0, -8.0, 1.2],
        velocity: [0, 0, 0],
        speed: 0,
        heading: 0,
        dimensions: [0.8, 0.8, 3.2],
        confidence: 0.98,
        dynamic: false,
        resolution: 0.05,
        distance: 11.3,
        trajectory: [],
        predictedTrajectory: [],
      },
    ];
  }

  public update(time: number, delta: number): void {
    const dt = Math.min(delta, 0.1);
    this.currentFrameIndex++;

    // Measure true browser RAF FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdateTime >= 500) {
      this.measuredActualFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime));
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;
    }

    // Update LiDAR rotating beam sweep (600 RPM = 10 rev/sec)
    const sweepRate = (this.settings.scanFrequency * 2 * Math.PI);
    this.scannerAngle = (this.scannerAngle + sweepRate * dt) % (2 * Math.PI);
    this.egoVehicle.scannerAngle = this.scannerAngle;

    const speedScale = this.settings.objectSpeed;

    // Update dynamic entities along continuous looping paths
    for (const obj of this.objects) {
      if (!obj.dynamic) continue;

      let [x, y] = [obj.position[0], obj.position[1]];

      if (obj.id === 'OBJ-01') {
        // Vehicle 1: Moves North along road [1.8, y]
        y += obj.speed * speedScale * dt;
        if (y > 60) y = -50;
        x = Math.sin(y * 0.05) * 4.0 + 1.8;
      } else if (obj.id === 'OBJ-02') {
        // Vehicle 2: Moves South along road [-1.8, y]
        y -= obj.speed * speedScale * dt;
        if (y < -50) y = 60;
        x = Math.sin(y * 0.05) * 4.0 - 1.8;
      } else if (obj.id === 'OBJ-03') {
        // Vehicle 3: Crosses east-west across terrain
        x += obj.velocity[0] * speedScale * dt;
        if (x < -35) x = 35;
        y = -12 + Math.sin(x * 0.1) * 3;
      } else if (obj.id === 'OBJ-04') {
        // Vehicle 4: Perimeter patrol loop
        const angle = time * 0.2 * speedScale;
        x = Math.cos(angle) * 32;
        y = Math.sin(angle) * 32;
        obj.heading = angle + Math.PI / 2;
      } else if (obj.id === 'OBJ-05') {
        // Pedestrian 1: Crosses road back and forth
        x += obj.velocity[0] * speedScale * dt;
        if (x > 5.5) obj.velocity[0] = -Math.abs(obj.velocity[0]);
        if (x < -5.5) obj.velocity[0] = Math.abs(obj.velocity[0]);
        obj.heading = obj.velocity[0] > 0 ? 0 : Math.PI;
      } else if (obj.id === 'OBJ-06') {
        // Pedestrian 2: Walks North on shoulder
        y += obj.speed * speedScale * dt;
        if (y > 45) y = -10;
        x = Math.sin(y * 0.05) * 4.0 + 4.2;
      } else if (obj.id === 'OBJ-07') {
        // Pedestrian 3: Distant observer wandering in far-field
        const wander = time * 0.3 * speedScale;
        x = -28 + Math.cos(wander) * 6;
        y = 58 + Math.sin(wander) * 5;
      } else if (obj.id === 'OBJ-08') {
        // Cyclist 1: Bikes North rapidly
        y += obj.speed * speedScale * dt;
        if (y > 55) y = -45;
        x = Math.sin(y * 0.05) * 4.0 + 3.6;
      }

      // Elevate to terrain surface height
      const z = this.terrain.getElevation(x, y);
      obj.position = [x, y, z];

      // Distance from ego
      const dist = Math.sqrt(x * x + y * y);
      obj.distance = parseFloat(dist.toFixed(1));

      // A-FUSE Dynamic Resolution allocation for objects:
      // Even far-field pedestrians get refined to 10cm or 5cm!
      if (dist < this.settings.nearThreshold) {
        obj.resolution = 0.05;
      } else if (obj.type === 'pedestrian' || obj.type === 'cyclist') {
        obj.resolution = dist < 45 ? 0.05 : 0.10; // Refined precision for vulnerable road users
      } else if (dist < this.settings.midThreshold) {
        obj.resolution = 0.10;
      } else {
        obj.resolution = 0.10; // Dynamic vehicles in far-field stay refined to 10cm!
      }

      // Record trajectory history breadcrumbs
      if (this.currentFrameIndex % 4 === 0) {
        obj.trajectory.push([x, y, z + 0.1]);
        if (obj.trajectory.length > 35) {
          obj.trajectory.shift();
        }

        // Compute predicted lookahead trajectory (next 3 seconds)
        const pred: [number, number, number][] = [];
        for (let s = 1; s <= 6; s++) {
          const px = x + obj.velocity[0] * (s * 0.5);
          const py = y + obj.velocity[1] * (s * 0.5);
          const pz = this.terrain.getElevation(px, py);
          pred.push([px, py, pz + 0.1]);
        }
        obj.predictedTrajectory = pred;
      }
    }

    // Save frame to replay buffer periodically
    if (this.currentFrameIndex % 6 === 0) {
      const telemetry = this.getTelemetry();
      this.replayBuffer.push({
        frameNumber: this.currentFrameIndex,
        timestamp: Date.now(),
        ego: { ...this.egoVehicle },
        objects: JSON.parse(JSON.stringify(this.objects)),
        telemetry,
      });
      if (this.replayBuffer.length > this.maxReplayFrames) {
        this.replayBuffer.shift();
      }
    }
  }

  public getEgoVehicle(): EgoVehicleState {
    return this.egoVehicle;
  }

  public getObjects(): DetectedObject[] {
    return this.objects;
  }

  public getMapCells(): MapCell[] {
    return this.adaptiveGrid.generateCells(
      this.egoVehicle.position,
      this.objects,
      this.settings
    );
  }

  public getPointCloudBuffers(mode: VisualizationMode): LidarPointCloudBuffers {
    return this.lidar.generateFrame(
      this.egoVehicle.position,
      this.scannerAngle,
      this.objects,
      mode,
      this.settings
    );
  }

  public getTelemetry(): TelemetryMetrics {
    // Realistic simulated telemetry with subtle dynamic jitter
    const now = performance.now();
    const jitter = Math.sin(now * 0.003);

    return {
      fps: Math.round(38 + jitter * 2.5),
      actualFps: this.measuredActualFps,
      latency: Math.round(27 + jitter * 3.0),
      ram: Math.round(412 + jitter * 12.0),
      gpu: Math.round(64 + jitter * 5.0),
      pointsPerFrame: Math.round(124832 + jitter * 3200),
      activeCells: 1855,
      fineRegions: 124,
      mediumFineRegions: 312,
      mediumRegions: 527,
      coarseRegions: 892,
    };
  }

  public getSettings(): SimulationSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<SimulationSettings>): void {
    this.settings = { ...this.settings, ...partial };
    if (partial.terrainComplexity !== undefined) {
      this.terrain.setComplexity(partial.terrainComplexity);
    }
  }

  public getReplayBuffer() {
    return this.replayBuffer;
  }

  public applyReplayFrame(frame: any): void {
    if (!frame) return;
    this.egoVehicle = { ...frame.ego };
    this.objects = JSON.parse(JSON.stringify(frame.objects));
  }

  public getMissionTimeFormatted(): string {
    const elapsed = Date.now() - this.missionStartTime;
    const hours = Math.floor(elapsed / 3600000) % 24;
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
