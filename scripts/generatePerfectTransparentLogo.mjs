import sharp from 'sharp';
import fs from 'fs';

async function analyzeAndClean() {
  const inputPath = 'e:/RAJAGANAPTHY/public/smg-logo-raw.png';
  const outputPath = 'e:/RAJAGANAPTHY/public/smg-logo-transparent.png';
  const outputPathMain = 'e:/RAJAGANAPTHY/public/smg-logo.png';

  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Analyzing ${width}x${height}`);

  // Create new RGBA buffer
  const outputData = Buffer.alloc(width * height * 4);

  // In the emblem artwork, the black lines and text have R, G, B < 80.
  // The checkerboard has pixels around 204 and 255.
  // Let's create crisp black lines on pure 100% transparent background.
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    // Average intensity
    const intensity = (r + g + b) / 3;

    if (intensity < 90) {
      // It's the black artwork!
      outputData[i * 4] = 15;     // Deep dark R
      outputData[i * 4 + 1] = 23; // Deep dark G (slate-900)
      outputData[i * 4 + 2] = 42; // Deep dark B
      // Smooth antialiased opacity
      const alpha = Math.min(255, Math.max(0, Math.round((90 - intensity) / 90 * 255 * 1.5)));
      outputData[i * 4 + 3] = alpha;
    } else {
      // Pure 100% transparent background!
      outputData[i * 4] = 0;
      outputData[i * 4 + 1] = 0;
      outputData[i * 4 + 2] = 0;
      outputData[i * 4 + 3] = 0;
    }
  }

  const cleanedImage = sharp(outputData, {
    raw: {
      width,
      height,
      channels: 4
    }
  }).trim(); // Trim all excess transparent margins

  await cleanedImage.png().toFile(outputPath);
  await sharp(outputPath).png().toFile(outputPathMain);
  await sharp(outputPath).png().toFile('e:/RAJAGANAPTHY/src/assets/smg-logo.png');

  console.log('Saved perfect transparent PNG to:', outputPath);
}

analyzeAndClean().catch(console.error);
