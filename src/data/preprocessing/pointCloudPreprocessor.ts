import type { PreprocessingConfig, PointCloudStats } from '../../types/lidar';
import { CoordinateTransform } from '../transforms/coordinateTransform';

export interface PreprocessedPointCloud {
  positions: Float32Array; // Flattened [x, y, z, ...] for Three.js
  colors: Float32Array; // Flattened [r, g, b, ...]
  intensities: Float32Array;
  stats: PointCloudStats;
}

export class PointCloudPreprocessor {
  /**
   * Processes raw point cloud data:
   * 1. Invalid point removal (NaN, Infinity)
   * 2. Range filtering (minRange - maxRange)
   * 3. Height filtering (minHeight - maxHeight)
   * 4. Voxel grid downsampling
   * 5. Coordinate transformation
   * 6. Intensity / height color map generation
   */
  public static process(
    rawBuffer: Float32Array,
    stride: number = 4, // 4 values per point: [x, y, z, intensity]
    config: PreprocessingConfig,
    hasIntensity: boolean = true
  ): PreprocessedPointCloud {
    const startTime = performance.now();

    const rawPointCount = Math.floor(rawBuffer.length / stride);

    const tempX: number[] = [];
    const tempY: number[] = [];
    const tempZ: number[] = [];
    const tempI: number[] = [];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let sumIntensity = 0;
    let intensityCount = 0;

    const voxelSet = config.voxelSize > 0 ? new Set<string>() : null;
    const decimation = Math.max(1, Math.floor(config.downsampleFactor || 1));

    for (let i = 0; i < rawPointCount; i += decimation) {
      const idx = i * stride;
      const rawX = rawBuffer[idx];
      const rawY = rawBuffer[idx + 1];
      const rawZ = rawBuffer[idx + 2];
      const rawIntensity = hasIntensity && stride >= 4 ? rawBuffer[idx + 3] : 0.5;

      // 1. Invalid Point Filtering (NaN, Infinity)
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY) || !Number.isFinite(rawZ)) {
        continue;
      }

      // 2. Sensor Range Filtering
      const dist = Math.sqrt(rawX * rawX + rawY * rawY + rawZ * rawZ);
      if (dist < config.minRange || dist > config.maxRange) {
        continue;
      }

      // 3. Height Filtering (evaluated in sensor frame or vertical axis)
      if (rawZ < config.minHeight || rawZ > config.maxHeight) {
        continue;
      }

      // 4. Optional Voxel Grid Downsampling
      if (voxelSet && config.voxelSize > 0) {
        const vx = Math.floor(rawX / config.voxelSize);
        const vy = Math.floor(rawY / config.voxelSize);
        const vz = Math.floor(rawZ / config.voxelSize);
        const voxelKey = `${vx}_${vy}_${vz}`;
        if (voxelSet.has(voxelKey)) {
          continue;
        }
        voxelSet.add(voxelKey);
      }

      // 5. Coordinate Transform to Three.js Frame
      const transformed = CoordinateTransform.transformPoint(rawX, rawY, rawZ, config);

      tempX.push(transformed.x);
      tempY.push(transformed.y);
      tempZ.push(transformed.z);
      tempI.push(rawIntensity);

      // Track Bounding Box & Intensity
      if (transformed.x < minX) minX = transformed.x;
      if (transformed.x > maxX) maxX = transformed.x;
      if (transformed.y < minY) minY = transformed.y;
      if (transformed.y > maxY) maxY = transformed.y;
      if (transformed.z < minZ) minZ = transformed.z;
      if (transformed.z > maxZ) maxZ = transformed.z;

      if (Number.isFinite(rawIntensity)) {
        sumIntensity += rawIntensity;
        intensityCount++;
      }
    }

    const processedPointCount = tempX.length;
    const positions = new Float32Array(processedPointCount * 3);
    const colors = new Float32Array(processedPointCount * 3);
    const intensities = new Float32Array(processedPointCount);

    const avgIntensity = intensityCount > 0 ? sumIntensity / intensityCount : 0.5;

    // Normalize intensity range (e.g. 0..1 or 0..255)
    const maxI = Math.max(1.0, ...tempI.slice(0, 1000));
    const intensityScale = maxI > 1.0 ? 1.0 / maxI : 1.0;

    for (let j = 0; j < processedPointCount; j++) {
      const pIdx = j * 3;
      positions[pIdx] = tempX[j];
      positions[pIdx + 1] = tempY[j];
      positions[pIdx + 2] = tempZ[j];

      const normI = Math.max(0.05, Math.min(1.0, tempI[j] * intensityScale));
      intensities[j] = normI;

      // Color based on laser intensity (cyan-to-amber-to-white retroreflective colormap)
      if (normI < 0.3) {
        colors[pIdx] = 0.0;
        colors[pIdx + 1] = normI * 2.5;
        colors[pIdx + 2] = 0.9;
      } else if (normI < 0.7) {
        colors[pIdx] = (normI - 0.3) * 2.2;
        colors[pIdx + 1] = 0.9;
        colors[pIdx + 2] = 0.9 - (normI - 0.3) * 1.5;
      } else {
        colors[pIdx] = 1.0;
        colors[pIdx + 1] = 0.9 + (normI - 0.7) * 0.3;
        colors[pIdx + 2] = 0.4 + (normI - 0.7) * 2.0;
      }
    }

    const preprocessTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    const stats: PointCloudStats = {
      rawPointCount,
      processedPointCount,
      minX: processedPointCount > 0 ? parseFloat(minX.toFixed(2)) : 0,
      maxX: processedPointCount > 0 ? parseFloat(maxX.toFixed(2)) : 0,
      minY: processedPointCount > 0 ? parseFloat(minY.toFixed(2)) : 0,
      maxY: processedPointCount > 0 ? parseFloat(maxY.toFixed(2)) : 0,
      minZ: processedPointCount > 0 ? parseFloat(minZ.toFixed(2)) : 0,
      maxZ: processedPointCount > 0 ? parseFloat(maxZ.toFixed(2)) : 0,
      avgIntensity: parseFloat(avgIntensity.toFixed(3)),
      hasIntensity,
      loadTimeMs: 0, // Assigned by loader
      preprocessTimeMs,
      uploadTimeMs: 0,
      totalFrameTimeMs: preprocessTimeMs,
    };

    return {
      positions,
      colors,
      intensities,
      stats,
    };
  }
}
