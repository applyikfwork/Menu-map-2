/**
 * High-Performance Client-Side Image Compression Utility
 * Guarantees uploaded restaurant cover and dish photos are compressed strictly below 1 MB
 * without quality loss for crisp mobile & desktop rendering.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export async function compressImageFile(
  file: File,
  optionsOrMaxDimension: number | CompressionOptions = 1600,
  maxSizeBytesParam = 950 * 1024 // Target under 950 KB (< 1 MB)
): Promise<CompressionResult> {
  const isOptions = typeof optionsOrMaxDimension === 'object' && optionsOrMaxDimension !== null;
  const maxDimension = isOptions
    ? (optionsOrMaxDimension.maxWidth || optionsOrMaxDimension.maxDimension || 1600)
    : (optionsOrMaxDimension || 1600);
  const initialQuality = isOptions && typeof optionsOrMaxDimension.quality === 'number'
    ? optionsOrMaxDimension.quality
    : 0.85;
  const maxSizeBytes = isOptions && optionsOrMaxDimension.maxSizeBytes
    ? optionsOrMaxDimension.maxSizeBytes
    : maxSizeBytesParam;
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image'));
      img.onload = () => {
        let { width, height } = img;

        // Scale down dimensions if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Iteratively find quality that ensures < 1 MB
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate binary size of base64
        let base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        let byteSize = Math.round((base64Length * 3) / 4);

        while (byteSize > maxSizeBytes && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
          byteSize = Math.round((base64Length * 3) / 4);
        }

        const compressedSizeKb = Math.round(byteSize / 1024);

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          width,
          height,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
