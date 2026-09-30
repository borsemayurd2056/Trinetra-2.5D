export interface LoadedPointCloudData {
  rawBuffer: Float32Array;
  pointCount: number;
  stride: number;
  hasIntensity: boolean;
  loadTimeMs: number;
}

export class BinLoader {
  /**
   * Loads a binary (.bin) point cloud file (e.g. KITTI Velodyne format)
   * Expected format: IEEE-754 32-bit floats [x, y, z, intensity, ...]
   * 16 bytes per point (4 floats)
   */
  public static async loadFromUrl(url: string): Promise<LoadedPointCloudData> {
    const startTime = performance.now();

    let response: Response;
    try {
      response = await fetch(url);
    } catch (err: any) {
      throw new Error(`Network failure loading binary LiDAR frame: ${err?.message || err}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch LiDAR binary file at "${url}": HTTP ${response.status} (${response.statusText})`);
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error(`Empty LiDAR binary file at "${url}" (0 bytes received).`);
    }

    // Standard LiDAR binary format is 4 float32s (16 bytes) per point: [x, y, z, intensity]
    // Some formats store 3 float32s (12 bytes): [x, y, z]
    let stride = 4;
    let hasIntensity = true;

    if (arrayBuffer.byteLength % 16 === 0) {
      stride = 4;
      hasIntensity = true;
    } else if (arrayBuffer.byteLength % 12 === 0) {
      stride = 3;
      hasIntensity = false;
    } else {
      throw new Error(
        `Invalid binary LiDAR buffer length: ${arrayBuffer.byteLength} bytes is not divisible by 16 (x,y,z,i) or 12 (x,y,z). Possible file corruption.`
      );
    }

    const rawBuffer = new Float32Array(arrayBuffer);
    const pointCount = Math.floor(rawBuffer.length / stride);

    const loadTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return {
      rawBuffer,
      pointCount,
      stride,
      hasIntensity,
      loadTimeMs,
    };
  }
}
