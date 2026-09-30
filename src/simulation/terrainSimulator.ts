import { TraversabilityLevel, SemanticClass } from '../types/perception';

export interface TerrainPointData {
  x: number;
  y: number;
  z: number;
  slope: number;
  roughness: number;
  isRoad: boolean;
  traversability: TraversabilityLevel;
  semanticClass: SemanticClass;
  risk: number;
}

export class TerrainSimulator {
  private complexity: number;

  constructor(complexity: number = 1.0) {
    this.complexity = complexity;
  }

  public setComplexity(val: number) {
    this.complexity = Math.max(0.2, Math.min(2.5, val));
  }

  /**
   * Evaluates terrain elevation at coordinates (x, y)
   * Creates a natural scene with an arterial asphalt road at x near 0,
   * gentle rolling terrain, a rocky slope hill on the east (+x), and a ditch/berm on the west.
   */
  public getElevation(x: number, y: number): number {
    // Road corridor: width ~ 7 meters centered around x = 0, gently curving
    const roadCenterX = Math.sin(y * 0.05) * 4.0;
    const distToRoad = Math.abs(x - roadCenterX);

    if (distToRoad < 4.0) {
      // Flat road surface with subtle crown
      return 0.15 * Math.sin(y * 0.02);
    }

    // Road shoulder
    if (distToRoad < 6.0) {
      const t = (distToRoad - 4.0) / 2.0;
      return 0.15 * Math.sin(y * 0.02) - t * 0.3;
    }

    // Outer terrain with hills and ridges
    const baseWave = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 1.5;
    const midWave = Math.sin((x + y) * 0.12) * 0.8;
    const rockyHill = (x > 15 ? Math.min(4.5, (x - 15) * 0.25 + Math.sin(y * 0.2) * 0.8) : 0);
    const ditch = (x < -12 && x > -22 ? -Math.sin((x + 17) * 0.3) * 1.2 : 0);

    return (baseWave + midWave + rockyHill + ditch) * this.complexity;
  }

  /**
   * Computes comprehensive terrain metrics at (x, y)
   */
  public sample(x: number, y: number): TerrainPointData {
    const roadCenterX = Math.sin(y * 0.05) * 4.0;
    const distToRoad = Math.abs(x - roadCenterX);
    const isRoad = distToRoad < 4.2;

    const z = this.getElevation(x, y);

    // Approximate gradient / slope via central difference
    const delta = 0.5;
    const zDx = this.getElevation(x + delta, y) - this.getElevation(x - delta, y);
    const zDy = this.getElevation(x, y + delta) - this.getElevation(x, y - delta);
    const grad = Math.sqrt(zDx * zDx + zDy * zDy) / (2 * delta);
    const slopeDeg = Math.min(60, (Math.atan(grad) * 180) / Math.PI);

    // Roughness: micro-variations
    const roughness = isRoad
      ? 0.03
      : Math.min(1.0, 0.12 + Math.abs(Math.sin(x * 1.7) * Math.cos(y * 1.3)) * 0.35 * this.complexity);

    // Traversability & Risk evaluation
    let traversability: TraversabilityLevel = 'HIGH';
    let risk = 0.05;

    if (isRoad) {
      traversability = 'HIGH';
      risk = 0.08;
    } else if (slopeDeg > 22 || z < -1.0) {
      traversability = 'IMPASSABLE';
      risk = 0.92;
    } else if (slopeDeg > 13 || roughness > 0.45) {
      traversability = 'CAUTION';
      risk = 0.65;
    } else if (slopeDeg > 7 || roughness > 0.25) {
      traversability = 'LOW';
      risk = 0.38;
    }

    let semanticClass: SemanticClass = 'Terrain';
    if (isRoad) {
      semanticClass = 'Road';
    } else if (x > 25 && y > 10) {
      semanticClass = 'Obstacle';
    } else if (roughness > 0.4 && !isRoad) {
      semanticClass = 'Vegetation';
    }

    return {
      x,
      y,
      z,
      slope: slopeDeg,
      roughness,
      isRoad,
      traversability,
      semanticClass,
      risk,
    };
  }
}
