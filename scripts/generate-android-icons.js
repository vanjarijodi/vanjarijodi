import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public/vanjari-jodi-logo.svg'));

const sizes = [
  { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
  { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
];

async function generate() {
  for (const { dir, size } of sizes) {
    fs.mkdirSync(dir, { recursive: true });
    
    // Standard icon
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(dir, 'ic_launcher.png'));

    // Round icon
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // Foreground icon
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  console.log('Android matrimony icons generated successfully!');
}

generate().catch(console.error);
