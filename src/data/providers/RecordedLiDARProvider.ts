import type { LiDARDataProvider, ProviderLoadingState } from './LiDARDataProvider';
import type {
  TelemetryMetrics,
  VisualizationMode,
} from '../../types/perception';
import type { LidarPointCloudBuffers } from '../../simulation/lidarSimulator';
import type {
  PointCloudStats,
  PreprocessingConfig,
  DatasetManifest,
  RecordedLidarFrame,
} from '../../types/lidar';
import { BinLoader } from '../loaders/BinLoader';
import { PcdLoader } from '../loaders/PcdLoader';
import { PlyLoader } from '../loaders/PlyLoader';
import { PointCloudPreprocessor, PreprocessedPointCloud } from '../preprocessing/pointCloudPreprocessor';

export class RecordedLiDARProvider implements LiDARDataProvider {
  public readonly id = 'recorded' as const;
  public readonly name = 'Recorded LiDAR Dataset Player';

  private datasets: DatasetManifest[] = [];
  private activeDataset: DatasetManifest | null = null;
  private currentFrameIndex: number = 0;

  // Bounded Frame Cache (keeps at most 8 frames in memory to prevent memory bloat)
  private frameCache: Map<number, RecordedLidarFrame> = new Map();
  private maxCacheSize: number = 8;

  private currentPreprocessed: PreprocessedPointCloud | null = null;
  private currentStats: PointCloudStats | null = null;

  private loadingState: ProviderLoadingState = {
    isLoading: false,
    progressText: 'Ready',
    error: null,
  };

  private config: PreprocessingConfig = {
    minRange: 0.8,
    maxRange: 80.0,
    minHeight: -3.5,
    maxHeight: 15.0,
    downsampleFactor: 1,
    voxelSize: 0,
    coordinatePreset: 'kitti',
    invertX: false,
    invertY: false,
    invertZ: false,
    swapYZ: false,
  };

  // Measured browser RAF FPS
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();
  private measuredFps: number = 60;

  constructor() {
    this.initDatasets();
    if (this.datasets.length > 0) {
      this.activeDataset = this.datasets[0];
    }
  }

  private initDatasets() {
    this.datasets = [
      {
        id: 'kitti_samples',
        name: 'KITTI Raw Velodyne HDL-64E Sequence',
        format: 'bin',
        frameCount: 5,
        fps: 10,
        filePaths: [
          '/data/samples/kitti_frame_000000.bin',
          '/data/samples/kitti_frame_000001.bin',
          '/data/samples/kitti_frame_000002.bin',
          '/data/samples/kitti_frame_000003.bin',
          '/data/samples/kitti_frame_000004.bin',
        ],
        coordinatePreset: 'kitti',
        description: 'Recorded 64-beam Velodyne LiDAR point clouds in standard binary format (float32 [x, y, z, r]).',
      },
      {
        id: 'pcd_urban_sample',
        name: 'Urban Corridor Sample (.pcd)',
        format: 'pcd',
        frameCount: 1,
        fps: 10,
        filePaths: ['/data/samples/sample_urban.pcd'],
        coordinatePreset: 'standard',
        description: 'Standard Point Cloud Data format with coordinate fields and intensity.',
      },
      {
        id: 'ply_terrain_sample',
        name: 'Topographic Relief Sample (.ply)',
        format: 'ply',
        frameCount: 1,
        fps: 10,
        filePaths: ['/data/samples/sample_terrain.ply'],
        coordinatePreset: 'standard',
        description: 'Polygon file point cloud format with vertex spatial coordinates.',
      },
    ];
  }

  public getAvailableDatasets(): DatasetManifest[] {
    return this.datasets;
  }

  public getActiveDataset(): DatasetManifest | null {
    return this.activeDataset;
  }

  public async selectDataset(datasetId: string): Promise<void> {
    const ds = this.datasets.find((d) => d.id === datasetId);
    if (!ds) {
      throw new Error(`Dataset with ID "${datasetId}" not found.`);
    }
    this.activeDataset = ds;
    this.config.coordinatePreset = ds.coordinatePreset;
    this.frameCache.clear();
    this.currentFrameIndex = 0;
    await this.loadFrame(0);
  }

  public getFrameCount(): number {
    return this.activeDataset ? this.activeDataset.frameCount : 0;
  }

  public getCurrentFrameIndex(): number {
    return this.currentFrameIndex;
  }

  public async loadFrame(frameIndex: number): Promise<void> {
    if (!this.activeDataset || this.activeDataset.filePaths.length === 0) {
      this.loadingState = {
        isLoading: false,
        progressText: 'No dataset selected',
        error: 'No active dataset available',
      };
      return;
    }

    const clampedIdx = Math.max(0, Math.min(frameIndex, this.activeDataset.filePaths.length - 1));
    this.currentFrameIndex = clampedIdx;
    const url = this.activeDataset.filePaths[clampedIdx];

    this.loadingState = {
      isLoading: true,
      progressText: `Loading Frame ${clampedIdx + 1} / ${this.activeDataset.filePaths.length}...`,
      error: null,
    };

    try {
      let loadedData;
      if (this.activeDataset.format === 'bin') {
        loadedData = await BinLoader.loadFromUrl(url);
      } else if (this.activeDataset.format === 'pcd') {
        loadedData = await PcdLoader.loadFromUrl(url);
      } else if (this.activeDataset.format === 'ply') {
        loadedData = await PlyLoader.loadFromUrl(url);
      } else {
        throw new Error(`Unsupported format: ${this.activeDataset.format}`);
      }

      // Preprocess point cloud
      const uploadStart = performance.now();
      const preprocessed = PointCloudPreprocessor.process(
        loadedData.rawBuffer,
        loadedData.stride,
        this.config,
        loadedData.hasIntensity
      );
      const uploadTimeMs = parseFloat((performance.now() - uploadStart).toFixed(2));

      // Update true statistics
      preprocessed.stats.loadTimeMs = loadedData.loadTimeMs;
      preprocessed.stats.uploadTimeMs = uploadTimeMs;
      preprocessed.stats.totalFrameTimeMs = parseFloat(
        (loadedData.loadTimeMs + preprocessed.stats.preprocessTimeMs + uploadTimeMs).toFixed(2)
      );

      this.currentPreprocessed = preprocessed;
      this.currentStats = preprocessed.stats;

      // Update LRU cache
      if (this.frameCache.size >= this.maxCacheSize) {
        const oldestKey = this.frameCache.keys().next().value;
        if (oldestKey !== undefined) this.frameCache.delete(oldestKey);
      }

      this.frameCache.set(clampedIdx, {
        frameId: clampedIdx,
        timestamp: Date.now(),
        rawPoints: loadedData.rawBuffer,
        processedPositions: preprocessed.positions,
        processedColors: preprocessed.colors,
        processedIntensities: preprocessed.intensities,
        rawPointCount: loadedData.pointCount,
        processedPointCount: preprocessed.stats.processedPointCount,
        hasIntensity: loadedData.hasIntensity,
      });

      this.loadingState = {
        isLoading: false,
        progressText: `Frame ${clampedIdx + 1} loaded (${preprocessed.stats.processedPointCount} pts)`,
        error: null,
      };
    } catch (err: any) {
      console.error('Error loading recorded LiDAR frame:', err);
      this.loadingState = {
        isLoading: false,
        progressText: 'Error loading frame',
        error: err?.message || 'Failed to load recorded frame',
      };
    }
  }

  public setReplayFrame(frameIndex: number): void {
    this.loadFrame(frameIndex);
  }

  public getPointCloudBuffers(mode: VisualizationMode): LidarPointCloudBuffers {
    // Measure browser render tick
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.measuredFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    if (!this.currentPreprocessed || this.currentPreprocessed.positions.length === 0) {
      return {
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        intensities: new Float32Array(0),
        count: 0,
      };
    }

    const count = this.currentPreprocessed.stats.processedPointCount;
    const positions = this.currentPreprocessed.positions;
    const intensities = this.currentPreprocessed.intensities;
    const colors = new Float32Array(count * 3);

    // Dynamic coloring based on mode
    if (mode === 'elevation') {
      for (let i = 0; i < count; i++) {
        const y = positions[i * 3 + 1]; // Three.js Y is elevation
        const normY = Math.max(0, Math.min(1, (y + 2.0) / 6.0));
        colors[i * 3] = normY;
        colors[i * 3 + 1] = 1.0 - Math.abs(normY - 0.5) * 2;
        colors[i * 3 + 2] = 1.0 - normY;
      }
    } else {
      // Default LiDAR intensity colormap
      colors.set(this.currentPreprocessed.colors);
    }

    return {
      positions,
      colors,
      intensities,
      count,
    };
  }

  public getTelemetry(): TelemetryMetrics {
    const stats = this.currentStats;
    const rawCount = stats ? stats.rawPointCount : 0;

    return {
      fps: 10, // Dataset nominal 10 Hz rate
      actualFps: this.measuredFps,
      latency: stats ? Math.round(stats.totalFrameTimeMs) : 0,
      ram: Math.round(rawCount * 0.000016 * 1024), // Approx buffer memory in MB
      gpu: 45,
      pointsPerFrame: rawCount,
      activeCells: 0, // Phase 2 raw lidar has no 2.5D grid computed yet
      fineRegions: 0,
      mediumFineRegions: 0,
      mediumRegions: 0,
      coarseRegions: 0,
    };
  }

  public getFrameStats(): PointCloudStats | null {
    return this.currentStats;
  }

  public getPreprocessingConfig(): PreprocessingConfig {
    return this.config;
  }

  public updatePreprocessingConfig(partial: Partial<PreprocessingConfig>): void {
    this.config = { ...this.config, ...partial };
    // Re-process current frame with new config
    const cached = this.frameCache.get(this.currentFrameIndex);
    if (cached) {
      const uploadStart = performance.now();
      const preprocessed = PointCloudPreprocessor.process(
        cached.rawPoints,
        4,
        this.config,
        cached.hasIntensity
      );
      const uploadTimeMs = parseFloat((performance.now() - uploadStart).toFixed(2));
      preprocessed.stats.loadTimeMs = this.currentStats?.loadTimeMs || 0;
      preprocessed.stats.uploadTimeMs = uploadTimeMs;
      preprocessed.stats.totalFrameTimeMs = parseFloat(
        (preprocessed.stats.loadTimeMs + preprocessed.stats.preprocessTimeMs + uploadTimeMs).toFixed(2)
      );
      this.currentPreprocessed = preprocessed;
      this.currentStats = preprocessed.stats;
    }
  }

  public getLoadingState(): ProviderLoadingState {
    return this.loadingState;
  }
}
