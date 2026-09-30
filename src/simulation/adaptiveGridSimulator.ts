import {
  ResolutionLevel,
  MapCell,
  DetectedObject,
  ResolutionExplainability,
  SimulationSettings,
} from '../types/perception';
import { TerrainSimulator } from './terrainSimulator';

export class AdaptiveGridSimulator {
  private terrain: TerrainSimulator;

  constructor(terrain: TerrainSimulator) {
    this.terrain = terrain;
  }

  /**
   * Generates 2.5D adaptive map cells across the perception footprint [-60..60m X, -60..60m Y]
   * Cell sizes vary dynamically according to A-FUSE multi-criterion fusion:
   * 1. Distance from ego vehicle
   * 2. Proximity to dynamic actors (vehicles, pedestrians, cyclists)
   * 3. Terrain complexity (slope, roughness, obstacles)
   * 4. Uncertainty & Risk
   */
  public generateCells(
    egoPos: [number, number, number],
    objects: DetectedObject[],
    settings: SimulationSettings
  ): MapCell[] {
    const cells: MapCell[] = [];
    const extent = Math.min(65, settings.maxRange);
    
    // We discretize the 2.5D space into adaptive macro blocks that subdivide based on refinement
    const baseStep = 4.0; // Base cell dimension in world space for visualization representation

    for (let x = -extent; x <= extent; x += baseStep) {
      for (let y = -extent; y <= extent; y += baseStep) {
        const distToEgo = Math.sqrt((x - egoPos[0]) ** 2 + (y - egoPos[1]) ** 2);
        if (distToEgo > extent) continue;

        const terrainSample = this.terrain.sample(x, y);

        // Calculate Distance Factor (0 = nearest, 1 = farthest)
        const distanceFactor = Math.min(1.0, distToEgo / settings.maxRange);

        // Evaluate Base Distance Resolution
        let baseResolution: ResolutionLevel = 0.50;
        if (distToEgo < settings.nearThreshold) {
          baseResolution = 0.05;
        } else if (distToEgo < settings.midThreshold) {
          baseResolution = 0.10;
        } else if (distToEgo < settings.farThreshold) {
          baseResolution = 0.25;
        } else {
          baseResolution = 0.50;
        }

        // Evaluate Dynamic Activity: proximity to any dynamic object
        let maxDynamicInfluence = 0.0;
        let nearestObj: DetectedObject | null = null;
        let distToNearestObj = 999.0;

        for (const obj of objects) {
          const dObj = Math.sqrt((x - obj.position[0]) ** 2 + (y - obj.position[1]) ** 2);
          if (dObj < distToNearestObj) {
            distToNearestObj = dObj;
            nearestObj = obj;
          }
          // Influence radius varies by object speed & type
          const influenceRadius = obj.type === 'vehicle' ? 8.0 : 5.0;
          if (dObj < influenceRadius) {
            const influence = 1.0 - (dObj / influenceRadius);
            if (influence > maxDynamicInfluence) {
              maxDynamicInfluence = influence;
            }
          }
        }

        // Evaluate Terrain Complexity & Risk
        const terrainComplexity = Math.min(1.0, (terrainSample.slope / 30.0) * 0.7 + terrainSample.roughness * 0.3);
        const risk = Math.max(terrainSample.risk, maxDynamicInfluence * 0.85);
        const uncertainty = Math.min(1.0, 0.15 + (distToEgo / 70.0) * 0.45 + (maxDynamicInfluence > 0 ? 0.3 : 0));

        // A-FUSE Adaptive Decision:
        // High dynamic activity or high risk triggers local refinement!
        let finalResolution: ResolutionLevel = baseResolution;
        let isRefinedLocally = false;
        let decision = `MAINTAIN: ${baseResolution * 100} cm (Distance Standard)`;
        let decisionReason = 'Nominal ambient region matching spatial range baseline.';

        const refinementScore =
          maxDynamicInfluence * 0.45 +
          risk * 0.25 +
          terrainComplexity * 0.20 +
          uncertainty * 0.10;

        if (refinementScore > (0.8 - settings.refinementSensitivity * 0.3)) {
          // Strong refinement trigger (e.g. close to pedestrian or obstacle)
          if (baseResolution > 0.05) {
            finalResolution = 0.05;
            isRefinedLocally = true;
            decision = `REFINE CRITICAL: ${baseResolution * 100} cm → 5 cm`;
            decisionReason = nearestObj
              ? `Dynamic ${nearestObj.type.toUpperCase()} (#${nearestObj.id}) detected with high risk score (${refinementScore.toFixed(2)}). Refined to highest precision.`
              : `High terrain risk / hazard corridor detected. Subdivided to 5 cm.`;
          }
        } else if (refinementScore > (0.45 - settings.refinementSensitivity * 0.2)) {
          // Moderate refinement trigger (e.g. distant pedestrian 60m away, or moving vehicle)
          if (baseResolution > 0.10) {
            finalResolution = 0.10;
            isRefinedLocally = true;
            decision = `REFINE REGION: ${baseResolution * 100} cm → 10 cm`;
            decisionReason = nearestObj
              ? `Dynamic track detected at range (${distToNearestObj.toFixed(1)}m). Elevating resolution from ${baseResolution * 100}cm to 10cm for trajectory estimation.`
              : `Complex terrain gradient (${terrainSample.slope.toFixed(1)}°). Refined to 10 cm.`;
          }
        } else if (baseResolution === 0.05) {
          decision = 'OPTIMAL: 5 cm (Ego Proximity)';
          decisionReason = 'Immediate vehicle safety envelope. Maximum sensor fidelity.';
        }

        const explainability: ResolutionExplainability = {
          distanceFactor: parseFloat(distanceFactor.toFixed(2)),
          dynamicActivity: parseFloat(maxDynamicInfluence.toFixed(2)),
          terrainComplexity: parseFloat(terrainComplexity.toFixed(2)),
          risk: parseFloat(risk.toFixed(2)),
          uncertainty: parseFloat(uncertainty.toFixed(2)),
          decision,
          decisionReason,
        };

        // Determine cell semantic classification
        let cellSemantic = terrainSample.semanticClass;
        if (nearestObj && distToNearestObj < 2.5) {
          cellSemantic = nearestObj.type === 'vehicle' ? 'Vehicle' : 'Pedestrian';
        }

        cells.push({
          id: `cell_${Math.round(x)}_${Math.round(y)}`,
          x,
          y,
          resolution: finalResolution,
          elevation: parseFloat(terrainSample.z.toFixed(2)),
          slope: parseFloat(terrainSample.slope.toFixed(1)),
          roughness: parseFloat(terrainSample.roughness.toFixed(2)),
          occupancy: maxDynamicInfluence > 0.4 ? 0.94 : terrainSample.isRoad ? 0.12 : 0.48,
          semanticClass: cellSemantic,
          confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
          dynamicProbability: parseFloat(maxDynamicInfluence.toFixed(2)),
          traversability: terrainSample.traversability,
          explainability,
          isRefinedLocally,
        });
      }
    }

    return cells;
  }
}
