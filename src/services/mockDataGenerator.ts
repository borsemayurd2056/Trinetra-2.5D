import { BenchmarkComparison } from '../types/perception';

/**
 * Benchmark comparisons between spatial representations
 * Clearly marked as DEMO / SIMULATED DATA for Phase 1 architectural evaluation.
 */
export const BENCHMARK_COMPARISONS: BenchmarkComparison[] = [
  {
    name: 'Uniform 5 cm',
    resolutionLabel: 'Fixed 0.05m Global Grid',
    fps: 14,
    latencyMs: 71,
    memoryMb: 1420,
    activeCells: 57600,
    relativeBandwidth: 100,
    perceptionAccuracy: 98.4,
    description: 'Ultra-dense uniform 5cm resolution across the entire 120m perception radius. Extremely high compute and bandwidth penalty.',
    pros: 'Maximum spatial detail everywhere without blindspots.',
    cons: 'Unviable for real-time mobile compute (low FPS, high latency, huge memory footprint).',
  },
  {
    name: 'Uniform 25 cm',
    resolutionLabel: 'Fixed 0.25m Global Grid',
    fps: 48,
    latencyMs: 21,
    memoryMb: 240,
    activeCells: 2304,
    relativeBandwidth: 16,
    perceptionAccuracy: 78.2,
    description: 'Coarse uniform 25cm grid. Fast computation but inadequate for thin obstacles, curbs, pedestrians, and fine traversability.',
    pros: 'High throughput and minimal memory consumption.',
    cons: 'Severe detail loss on curbs, small obstacles, and distant pedestrian boundaries.',
  },
  {
    name: 'Distance Adaptive',
    resolutionLabel: 'Concentric Range Rings (5/10/25/50cm)',
    fps: 32,
    latencyMs: 31,
    memoryMb: 580,
    activeCells: 7420,
    relativeBandwidth: 41,
    perceptionAccuracy: 86.5,
    description: 'Conventional range-based reduction (fine close, coarse far). Neglects distant high-risk obstacles and vulnerable road users.',
    pros: 'Decent overall efficiency scaling with sensor distance.',
    cons: 'Rigid geometry fails when critical dynamic actors appear in the coarse far-field.',
  },
  {
    name: 'A-FUSE 2.5D (Proposed)',
    resolutionLabel: 'Adaptive Variable Resolution with Local Refinement',
    fps: 38,
    latencyMs: 27,
    memoryMb: 412,
    activeCells: 1855,
    relativeBandwidth: 29,
    perceptionAccuracy: 95.8,
    description: 'Dynamic multi-criterion fusion: concentrates high resolution (5/10cm) on ego proximity, dynamic objects, and complex terrain hazards, while maintaining coarse (50cm) on benign open regions.',
    pros: 'High perception fidelity on critical actors while keeping memory and latency within real-time robotics constraints.',
    cons: 'Requires fast local refinement evaluation overhead.',
  },
];

export interface TerrainStatistics {
  averageSlope: number; // degrees
  maxSlope: number; // degrees
  averageRoughness: number;
  traversableAreaPercent: number; // %
  highRiskAreaCount: number;
  roadCoveragePercent: number;
  totalSurveyAreaSqM: number;
}

export const SIMULATED_TERRAIN_STATS: TerrainStatistics = {
  averageSlope: 6.2,
  maxSlope: 18.4,
  averageRoughness: 0.12,
  traversableAreaPercent: 82.4,
  highRiskAreaCount: 4,
  roadCoveragePercent: 24.6,
  totalSurveyAreaSqM: 14400,
};
