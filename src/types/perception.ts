export type ResolutionLevel = 0.05 | 0.10 | 0.25 | 0.50;

export type ObjectType = 'vehicle' | 'pedestrian' | 'cyclist' | 'static_obstacle';

export type MotionState = 'MOVING' | 'STATIC' | 'SLOWING' | 'ACCELERATING';

export type SemanticClass = 'Road' | 'Terrain' | 'Vehicle' | 'Pedestrian' | 'Cyclist' | 'Vegetation' | 'Barrier' | 'Obstacle';

export type TraversabilityLevel = 'HIGH' | 'CAUTION' | 'LOW' | 'IMPASSABLE';

export type VisualizationMode =
  | 'lidar'
  | 'semantic'
  | 'elevation'
  | 'dynamic'
  | 'traversability'
  | 'confidence'
  | 'resolution';

export type CameraMode = 'orbit' | 'follow' | 'top' | 'firstPerson' | 'free';

export interface LidarPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
  semanticClass: SemanticClass;
  dynamic: boolean;
  resolution: ResolutionLevel;
}

export interface LidarFrame {
  timestamp: number;
  frameNumber: number;
  points: Float32Array; // Flattened [x, y, z, r, g, b, intensity, classId] for 15,000+ points performance
  pointCount: number;
  scanAngle: number;
}

export interface DetectedObject {
  id: string;
  type: ObjectType;
  state: MotionState;
  position: [number, number, number]; // [x, y, z]
  velocity: [number, number, number]; // [vx, vy, vz]
  speed: number; // m/s
  heading: number; // radians
  dimensions: [number, number, number]; // [length, width, height]
  confidence: number; // 0.0 - 1.0
  dynamic: boolean;
  resolution: ResolutionLevel;
  distance: number; // Distance from Ego UGV (meters)
  trajectory: [number, number, number][]; // History trail
  predictedTrajectory: [number, number, number][]; // Predicted future path
  color?: string;
}

export interface ResolutionExplainability {
  distanceFactor: number; // 0.0 - 1.0
  dynamicActivity: number; // 0.0 - 1.0
  terrainComplexity: number; // 0.0 - 1.0
  risk: number; // 0.0 - 1.0
  uncertainty: number; // 0.0 - 1.0
  decision: string; // e.g. "REFINE REGION: 25 cm → 10 cm"
  decisionReason: string;
}

export interface MapCell {
  id: string;
  x: number;
  y: number;
  resolution: ResolutionLevel;
  elevation: number;
  slope: number; // degrees
  roughness: number; // 0.0 - 1.0
  occupancy: number; // 0.0 - 1.0
  semanticClass: SemanticClass;
  confidence: number;
  dynamicProbability: number;
  traversability: TraversabilityLevel;
  explainability: ResolutionExplainability;
  isRefinedLocally: boolean;
}

export interface EgoVehicleState {
  position: [number, number, number];
  heading: number;
  speed: number;
  lidarRpm: number;
  scannerAngle: number;
  sensorRange: number;
  status: 'ONLINE' | 'ACTIVE_SURVEY' | 'CALIBRATING';
}

export interface TelemetryMetrics {
  fps: number; // Simulated engine target
  actualFps: number; // Genuine browser RAF measured FPS
  latency: number; // ms
  ram: number; // MB
  gpu: number; // %
  pointsPerFrame: number;
  activeCells: number;
  fineRegions: number;
  mediumFineRegions: number;
  mediumRegions: number;
  coarseRegions: number;
}

export interface SimulationSettings {
  maxRange: number;
  pointSize: number;
  pointDensity: number;
  scanFrequency: number;
  nearThreshold: number;
  midThreshold: number;
  farThreshold: number;
  refinementSensitivity: number;
  fineRegionBudget: number;
  showGrid: boolean;
  showPoints: boolean;
  showBoundingBoxes: boolean;
  showLabels: boolean;
  showTrails: boolean;
  showTerrain: boolean;
  showScanBeam: boolean;
  vehicleCount: number;
  pedestrianCount: number;
  cyclistCount: number;
  objectSpeed: number;
  terrainComplexity: number;
}

export interface BenchmarkComparison {
  name: string;
  resolutionLabel: string;
  fps: number;
  latencyMs: number;
  memoryMb: number;
  activeCells: number;
  relativeBandwidth: number; // %
  perceptionAccuracy: number; // %
  description: string;
  pros: string;
  cons: string;
}
