import QRCode from 'qrcode';
import { PosterTemplate } from './posterTemplates';

export interface RenderPosterOptions {
  template: PosterTemplate;
  restaurantName: string;
  targetUrl: string;
  tableNumber?: string | number;
  scale?: number; // 1 = native (796x1024), 2 = retina HD (1592x2048), 3 = 300 DPI print (2388x3072)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image at ${src}: ${err}`));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Composites a high-resolution marketing poster using HTML5 Canvas.
 * Automatically stamps the Menu Maps verified logo in the center of the QR code.
 */
export async function renderPosterToCanvas({
  template,
  restaurantName,
  targetUrl,
  tableNumber,
  scale = 2, // Default to 2x for crystal-clear retina & print preview
}: RenderPosterOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = template.dimensions.width * scale;
  const height = template.dimensions.height * scale;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Turn on high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Load & Draw Background Template Image
  const bgImage = await loadImage(template.imageUrl);
  ctx.drawImage(bgImage, 0, 0, width, height);

  // 2. Generate and Render High-Resolution QR Code (Level 'H' for 30% error correction)
  const qrBox = template.qrBox;
  const qrX = qrBox.x * scale;
  const qrY = qrBox.y * scale;
  const qrW = qrBox.width * scale;
  const qrH = qrBox.height * scale;
  const qrRadius = (qrBox.borderRadius || 18) * scale;
  const qrPadding = (qrBox.padding || 12) * scale;

  // Generate crisp vector-like QR data URL with High error correction for center logo badge
  const qrPixelSize = Math.max(qrW, qrH) * 2;
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: qrPixelSize,
    color: {
      dark: '#14110F',
      light: '#FFFFFF',
    },
  });

  const qrImage = await loadImage(qrDataUrl);

  // Draw clean white rounded container for the QR code
  ctx.save();
  roundRect(ctx, qrX, qrY, qrW, qrH, qrRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Clip to rounded bounds so QR corners remain smooth
  ctx.clip();

  // Draw QR code with padding
  const drawQrX = qrX + qrPadding;
  const drawQrY = qrY + qrPadding;
  const drawQrW = qrW - qrPadding * 2;
  const drawQrH = qrH - qrPadding * 2;
  ctx.drawImage(qrImage, drawQrX, drawQrY, drawQrW, drawQrH);

  // 2.1 Draw Branded Menu Maps Logo Pin in Center of QR Code
  const qrCenterX = drawQrX + drawQrW / 2;
  const qrCenterY = drawQrY + drawQrH / 2;
  const logoBadgeSize = Math.round(drawQrW * 0.22); // 22% diameter (well within 30% H-level tolerance)
  const logoBadgeRadius = Math.round(logoBadgeSize * 0.26);

  // Soft shadow behind white logo pill
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetY = 2 * scale;
  roundRect(
    ctx,
    qrCenterX - logoBadgeSize / 2,
    qrCenterY - logoBadgeSize / 2,
    logoBadgeSize,
    logoBadgeSize,
    logoBadgeRadius
  );
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Subtle clean border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeStyle = '#F1ECE4';
  ctx.stroke();

  // Draw Menu Maps Logo inside the pill
  try {
    const logoImg = await loadImage('/logo.svg');
    const innerIconPadding = 3.5 * scale;
    const innerIconSize = logoBadgeSize - innerIconPadding * 2;
    ctx.drawImage(
      logoImg,
      qrCenterX - innerIconSize / 2,
      qrCenterY - innerIconSize / 2,
      innerIconSize,
      innerIconSize
    );
  } catch (logoErr) {
    // If SVG fails, fallback gracefully
    console.warn('Could not load logo.svg for QR center:', logoErr);
  }

  ctx.restore();

  // 3. Render Dynamic Restaurant Name & Table Details in Banner Area
  const banner = template.restaurantNameBox;
  const bX = banner.x * scale;
  const bY = banner.y * scale;
  const bW = banner.width * scale;
  const bH = banner.height * scale;
  const centerX = bX + bW / 2;
  const centerY = bY + bH / 2;

  const isTableMode = tableNumber && String(tableNumber) !== 'master';
  const tableBadgeText = isTableMode ? `TABLE #${tableNumber} • DINE-IN DIGITAL MENU` : 'VERIFIED DIGITAL MENU';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dynamic Typography Fitting for the Restaurant Name
  let fontSize = banner.maxFontSize * scale;
  const minFontSize = banner.minFontSize * scale;
  const maxWidth = bW - 28 * scale; // 28px safety padding from banner edges

  // Adjust font size until text fits on one line or minimum is reached
  while (fontSize > minFontSize) {
    ctx.font = `bold ${fontSize}px ${banner.fontFamily}`;
    const metrics = ctx.measureText(restaurantName);
    if (metrics.width <= maxWidth) break;
    fontSize -= 1 * scale;
  }

  // Check if we need 2 lines (if still exceeding maxWidth at minFontSize)
  ctx.font = `bold ${fontSize}px ${banner.fontFamily}`;
  const singleLineFits = ctx.measureText(restaurantName).width <= maxWidth;

  if (isTableMode) {
    // Two-tier layout: Restaurant Name on line 1, Table Badge on line 2
    const nameFontSize = Math.min(fontSize, 23 * scale);
    ctx.font = `bold ${nameFontSize}px ${banner.fontFamily}`;
    ctx.fillStyle = banner.color;
    
    // Draw restaurant name slightly above center
    ctx.fillText(restaurantName, centerX, centerY - 11 * scale);

    // Draw Table Badge / Subtitle underneath with warm spice styling
    const badgeFontSize = 10.5 * scale;
    ctx.font = `900 ${badgeFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = banner.secondaryColor || '#C25E20';
    ctx.fillText(tableBadgeText, centerX, centerY + 14 * scale);
  } else if (!singleLineFits) {
    // Split long restaurant name into 2 balanced lines
    const words = restaurantName.split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');

    const twoLineFontSize = Math.max(minFontSize, 19 * scale);
    ctx.font = `bold ${twoLineFontSize}px ${banner.fontFamily}`;
    ctx.fillStyle = banner.color;
    const lineHeight = twoLineFontSize * 1.15;

    ctx.fillText(line1, centerX, centerY - lineHeight / 2);
    ctx.fillText(line2, centerX, centerY + lineHeight / 2);
  } else {
    // Single line centered perfectly
    ctx.font = `bold ${fontSize}px ${banner.fontFamily}`;
    ctx.fillStyle = banner.color;
    ctx.fillText(restaurantName, centerX, centerY);
  }

  ctx.restore();

  return canvas;
}

/**
 * Downloads the composited poster directly to the user's device as a high-resolution PNG.
 */
export async function downloadPosterAsPng(
  canvas: HTMLCanvasElement,
  fileName: string = 'restaurant-menu-poster.png'
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob from canvas'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}
