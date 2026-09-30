# A-FUSE 2.5D — LiDAR Dataset Documentation

This directory contains real recorded point cloud datasets and samples for **A-FUSE 2.5D Phase 2: Real LiDAR Data Ingestion, Preprocessing & 3D Visualization**.

---

## 1. Supported Data Formats

| Format | Extension | Primary/Secondary | Supported Encodings | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **KITTI / Velodyne Binary** | `.bin` | **Primary** | Raw IEEE-754 32-bit Float32 `[x, y, z, r]` (16 bytes/pt) | **VERIFIED** |
| **Point Cloud Data** | `.pcd` | Secondary | ASCII & Binary (`x, y, z` + optional `intensity`) | **IMPLEMENTED** |
| **Polygon File Format** | `.ply` | Secondary | ASCII vertex elements (`x, y, z`) | **IMPLEMENTED** |

---

## 2. Directory Structure

```text
public/data/
├── README.md               # This documentation
├── raw/                    # Store your custom recorded LiDAR datasets here
├── processed/              # Filtered / cached frame outputs
└── samples/                # Bundled real recorded sample frames
    ├── kitti_frame_000000.bin
    ├── kitti_frame_000001.bin
    ├── kitti_frame_000002.bin
    ├── kitti_frame_000003.bin
    ├── kitti_frame_000004.bin
    ├── sample_urban.pcd
    └── sample_terrain.ply
```

---

## 3. Binary Format (.bin) Specification

The primary format adheres to the standard Velodyne HDL-64E / KITTI dataset convention:
- **Encoding**: 32-bit little-endian IEEE-754 floating point numbers.
- **Stride**: 4 floats (16 bytes) per LiDAR point:
  ```text
  [x: float32, y: float32, z: float32, intensity: float32]
  ```
- **Coordinate Convention (Sensor Frame)**:
  - `+X` $\rightarrow$ Forward (direction of vehicle motion)
  - `+Y` $\rightarrow$ Left (lateral)
  - `+Z` $\rightarrow$ Up (elevation)
  - `intensity` $\rightarrow$ Calibrated sensor reflectivity (0.0 to 1.0 or 0 to 255)

The A-FUSE `CoordinateTransform` layer automatically maps sensor coordinates to the Three.js 3D viewport:
$$\text{Three.js } X = -Y_{\text{sensor}}, \quad \text{Three.js } Y = Z_{\text{sensor}} + Z_{\text{sensorOffset}}, \quad \text{Three.js } Z = X_{\text{sensor}}$$

---

## 4. How to Add Custom Datasets

1. Place your `.bin`, `.pcd`, or `.ply` files in `public/data/raw/my_dataset/`.
2. Name frames sequentially (e.g. `frame_000000.bin`, `frame_000001.bin`, ...).
3. In `src/data/providers/RecordedLiDARProvider.ts`, register your dataset manifest in `this.datasets`.
4. Open the application, go to **Settings** $\rightarrow$ **LiDAR Data Configuration**, and choose your dataset from the dropdown.

---

## 5. Preprocessing & Filter Pipeline

Before points are uploaded to the GPU `THREE.Points` BufferGeometry, the `PointCloudPreprocessor` pipeline executes:
1. **Invalid Point Removal**: Filters out `NaN`, `Infinity`, and unreadable coordinates.
2. **Range Filtering**: Discards points with Euclidean range outside `[minRange, maxRange]`.
3. **Height Filtering**: Clamps points outside elevation window `[minZ, maxZ]`.
4. **Voxel Downsampling**: Fast spatial hash grid decimation for real-time WebGL performance on dense scans (>100k points).

---

## 6. Important Phase 2 Scope Limitation

> [!IMPORTANT]
> **Phase 2 provides raw recorded LiDAR visualization, parsing, preprocessing, replay, and statistics.**
> **AI semantic segmentation (PointNet++), 3D bounding box object detection, dynamic tracking from real scans, and production A-FUSE mapping are Phase 3+ deliverables.**
> When Recorded LiDAR mode is active, the system visualizes the true point cloud and reflectivity without fabricating fake semantic classes.
