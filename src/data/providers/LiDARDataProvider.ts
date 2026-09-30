import type {
  TelemetryMetrics,
  VisualizationMode,
} from '../../types/perception';
import type { LidarPointCloudBuffers } from '../../simulation/lidarSimulator';
import type {
  DataSourceType,
  PointCloudStats,
  PreprocessingConfig,
  DatasetManifest,
} from '../../types/lidar';

export interface ProviderLoadingState {
  isLoading: boolean;
  progressText: string;
  error: string | null;
}

export interface LiDARDataProvider {
  readonly id: DataSourceType;
  readonly name: string;

  /**
   * Returns current point cloud positions and colors for Three.js
   */
  getPointCloudBuffers(mode: VisualizationMode): LidarPointCloudBuffers;

  /**
   * Returns system telemetry
   */
  getTelemetry(): TelemetryMetrics;

  /**
   * Returns real frame statistics (points, bounding box, timing)
   */
  getFrameStats(): PointCloudStats | null;

  /**
   * Replay / navigation controls
   */
  getFrameCount(): number;
  getCurrentFrameIndex(): number;
  loadFrame(frameIndex: number): Promise<void>;
  setReplayFrame(frameIndex: number): void;

  /**
   * Configuration
   */
  getPreprocessingConfig(): PreprocessingConfig;
  updatePreprocessingConfig(partial: Partial<PreprocessingConfig>): void;
  getLoadingState(): ProviderLoadingState;

  /**
   * Dataset selection
   */
  getAvailableDatasets(): DatasetManifest[];
  getActiveDataset(): DatasetManifest | null;
  selectDataset(datasetId: string): Promise<void>;
}
