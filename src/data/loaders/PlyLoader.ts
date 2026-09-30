import type { LoadedPointCloudData } from './BinLoader';

export class PlyLoader {
  /**
   * Loads a Polygon File (.ply) point cloud supporting ASCII vertex elements
   */
  public static async loadFromUrl(url: string): Promise<LoadedPointCloudData> {
    const startTime = performance.now();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PLY file at "${url}": HTTP ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n');

    let vertexCount = 0;
    let endHeaderIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(/\s+/)[2], 10);
      } else if (line === 'end_header') {
        endHeaderIndex = i;
        break;
      }
    }

    if (endHeaderIndex === -1) {
      throw new Error(`Invalid PLY file at "${url}": missing end_header token.`);
    }

    const rawBuffer = new Float32Array(vertexCount * 4);
    let validCount = 0;

    for (let i = endHeaderIndex + 1; i < lines.length && validCount < vertexCount; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 3) {
        rawBuffer[validCount * 4] = parseFloat(parts[0]);
        rawBuffer[validCount * 4 + 1] = parseFloat(parts[1]);
        rawBuffer[validCount * 4 + 2] = parseFloat(parts[2]);
        rawBuffer[validCount * 4 + 3] = parts.length >= 4 ? parseFloat(parts[3]) : 0.5;
        validCount++;
      }
    }

    const loadTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return {
      rawBuffer,
      pointCount: validCount,
      stride: 4,
      hasIntensity: false,
      loadTimeMs,
    };
  }
}
