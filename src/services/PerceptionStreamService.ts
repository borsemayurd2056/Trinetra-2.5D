import type {
  DetectedObject,
  EgoVehicleState,
  MapCell,
  SimulationSettings,
  TelemetryMetrics,
  VisualizationMode,
} from '../types/perception';
import type { LidarPointCloudBuffers } from '../simulation/lidarSimulator';
import type {
  DataSourceType,
  PointCloudStats,
  PreprocessingConfig,
  DatasetManifest,
} from '../types/lidar';
import { SimulationEngine } from '../simulation/simulationEngine';
import type { LiDARDataProvider, ProviderLoadingState } from '../data/providers/LiDARDataProvider';
import { MockLiDARProvider } from '../data/providers/MockLiDARProvider';
import { RecordedLiDARProvider } from '../data/providers/RecordedLiDARProvider';

export type PerceptionListener = () => void;

/**
 * PerceptionStreamService
 * 
 * Central decoupled data service that bridges the perception pipeline and the React UI.
 * In Phase 2, it manages the LiDARDataProvider abstraction, allowing instantaneous
 * switching between Simulation mode and Recorded Real LiDAR mode.
 */
class PerceptionStreamService {
  public engine: SimulationEngine;
  private mockProvider: MockLiDARProvider;
  private recordedProvider: RecordedLiDARProvider;
  private currentProvider: LiDARDataProvider;

  private dataSource: DataSourceType = 'simulation';
  private listeners: Set<PerceptionListener> = new Set();
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();
  private isLiveStreaming: boolean = true;

  constructor() {
    this.engine = new SimulationEngine();
    this.mockProvider = new MockLiDARProvider(this.engine);
    this.recordedProvider = new RecordedLiDARProvider();
    this.currentProvider = this.mockProvider;

    this.startLoop();
  }

  private startLoop = () => {
    const loop = (currentTime: number) => {
      const delta = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (this.isLiveStreaming && this.dataSource === 'simulation') {
        this.engine.update(currentTime / 1000, delta);
        this.notifyListeners();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  };

  public subscribe(listener: PerceptionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in PerceptionStreamService listener:', e);
      }
    });
  }

  // --- Data Source Switching (Phase 2 Core) ---

  public getDataSource(): DataSourceType {
    return this.dataSource;
  }

  public async setDataSource(source: DataSourceType): Promise<void> {
    if (this.dataSource === source) return;

    this.dataSource = source;
    if (source === 'simulation') {
      this.currentProvider = this.mockProvider;
    } else {
      this.currentProvider = this.recordedProvider;
      // Load current frame of active recorded dataset
      await this.recordedProvider.loadFrame(this.recordedProvider.getCurrentFrameIndex());
    }

    this.notifyListeners();
  }

  // --- Provider Interface Accessors ---

  public getActiveProvider(): LiDARDataProvider {
    return this.currentProvider;
  }

  public getPointCloudBuffers(mode: VisualizationMode): LidarPointCloudBuffers {
    return this.currentProvider.getPointCloudBuffers(mode);
  }

  public getTelemetry(): TelemetryMetrics {
    return this.currentProvider.getTelemetry();
  }

  public getFrameStats(): PointCloudStats | null {
    return this.currentProvider.getFrameStats();
  }

  public getLoadingState(): ProviderLoadingState {
    return this.currentProvider.getLoadingState();
  }

  public getAvailableDatasets(): DatasetManifest[] {
    return this.recordedProvider.getAvailableDatasets();
  }

  public getActiveDataset(): DatasetManifest | null {
    return this.recordedProvider.getActiveDataset();
  }

  public async selectDataset(datasetId: string): Promise<void> {
    await this.recordedProvider.selectDataset(datasetId);
    this.notifyListeners();
  }

  public async loadFrame(frameIndex: number): Promise<void> {
    await this.currentProvider.loadFrame(frameIndex);
    this.notifyListeners();
  }

  public setReplayFrame(frameIndex: number): void {
    this.currentProvider.setReplayFrame(frameIndex);
    this.notifyListeners();
  }

  public getFrameCount(): number {
    return this.currentProvider.getFrameCount();
  }

  public getCurrentFrameIndex(): number {
    return this.currentProvider.getCurrentFrameIndex();
  }

  public getPreprocessingConfig(): PreprocessingConfig {
    return this.currentProvider.getPreprocessingConfig();
  }

  public updatePreprocessingConfig(partial: Partial<PreprocessingConfig>): void {
    this.currentProvider.updatePreprocessingConfig(partial);
    this.notifyListeners();
  }

  // --- Ego Vehicle, Objects & Cells ---

  public getEgoVehicle(): EgoVehicleState {
    if (this.dataSource === 'simulation') {
      return this.engine.getEgoVehicle();
    }
    // In Recorded LiDAR mode: UGV represents sensor rig origin
    return {
      position: [0, 0, 0.4],
      heading: 0,
      speed: 0,
      lidarRpm: 600,
      scannerAngle: 0,
      sensorRange: this.currentProvider.getPreprocessingConfig().maxRange,
      status: 'ONLINE',
    };
  }

  public getObjects(): DetectedObject[] {
    if (this.dataSource === 'simulation') {
      return this.engine.getObjects();
    }
    // In Phase 2 Recorded mode: Raw LiDAR only. AI dynamic object detection is Phase 3!
    return [];
  }

  public getMapCells(): MapCell[] {
    if (this.dataSource === 'simulation') {
      return this.engine.getMapCells();
    }
    // In Phase 2 Recorded mode: AI 2.5D mapping is Phase 3!
    return [];
  }

  public getSettings(): SimulationSettings {
    return this.engine.getSettings();
  }

  public updateSettings(partial: Partial<SimulationSettings>): void {
    this.engine.updateSettings(partial);
    this.notifyListeners();
  }

  public getReplayBuffer() {
    return this.engine.getReplayBuffer();
  }

  public applyReplayFrame(frame: any): void {
    this.engine.applyReplayFrame(frame);
    this.notifyListeners();
  }

  public getMissionTimeFormatted(): string {
    return this.engine.getMissionTimeFormatted();
  }

  public setStreamingState(active: boolean) {
    this.isLiveStreaming = active;
  }

  public getStreamingState(): boolean {
    return this.isLiveStreaming;
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.listeners.clear();
  }
}

// Global Singleton instance
export const perceptionService = new PerceptionStreamService();
