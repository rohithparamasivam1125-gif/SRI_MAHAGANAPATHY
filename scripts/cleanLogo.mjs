import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogo() {
  const inputPath = 'e:/RAJAGANAPTHY/public/smg-logo-raw.png';
  const outputPath = 'e:/RAJAGANAPTHY/public/smg-logo.png';
  const srcOutputPath = 'e:/RAJAGANAPTHY/src/assets/smg-logo.png';

  console.log('Reading image from:', inputPath);
  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Dimensions: ${width}x${height}, channels: ${channels}`);

  // Create new RGBA buffer
  const outputData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    // Grayscale brightness (0 = black, 255 = white)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // In the artwork: lines are black (brightness near 0-80).
    // The fake transparency checkerboard has white (255) and light gray (200-220).
    if (brightness < 110) {
      // It's the black line / text / illustration
      outputData[i * 4] = 0;     // R
      outputData[i * 4 + 1] = 0; // G
      outputData[i * 4 + 2] = 0; // B
      // Anti-aliased alpha based on darkness
      const alpha = Math.min(255, Math.max(0, Math.round((110 - brightness) / 110 * 255 * 1.3)));
      outputData[i * 4 + 3] = alpha;
    } else {
      // Background checkerboard -> transparent
      outputData[i * 4] = 0;
      outputData[i * 4 + 1] = 0;
      outputData[i * 4 + 2] = 0;
      outputData[i * 4 + 3] = 0;
    }
  }

  // Trim empty transparent pixels and save
  const cleanedImage = sharp(outputData, {
    raw: {
      width,
      height,
      channels: 4
    }
  }).trim();

  await cleanedImage.png().toFile(outputPath);
  await sharp(outputPath).png().toFile(srcOutputPath);

  console.log('Successfully generated transparent PNG logo at:', outputPath);
}

processLogo().catch(console.error);
