import type { CoordinatePreset, PreprocessingConfig } from '../../types/lidar';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * CoordinateTransform
 * 
 * Transforms points from native sensor coordinates (e.g. KITTI Velodyne, Ouster)
 * into A-FUSE internal coordinates and Three.js visualization space:
 * - Three.js X: Lateral (Right +X, Left -X)
 * - Three.js Y: Vertical Elevation (Up +Y)
 * - Three.js Z: Longitudinal (Forward +Z, Rear -Z)
 */
export class CoordinateTransform {
  /**
   * Transforms a single point from sensor space to Three.js world space
   */
  public static transformPoint(
    rawX: number,
    rawY: number,
    rawZ: number,
    config: PreprocessingConfig,
    sensorElevationOffset: number = 1.55 // Matches UGV sensor mast height
  ): Vector3D {
    let x = rawX;
    let y = rawY;
    let z = rawZ;

    // Apply dataset presets
    switch (config.coordinatePreset) {
      case 'kitti':
      case 'velodyne':
        // KITTI Velodyne: X is Forward, Y is Left, Z is Up
        // In Three.js: X is Right (-Y), Y is Up (Z), Z is Forward (X)
        x = -rawY;
        y = rawZ + sensorElevationOffset;
        z = rawX;
        break;

      case 'ouster':
        // Ouster LiDAR: X is Forward, Y is Left, Z is Up
        x = -rawY;
        y = rawZ + sensorElevationOffset;
        z = rawX;
        break;

      case 'standard':
      default:
        // Default right-handed: X right, Y up, Z forward
        x = rawX;
        y = rawY + sensorElevationOffset;
        z = rawZ;
        break;
    }

    // Apply custom manual inversion toggles if configured
    if (config.invertX) x = -x;
    if (config.invertY) y = -y;
    if (config.invertZ) z = -z;
    if (config.swapYZ) {
      const temp = y;
      y = z;
      z = temp;
    }

    return { x, y, z };
  }
}
