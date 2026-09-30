import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type {
  CameraMode,
  DetectedObject,
  EgoVehicleState,
  MapCell,
  SimulationSettings,
  TelemetryMetrics,
  VisualizationMode,
} from '../types/perception';
import type { PageId } from '../types/navigation';
import type {
  DataSourceType,
  PointCloudStats,
  PreprocessingConfig,
  DatasetManifest,
} from '../types/lidar';
import type { ProviderLoadingState } from '../data/providers/LiDARDataProvider';
import { perceptionService } from '../services/PerceptionStreamService';

interface PerceptionContextValue {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  selectedObject: DetectedObject | null;
  setSelectedObject: (obj: DetectedObject | null) => void;
  selectedCell: MapCell | null;
  setSelectedCell: (cell: MapCell | null) => void;
  focusTarget: [number, number, number] | null;
  setFocusTarget: (target: [number, number, number] | null) => void;
  egoVehicle: EgoVehicleState;
  objects: DetectedObject[];
  cells: MapCell[];
  telemetry: TelemetryMetrics;
  settings: SimulationSettings;
  updateSettings: (partial: Partial<SimulationSettings>) => void;
  missionTime: string;
  isStreaming: boolean;
  toggleStreaming: () => void;

  // Phase 2 Real LiDAR Data Extensions
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => Promise<void>;
  pointCloudStats: PointCloudStats | null;
  preprocessingConfig: PreprocessingConfig;
  updatePreprocessingConfig: (partial: Partial<PreprocessingConfig>) => void;
  availableDatasets: DatasetManifest[];
  activeDataset: DatasetManifest | null;
  selectDataset: (datasetId: string) => Promise<void>;
  loadingState: ProviderLoadingState;
  recordedFrameIndex: number;
  recordedFrameCount: number;
  loadRecordedFrame: (index: number) => Promise<void>;
}

const PerceptionContext = createContext<PerceptionContextValue | null>(null);

export const PerceptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('live-perception');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('lidar');
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);

  // Dynamic state populated from service
  const [dataSource, setDataSourceState] = useState<DataSourceType>(() => perceptionService.getDataSource());
  const [egoVehicle, setEgoVehicle] = useState<EgoVehicleState>(() => perceptionService.getEgoVehicle());
  const [objects, setObjects] = useState<DetectedObject[]>(() => perceptionService.getObjects());
  const [cells, setCells] = useState<MapCell[]>(() => perceptionService.getMapCells());
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>(() => perceptionService.getTelemetry());
  const [settings, setSettings] = useState<SimulationSettings>(() => perceptionService.getSettings());
  const [missionTime, setMissionTime] = useState<string>(() => perceptionService.getMissionTimeFormatted());
  const [isStreaming, setIsStreaming] = useState<boolean>(() => perceptionService.getStreamingState());

  // Phase 2 State
  const [pointCloudStats, setPointCloudStats] = useState<PointCloudStats | null>(() => perceptionService.getFrameStats());
  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>(() => perceptionService.getPreprocessingConfig());
  const [availableDatasets] = useState<DatasetManifest[]>(() => perceptionService.getAvailableDatasets());
  const [activeDataset, setActiveDataset] = useState<DatasetManifest | null>(() => perceptionService.getActiveDataset());
  const [loadingState, setLoadingState] = useState<ProviderLoadingState>(() => perceptionService.getLoadingState());
  const [recordedFrameIndex, setRecordedFrameIndex] = useState<number>(() => perceptionService.getCurrentFrameIndex());
  const [recordedFrameCount, setRecordedFrameCount] = useState<number>(() => perceptionService.getFrameCount());

  useEffect(() => {
    let lastUiUpdate = 0;

    const unsubscribe = perceptionService.subscribe(() => {
      const now = performance.now();
      if (now - lastUiUpdate > 33) {
        lastUiUpdate = now;
        setEgoVehicle(perceptionService.getEgoVehicle());
        setObjects([...perceptionService.getObjects()]);
        setTelemetry(perceptionService.getTelemetry());
        setMissionTime(perceptionService.getMissionTimeFormatted());
        setPointCloudStats(perceptionService.getFrameStats());
        setLoadingState(perceptionService.getLoadingState());
        setRecordedFrameIndex(perceptionService.getCurrentFrameIndex());
        setRecordedFrameCount(perceptionService.getFrameCount());
        setActiveDataset(perceptionService.getActiveDataset());

        if (perceptionService.getDataSource() === 'simulation' && Math.random() < 0.2) {
          setCells(perceptionService.getMapCells());
        } else if (perceptionService.getDataSource() === 'recorded') {
          setCells([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSetDataSource = async (source: DataSourceType) => {
    await perceptionService.setDataSource(source);
    setDataSourceState(source);
    setEgoVehicle(perceptionService.getEgoVehicle());
    setObjects(perceptionService.getObjects());
    setCells(perceptionService.getMapCells());
    setTelemetry(perceptionService.getTelemetry());
    setPointCloudStats(perceptionService.getFrameStats());
    setPreprocessingConfig(perceptionService.getPreprocessingConfig());
    setLoadingState(perceptionService.getLoadingState());
    setRecordedFrameIndex(perceptionService.getCurrentFrameIndex());
    setRecordedFrameCount(perceptionService.getFrameCount());
  };

  const handleSelectDataset = async (datasetId: string) => {
    await perceptionService.selectDataset(datasetId);
    setActiveDataset(perceptionService.getActiveDataset());
    setRecordedFrameCount(perceptionService.getFrameCount());
    setRecordedFrameIndex(perceptionService.getCurrentFrameIndex());
    setPointCloudStats(perceptionService.getFrameStats());
  };

  const handleLoadRecordedFrame = async (index: number) => {
    await perceptionService.loadFrame(index);
    setRecordedFrameIndex(perceptionService.getCurrentFrameIndex());
    setPointCloudStats(perceptionService.getFrameStats());
  };

  const handleUpdatePreprocessing = (partial: Partial<PreprocessingConfig>) => {
    perceptionService.updatePreprocessingConfig(partial);
    setPreprocessingConfig(perceptionService.getPreprocessingConfig());
    setPointCloudStats(perceptionService.getFrameStats());
  };

  const updateSettings = (partial: Partial<SimulationSettings>) => {
    perceptionService.updateSettings(partial);
    setSettings(perceptionService.getSettings());
    setCells(perceptionService.getMapCells());
  };

  const toggleStreaming = () => {
    const next = !isStreaming;
    perceptionService.setStreamingState(next);
    setIsStreaming(next);
  };

  const selectedObject = useMemo(() => {
    return objects.find((o) => o.id === selectedObjectId) || null;
  }, [objects, selectedObjectId]);

  const selectedCell = useMemo(() => {
    return cells.find((c) => c.id === selectedCellId) || null;
  }, [cells, selectedCellId]);

  const handleSelectObject = (obj: DetectedObject | null) => {
    setSelectedObjectId(obj ? obj.id : null);
    if (obj) {
      setSelectedCellId(null);
      setFocusTarget(obj.position);
    }
  };

  const handleSelectCell = (cell: MapCell | null) => {
    setSelectedCellId(cell ? cell.id : null);
    if (cell) {
      setSelectedObjectId(null);
      setFocusTarget([cell.x, cell.elevation, cell.y]);
    }
  };

  return (
    <PerceptionContext.Provider
      value={{
        activePage,
        setActivePage,
        visualizationMode,
        setVisualizationMode,
        cameraMode,
        setCameraMode,
        selectedObject,
        setSelectedObject: handleSelectObject,
        selectedCell,
        setSelectedCell: handleSelectCell,
        focusTarget,
        setFocusTarget,
        egoVehicle,
        objects,
        cells,
        telemetry,
        settings,
        updateSettings,
        missionTime,
        isStreaming,
        toggleStreaming,

        // Phase 2
        dataSource,
        setDataSource: handleSetDataSource,
        pointCloudStats,
        preprocessingConfig,
        updatePreprocessingConfig: handleUpdatePreprocessing,
        availableDatasets,
        activeDataset,
        selectDataset: handleSelectDataset,
        loadingState,
        recordedFrameIndex,
        recordedFrameCount,
        loadRecordedFrame: handleLoadRecordedFrame,
      }}
    >
      {children}
    </PerceptionContext.Provider>
  );
};

export const usePerception = () => {
  const ctx = useContext(PerceptionContext);
  if (!ctx) {
    throw new Error('usePerception must be used within PerceptionProvider');
  }
  return ctx;
};
