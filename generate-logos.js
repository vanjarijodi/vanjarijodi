import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/vanjari-jodi-logo.svg');

if (!fs.existsSync(svgPath)) {
  console.error('SVG source file not found at:', svgPath);
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgPath);

async function generateLogo(outputPath, size) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await sharp(svgBuffer)
    .resize(size, size)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`✓ Generated ${outputPath} (${size}x${size})`);
}

async function run() {
  console.log('🚀 Generating Official Vanjari Jodi App Logos & APK Launcher Icons...');

  // Public web assets
  await generateLogo('public/logo.png', 512);
  await generateLogo('public/icon-512.png', 512);
  await generateLogo('public/icon-192.png', 192);
  await generateLogo('public/apple-touch-icon.png', 180);
  await generateLogo('public/favicon.png', 64);

  // Android Mipmap Launcher Icons
  const androidMipmaps = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const item of androidMipmaps) {
    await generateLogo(path.join(item.dir, 'ic_launcher.png'), item.size);
    await generateLogo(path.join(item.dir, 'ic_launcher_round.png'), item.size);
    await generateLogo(path.join(item.dir, 'ic_launcher_foreground.png'), item.size);
  }

  // Android Assets public bundle
  const androidAssetsPublic = 'android/app/src/main/assets/public';
  if (fs.existsSync(androidAssetsPublic)) {
    await generateLogo(path.join(androidAssetsPublic, 'logo.png'), 512);
    await generateLogo(path.join(androidAssetsPublic, 'icon-512.png'), 512);
    await generateLogo(path.join(androidAssetsPublic, 'icon-192.png'), 192);
    await generateLogo(path.join(androidAssetsPublic, 'apple-touch-icon.png'), 180);
    await generateLogo(path.join(androidAssetsPublic, 'favicon.png'), 64);
  }

  console.log('🎉 All logo and app icon assets successfully updated!');
}

run().catch((err) => {
  console.error('Error generating logos:', err);
  process.exit(1);
});
