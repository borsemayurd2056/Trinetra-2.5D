import type { LoadedPointCloudData } from './BinLoader';

export class PcdLoader {
  /**
   * Loads a Point Cloud Data (.pcd) file supporting ASCII and Binary payloads
   */
  public static async loadFromUrl(url: string): Promise<LoadedPointCloudData> {
    const startTime = performance.now();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PCD file at "${url}": HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const textDecoder = new TextDecoder('ascii');
    const headerText = textDecoder.decode(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 2048)));

    const lines = headerText.split('\n');
    let dataMode = 'ascii';
    let pointCount = 0;
    let headerOffset = 0;
    let fields: string[] = ['x', 'y', 'z'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('FIELDS')) {
        fields = line.split(/\s+/).slice(1);
      } else if (line.startsWith('POINTS')) {
        pointCount = parseInt(line.split(/\s+/)[1], 10);
      } else if (line.startsWith('DATA')) {
        dataMode = line.split(/\s+/)[1].toLowerCase();
        // Compute offset where data begins
        headerOffset = headerText.indexOf(line) + line.length + 1;
        break;
      }
    }

    const hasIntensity = fields.includes('intensity') || fields.includes('i');
    const xIdx = fields.indexOf('x');
    const yIdx = fields.indexOf('y');
    const zIdx = fields.indexOf('z');
    const iIdx = hasIntensity ? (fields.indexOf('intensity') !== -1 ? fields.indexOf('intensity') : fields.indexOf('i')) : -1;

    let rawBuffer: Float32Array;

    if (dataMode === 'binary') {
      const dataView = new DataView(buffer, headerOffset);
      const stride = fields.length * 4; // float32 assumed
      const calculatedPoints = Math.floor((buffer.byteLength - headerOffset) / stride);
      const count = pointCount > 0 ? pointCount : calculatedPoints;

      rawBuffer = new Float32Array(count * 4);
      for (let p = 0; p < count; p++) {
        const offset = p * stride;
        rawBuffer[p * 4] = dataView.getFloat32(offset + xIdx * 4, true);
        rawBuffer[p * 4 + 1] = dataView.getFloat32(offset + yIdx * 4, true);
        rawBuffer[p * 4 + 2] = dataView.getFloat32(offset + zIdx * 4, true);
        rawBuffer[p * 4 + 3] = iIdx !== -1 ? dataView.getFloat32(offset + iIdx * 4, true) : 0.5;
      }
    } else {
      // ASCII mode
      const fullText = textDecoder.decode(buffer);
      const dataLines = fullText.slice(headerOffset).trim().split('\n');
      rawBuffer = new Float32Array(dataLines.length * 4);

      let validIdx = 0;
      for (let p = 0; p < dataLines.length; p++) {
        const parts = dataLines[p].trim().split(/\s+/);
        if (parts.length >= 3) {
          rawBuffer[validIdx * 4] = parseFloat(parts[xIdx] || '0');
          rawBuffer[validIdx * 4 + 1] = parseFloat(parts[yIdx] || '0');
          rawBuffer[validIdx * 4 + 2] = parseFloat(parts[zIdx] || '0');
          rawBuffer[validIdx * 4 + 3] = iIdx !== -1 ? parseFloat(parts[iIdx] || '0.5') : 0.5;
          validIdx++;
        }
      }
      pointCount = validIdx;
    }

    const loadTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return {
      rawBuffer,
      pointCount: pointCount || Math.floor(rawBuffer.length / 4),
      stride: 4,
      hasIntensity,
      loadTimeMs,
    };
  }
}
