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
} from '../../types/lidar';
import { SimulationEngine } from '../../simulation/simulationEngine';

export class MockLiDARProvider implements LiDARDataProvider {
  public readonly id = 'simulation' as const;
  public readonly name = 'Phase 1 Procedural LiDAR Simulation';

  private engine: SimulationEngine;
  private config: PreprocessingConfig = {
    minRange: 0.5,
    maxRange: 75,
    minHeight: -3.0,
    maxHeight: 12.0,
    downsampleFactor: 1,
    voxelSize: 0,
    coordinatePreset: 'standard',
    invertX: false,
    invertY: false,
    invertZ: false,
    swapYZ: false,
  };

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public getPointCloudBuffers(mode: VisualizationMode): LidarPointCloudBuffers {
    return this.engine.getPointCloudBuffers(mode);
  }

  public getTelemetry(): TelemetryMetrics {
    return this.engine.getTelemetry();
  }

  public getFrameStats(): PointCloudStats | null {
    const telemetry = this.engine.getTelemetry();
    return {
      rawPointCount: telemetry.pointsPerFrame,
      processedPointCount: telemetry.pointsPerFrame,
      minX: -60.0,
      maxX: 60.0,
      minY: -2.0,
      maxY: 8.5,
      minZ: -60.0,
      maxZ: 60.0,
      avgIntensity: 0.68,
      hasIntensity: true,
      loadTimeMs: 0.1,
      preprocessTimeMs: 1.2,
      uploadTimeMs: 0.8,
      totalFrameTimeMs: 2.1,
    };
  }

  public getFrameCount(): number {
    return Math.max(1, this.engine.getReplayBuffer().length);
  }

  public getCurrentFrameIndex(): number {
    return Math.max(0, this.engine.getReplayBuffer().length - 1);
  }

  public async loadFrame(_frameIndex: number): Promise<void> {
    // In simulation mode, frames progress automatically with clock
  }

  public setReplayFrame(frameIndex: number): void {
    const buf = this.engine.getReplayBuffer();
    if (buf[frameIndex]) {
      this.engine.applyReplayFrame(buf[frameIndex]);
    }
  }

  public getPreprocessingConfig(): PreprocessingConfig {
    return this.config;
  }

  public updatePreprocessingConfig(partial: Partial<PreprocessingConfig>): void {
    this.config = { ...this.config, ...partial };
    if (partial.maxRange !== undefined) {
      this.engine.updateSettings({ maxRange: partial.maxRange });
    }
  }

  public getLoadingState(): ProviderLoadingState {
    return {
      isLoading: false,
      progressText: 'Simulation streaming active',
      error: null,
    };
  }

  public getAvailableDatasets(): DatasetManifest[] {
    return [];
  }

  public getActiveDataset(): DatasetManifest | null {
    return null;
  }

  public async selectDataset(_datasetId: string): Promise<void> {
    // No-op for simulation
  }
}
