export type DataSourceType = 'simulation' | 'recorded';

export type CoordinatePreset = 'kitti' | 'ouster' | 'velodyne' | 'standard';

export interface RecordedLidarFrame {
  frameId: number;
  timestamp: number;
  rawPoints: Float32Array; // Original unmodified [x, y, z, intensity]
  processedPositions: Float32Array; // Transformed & filtered [x, y, z] for WebGL
  processedColors: Float32Array; // Colors [r, g, b] based on intensity or height
  processedIntensities: Float32Array;
  rawPointCount: number;
  processedPointCount: number;
  hasIntensity: boolean;
}

export interface PreprocessingConfig {
  minRange: number; // meters (e.g. 0.5m)
  maxRange: number; // meters (e.g. 100m)
  minHeight: number; // meters (e.g. -3.0m)
  maxHeight: number; // meters (e.g. 10.0m)
  downsampleFactor: number; // 1 = full, 2 = 50%, 4 = 25%
  voxelSize: number; // meters (0 = disabled, e.g. 0.05m or 0.1m)
  coordinatePreset: CoordinatePreset;
  invertX: boolean;
  invertY: boolean;
  invertZ: boolean;
  swapYZ: boolean;
}

export interface PointCloudStats {
  rawPointCount: number;
  processedPointCount: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  avgIntensity: number;
  hasIntensity: boolean;
  loadTimeMs: number;
  preprocessTimeMs: number;
  uploadTimeMs: number;
  totalFrameTimeMs: number;
}

export interface DatasetManifest {
  id: string;
  name: string;
  format: 'bin' | 'pcd' | 'ply';
  frameCount: number;
  fps: number;
  filePaths: string[];
  coordinatePreset: CoordinatePreset;
  description: string;
}
