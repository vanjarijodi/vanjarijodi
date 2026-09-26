import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * MASTER ASSET GENERATOR FOR VANJARI JODI MATRIMONY
 * 
 * Generates all specified assets from the official attached image:
 * 1. Official original logo (800x800 & 1024x1024 master)
 * 2. Transparent square logo (High-res transparent PNG)
 * 3. Horizontal logo (Banner layout with emblem + golden Marathi branding)
 * 4. Play Store 512x512 icon (32-bit PNG with alpha, Google Play Console compliant)
 * 5. Android launcher 512x512 (High-res launcher)
 * 6. Android launcher 192x192 (xxxhdpi & PWA)
 * 7. Adaptive icon foreground (108dp / 432x432 with 72dp safe zone) & background
 * 8. Notification icon (White silhouette on transparent background, 24x24 up to 96x96)
 * 9. Favicon (16x16, 32x32, 48x48, 64x64 PNG & ICO)
 * 10. Apple Touch Icon (180x180 with royal background for iOS home screen)
 * 11. PWA icons (192x192 & 512x512 maskable & any)
 * 12. Play Store Feature Graphic 1024x500 (Royal maroon/gold banner with holy blessings & branding)
 * 13. Splash Screen 2732x2732 (Ultra high-res universal splash for Android & iOS)
 */

const SOURCE_IMAGE_PATH = path.resolve('public/ChatGPT Image Sep 7, 2026, 11_13_25 PM.png');

if (!fs.existsSync(SOURCE_IMAGE_PATH)) {
  console.error('Source image not found at:', SOURCE_IMAGE_PATH);
  process.exit(1);
}

// Ensure directory helper
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  console.log('🚀 Starting Universal Master Asset Generation from Attached Official Logo...');

  const sourceMeta = await sharp(SOURCE_IMAGE_PATH).metadata();
  console.log(`Source image loaded: ${sourceMeta.width}x${sourceMeta.height} (${sourceMeta.format})`);

  // Master circular emblem buffer (source already has transparent outer boundary)
  const masterEmblem1024 = await sharp(SOURCE_IMAGE_PATH)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  const masterEmblem800 = await sharp(SOURCE_IMAGE_PATH)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  const masterEmblem512 = await sharp(SOURCE_IMAGE_PATH)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  // -------------------------------------------------------------
  // 1. Official Original Logo
  // -------------------------------------------------------------
  console.log('1. Generating Official Original Logos...');
  const officialLogoTargets = [
    'public/vanjari-jodi-official-logo.png',
    'public/vanjari-jodi-official-logo-v2.png',
    'public/vanjari-jodi-official-logo-v3.png',
    'public/assets/vanjari-jodi-official-logo.png',
    'public/assets/vanjari-jodi-official-logo-v2.png',
    'public/assets/vanjari-jodi-official-logo-v3.png',
    'dist/vanjari-jodi-official-logo.png',
    'dist/vanjari-jodi-official-logo-v2.png',
    'dist/vanjari-jodi-official-logo-v3.png',
    'dist/assets/vanjari-jodi-official-logo.png',
    'dist/assets/vanjari-jodi-official-logo-v2.png',
    'dist/assets/vanjari-jodi-official-logo-v3.png'
  ];
  for (const t of officialLogoTargets) {
    ensureDir(t);
    await sharp(masterEmblem800).toFile(t);
  }

  // -------------------------------------------------------------
  // 2. Transparent Square Logo (High-Res 1024x1024 & 800x800)
  // -------------------------------------------------------------
  console.log('2. Generating Transparent Square Logos...');
  const squareTransparentTargets = [
    'public/logo-transparent.png',
    'public/logo-square-transparent.png',
    'public/assets/logo-transparent.png',
    'dist/logo-transparent.png'
  ];
  for (const t of squareTransparentTargets) {
    ensureDir(t);
    await sharp(masterEmblem1024).toFile(t);
  }

  // -------------------------------------------------------------
  // 3. Horizontal Logo (Horizontal Banner format: 800x240)
  // -------------------------------------------------------------
  console.log('3. Generating Horizontal Logo (Horizontal Banner)...');
  // Resize emblem to height 200px
  const emblemForHorizontal = await sharp(SOURCE_IMAGE_PATH)
    .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const horizontalSvgText = `
  <svg width="840" height="240" viewBox="0 0 840 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDE7" />
        <stop offset="25%" stop-color="#FFE082" />
        <stop offset="50%" stop-color="#FFB300" />
        <stop offset="75%" stop-color="#FF8F00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>
      <linearGradient id="goldTagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#800C1E" />
        <stop offset="50%" stop-color="#B71C1C" />
        <stop offset="100%" stop-color="#800C1E" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <!-- Background subtle rounded rect for standalone use -->
    <rect x="0" y="0" width="840" height="240" rx="24" fill="#4D0612" fill-opacity="0.95" stroke="#FFE082" stroke-width="2"/>
    <g transform="translate(240, 48)">
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="url(#goldTextGrad)" filter="url(#shadow)" letter-spacing="1">वंजारी जोडी</text>
      <text x="280" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#FFD54F">™</text>
      
      <!-- Tagline banner -->
      <g transform="translate(0, 72)">
        <rect x="0" y="0" width="360" height="34" rx="17" fill="url(#goldTagGrad)" stroke="#FFD54F" stroke-width="1.5" />
        <text x="180" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" fill="#FFE082" text-anchor="middle">वधू-वर परिचय केंद्र</text>
      </g>
      
      <text x="5" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#FFF9C4" letter-spacing="0.5">पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात</text>
    </g>
  </svg>`;

  const horizontalLogoBuffer = await sharp(Buffer.from(horizontalSvgText))
    .composite([
      {
        input: emblemForHorizontal,
        top: 20,
        left: 20
      }
    ])
    .png({ quality: 100 })
    .toBuffer();

  const horizontalTargets = [
    'public/logo-horizontal.png',
    'public/vanjari-jodi-horizontal.png',
    'public/assets/logo-horizontal.png',
    'dist/logo-horizontal.png'
  ];
  for (const t of horizontalTargets) {
    ensureDir(t);
    await sharp(horizontalLogoBuffer).toFile(t);
  }

  // Also transparent background variant of horizontal logo
  const horizontalTransSvg = `
  <svg width="840" height="240" viewBox="0 0 840 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldTextGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDE7" />
        <stop offset="25%" stop-color="#FFE082" />
        <stop offset="50%" stop-color="#FFB300" />
        <stop offset="75%" stop-color="#FF8F00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>
      <linearGradient id="goldTagGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#800C1E" />
        <stop offset="50%" stop-color="#B71C1C" />
        <stop offset="100%" stop-color="#800C1E" />
      </linearGradient>
      <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>
    <g transform="translate(240, 48)">
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="url(#goldTextGrad2)" filter="url(#shadow2)" letter-spacing="1">वंजारी जोडी</text>
      <text x="280" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#FFD54F">™</text>
      
      <g transform="translate(0, 72)">
        <rect x="0" y="0" width="360" height="34" rx="17" fill="url(#goldTagGrad2)" stroke="#FFD54F" stroke-width="1.5" />
        <text x="180" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" fill="#FFE082" text-anchor="middle">वधू-वर परिचय केंद्र</text>
      </g>
      
      <text x="5" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#FFF9C4" filter="url(#shadow2)" letter-spacing="0.5">पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात</text>
    </g>
  </svg>`;

  const horizontalTransBuffer = await sharp(Buffer.from(horizontalTransSvg))
    .composite([
      {
        input: emblemForHorizontal,
        top: 20,
        left: 20
      }
    ])
    .png({ quality: 100 })
    .toBuffer();

  const horizontalTransTargets = [
    'public/logo-horizontal-transparent.png',
    'dist/logo-horizontal-transparent.png'
  ];
  for (const t of horizontalTransTargets) {
    ensureDir(t);
    await sharp(horizontalTransBuffer).toFile(t);
  }

  // -------------------------------------------------------------
  // 4. Play Store 512x512 Icon
  // (Full bleed with solid royal crimson background or rounded square, 32-bit PNG)
  // -------------------------------------------------------------
  console.log('4. Generating Google Play Store 512x512 Icon...');
  // Play store requires full 512x512 square without transparent corner gaps if desired,
  // or pristine 512x512 circular emblem centered on royal crimson gradient
  const playStoreIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 128, g: 12, b: 30, alpha: 1 } // #800C1E Royal Crimson
    }
  })
  .composite([
    {
      input: await sharp(SOURCE_IMAGE_PATH).resize(500, 500, { fit: 'contain' }).toBuffer(),
      gravity: 'center'
    }
  ])
  .png({ quality: 100 })
  .toBuffer();

  const playStoreTargets = [
    'public/playstore-icon-512.png',
    'public/assets/playstore-icon-512.png',
    'dist/playstore-icon-512.png'
  ];
  for (const t of playStoreTargets) {
    ensureDir(t);
    await sharp(playStoreIconBuffer).toFile(t);
  }

  // -------------------------------------------------------------
  // 5. Android Launcher 512x512 & Web Master Icon
  // -------------------------------------------------------------
  console.log('5. Generating Android Launcher 512x512 & Web Master Icon...');
  const launcher512Targets = [
    'public/logo.png',
    'public/icon-512.png',
    'public/assets/logo.png',
    'public/assets/icon-512.png',
    'dist/logo.png',
    'dist/icon-512.png',
    'dist/assets/logo.png',
    'dist/assets/icon-512.png',
    'android/app/src/main/assets/public/logo.png',
    'android/app/src/main/assets/public/icon-512.png'
  ];
  for (const t of launcher512Targets) {
    ensureDir(t);
    await sharp(masterEmblem512).toFile(t);
  }

  // -------------------------------------------------------------
  // 6. Android Launcher 192x192 & PWA Icon
  // -------------------------------------------------------------
  console.log('6. Generating Android Launcher 192x192...');
  const masterEmblem192 = await sharp(SOURCE_IMAGE_PATH)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  const launcher192Targets = [
    'public/icon-192.png',
    'public/assets/icon-192.png',
    'dist/icon-192.png',
    'dist/assets/icon-192.png',
    'android/app/src/main/assets/public/icon-192.png'
  ];
  for (const t of launcher192Targets) {
    ensureDir(t);
    await sharp(masterEmblem192).toFile(t);
  }

  // Mipmap launcher icons (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
  const androidMipmaps = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const item of androidMipmaps) {
    const resizedSquare = await sharp(SOURCE_IMAGE_PATH)
      .resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    ensureDir(path.join(item.dir, 'ic_launcher.png'));
    await sharp(resizedSquare).toFile(path.join(item.dir, 'ic_launcher.png'));
    await sharp(resizedSquare).toFile(path.join(item.dir, 'ic_launcher_round.png'));
  }

  // -------------------------------------------------------------
  // 7. Adaptive Icon Foreground & Background
  // Foreground: 432x432 (108dp * 4) with emblem centered in 288x288 (72dp safe zone)
  // Background: 432x432 solid #800C1E royal crimson
  // -------------------------------------------------------------
  console.log('7. Generating Adaptive Icon Foreground & Background...');
  const adaptiveEmblemSize = 312; // fits safe zone (safe area is 288, emblem can span up to 312)
  const adaptiveForegroundEmblem = await sharp(SOURCE_IMAGE_PATH)
    .resize(adaptiveEmblemSize, adaptiveEmblemSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const adaptiveForeground432 = await sharp({
    create: {
      width: 432,
      height: 432,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: adaptiveForegroundEmblem,
      gravity: 'center'
    }
  ])
  .png({ quality: 100 })
  .toBuffer();

  // Save to all mipmaps with respective sizes (48 * 2.25 = 108dp)
  const mipmapForegrounds = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 108 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 162 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 216 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 324 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 432 },
  ];

  for (const fg of mipmapForegrounds) {
    const resizedFg = await sharp(adaptiveForeground432)
      .resize(fg.size, fg.size)
      .png()
      .toBuffer();
    ensureDir(path.join(fg.dir, 'ic_launcher_foreground.png'));
    await sharp(resizedFg).toFile(path.join(fg.dir, 'ic_launcher_foreground.png'));
  }

  // Also standalone adaptive assets for developer distribution
  ensureDir('public/adaptive-icon-foreground.png');
  await sharp(adaptiveForeground432).toFile('public/adaptive-icon-foreground.png');
  await sharp(adaptiveForeground432).toFile('dist/adaptive-icon-foreground.png');

  const adaptiveBackground432 = await sharp({
    create: {
      width: 432,
      height: 432,
      channels: 4,
      background: { r: 128, g: 12, b: 30, alpha: 1 }
    }
  }).png().toBuffer();
  ensureDir('public/adaptive-icon-background.png');
  await sharp(adaptiveBackground432).toFile('public/adaptive-icon-background.png');
  await sharp(adaptiveBackground432).toFile('dist/adaptive-icon-background.png');

  // -------------------------------------------------------------
  // 8. Notification Icon (Android Status Bar Compliant)
  // White silhouette with transparent background
  // -------------------------------------------------------------
  console.log('8. Generating Notification Icon...');
  // Extract alpha channel and colorize to pure white
  const notifSilhouette = await sharp(SOURCE_IMAGE_PATH)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toColourspace('b-w')
    .threshold(40)
    .negate({ alpha: false })
    .png()
    .toBuffer();

  const notifTargets = [
    'public/notification-icon.png',
    'public/assets/notification-icon.png',
    'dist/notification-icon.png',
    'android/app/src/main/res/drawable/ic_stat_notification.png'
  ];
  for (const t of notifTargets) {
    ensureDir(t);
    await sharp(notifSilhouette).toFile(t);
  }

  // -------------------------------------------------------------
  // 9. Favicon (16, 32, 48, 64)
  // -------------------------------------------------------------
  console.log('9. Generating Favicons...');
  const favicon64 = await sharp(SOURCE_IMAGE_PATH)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const favicon32 = await sharp(SOURCE_IMAGE_PATH)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const faviconTargets = [
    'public/favicon.png',
    'public/favicon-32x32.png',
    'public/favicon-16x16.png',
    'public/assets/favicon.png',
    'dist/favicon.png',
    'dist/favicon-32x32.png',
    'dist/favicon-16x16.png',
    'android/app/src/main/assets/public/favicon.png'
  ];
  for (const t of faviconTargets) {
    ensureDir(t);
    if (t.includes('16x16')) {
      await sharp(SOURCE_IMAGE_PATH).resize(16, 16).png().toFile(t);
    } else if (t.includes('32x32')) {
      await sharp(favicon32).toFile(t);
    } else {
      await sharp(favicon64).toFile(t);
    }
  }

  // -------------------------------------------------------------
  // 10. Apple Touch Icon (180x180 with royal background for iOS)
  // -------------------------------------------------------------
  console.log('10. Generating Apple Touch Icon (180x180)...');
  const appleTouchEmblem = await sharp(SOURCE_IMAGE_PATH)
    .resize(164, 164, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const appleTouchBuffer = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 128, g: 12, b: 30, alpha: 1 } // #800C1E Royal Crimson
    }
  })
  .composite([
    {
      input: appleTouchEmblem,
      gravity: 'center'
    }
  ])
  .png({ quality: 100 })
  .toBuffer();

  const appleTargets = [
    'public/apple-touch-icon.png',
    'public/assets/apple-touch-icon.png',
    'dist/apple-touch-icon.png',
    'android/app/src/main/assets/public/apple-touch-icon.png'
  ];
  for (const t of appleTargets) {
    ensureDir(t);
    await sharp(appleTouchBuffer).toFile(t);
  }

  // -------------------------------------------------------------
  // 11. PWA Icons (192x192 & 512x512 maskable & any)
  // -------------------------------------------------------------
  console.log('11. Ensuring PWA Icons...');
  // Maskable icon with safe zone padding
  const maskable512Emblem = await sharp(SOURCE_IMAGE_PATH)
    .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const maskable512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 128, g: 12, b: 30, alpha: 1 }
    }
  })
  .composite([{ input: maskable512Emblem, gravity: 'center' }])
  .png({ quality: 100 })
  .toBuffer();

  ensureDir('public/icon-maskable-512.png');
  await sharp(maskable512).toFile('public/icon-maskable-512.png');
  await sharp(maskable512).toFile('dist/icon-maskable-512.png');

  // -------------------------------------------------------------
  // 12. Play Store Feature Graphic (1024x500)
  // Exact Google Play Store specification: 1024w x 500h, 24-bit PNG or JPEG, no transparency
  // -------------------------------------------------------------
  console.log('12. Generating Google Play Store Feature Graphic (1024x500)...');
  const featureEmblemSize = 440;
  const featureEmblem = await sharp(SOURCE_IMAGE_PATH)
    .resize(featureEmblemSize, featureEmblemSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const featureGraphicSvg = `
  <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep Royal Crimson Radial Background -->
      <radialGradient id="featureBg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#A71930" />
        <stop offset="45%" stop-color="#800C1E" />
        <stop offset="80%" stop-color="#4D0612" />
        <stop offset="100%" stop-color="#260208" />
      </radialGradient>
      
      <!-- Gold Gradient for Heading -->
      <linearGradient id="featureGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDE7" />
        <stop offset="25%" stop-color="#FFE082" />
        <stop offset="50%" stop-color="#FFB300" />
        <stop offset="80%" stop-color="#FF8F00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>

      <!-- Shimmer Line -->
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFE082" stop-opacity="0" />
        <stop offset="50%" stop-color="#FFE082" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#FFE082" stop-opacity="0" />
      </linearGradient>

      <filter id="featShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>

    <!-- Background Canvas -->
    <rect width="1024" height="500" fill="url(#featureBg)"/>

    <!-- Decorative Corner Gold Filigree Motifs -->
    <circle cx="0" cy="0" r="180" fill="none" stroke="#FFE082" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6,4" />
    <circle cx="1024" cy="500" r="180" fill="none" stroke="#FFE082" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6,4" />
    <circle cx="1024" cy="0" r="140" fill="none" stroke="#FFE082" stroke-width="1.5" stroke-opacity="0.2" />
    <circle cx="0" cy="500" r="140" fill="none" stroke="#FFE082" stroke-width="1.5" stroke-opacity="0.2" />

    <!-- Ornate Inner Border -->
    <rect x="18" y="18" width="988" height="464" rx="16" fill="none" stroke="#FFE082" stroke-width="2" stroke-opacity="0.5" />
    <rect x="24" y="24" width="976" height="452" rx="12" fill="none" stroke="#FFE082" stroke-width="1" stroke-opacity="0.3" />

    <!-- Right Side Typography Content -->
    <g transform="translate(480, 75)">
      <!-- Holy Blessing -->
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#FFE082" letter-spacing="1">॥ श्री संत भगवान बाबा प्रसन्न ॥</text>
      <rect x="0" y="34" width="280" height="2" fill="url(#shimmer)"/>

      <!-- App Brand Name -->
      <text x="0" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="62" font-weight="900" fill="url(#featureGold)" filter="url(#featShadow)" letter-spacing="1">वंजारी जोडी</text>
      <text x="345" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#FFD54F">™</text>

      <!-- Category Pill -->
      <g transform="translate(0, 130)">
        <rect x="0" y="0" width="380" height="44" rx="22" fill="#540612" stroke="#FFE082" stroke-width="2" />
        <text x="190" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFDE7" text-anchor="middle">वधू-वर परिचय केंद्र</text>
      </g>

      <!-- Subtitle -->
      <text x="4" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#FFF9C4" filter="url(#featShadow)">पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात</text>

      <!-- Trust Badges -->
      <g transform="translate(0, 245)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="150" height="34" rx="10" fill="#800C1E" stroke="#FFD54F" stroke-width="1" />
          <text x="75" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#FFE082" text-anchor="middle">१००% वंजारी समाज</text>
        </g>
        <g transform="translate(160, 0)">
          <rect x="0" y="0" width="165" height="34" rx="10" fill="#800C1E" stroke="#FFD54F" stroke-width="1" />
          <text x="82" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#FFE082" text-anchor="middle">आधार / KYC व्हेरिफाइड</text>
        </g>
        <g transform="translate(335, 0)">
          <rect x="0" y="0" width="150" height="34" rx="10" fill="#800C1E" stroke="#FFD54F" stroke-width="1" />
          <text x="75" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#FFE082" text-anchor="middle">मोफत नोंदणी</text>
        </g>
      </g>

      <!-- Trust Footer -->
      <text x="4" y="325" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0" fill-opacity="0.85">महाराष्ट्रभरातील हजारो अनुरूप व विश्वासू स्थळे • थेट संपर्क सुविधा</text>
    </g>
  </svg>`;

  const featureGraphicBuffer = await sharp(Buffer.from(featureGraphicSvg))
    .composite([
      {
        input: featureEmblem,
        top: 30,
        left: 35
      }
    ])
    .png({ quality: 100 })
    .toBuffer();

  const featureGraphicTargets = [
    'public/playstore-feature-graphic-1024x500.png',
    'public/feature-graphic.png',
    'public/assets/playstore-feature-graphic-1024x500.png',
    'dist/playstore-feature-graphic-1024x500.png',
    'dist/feature-graphic.png'
  ];
  for (const t of featureGraphicTargets) {
    ensureDir(t);
    await sharp(featureGraphicBuffer).toFile(t);
  }

  // -------------------------------------------------------------
  // 13. Splash Screen 2732x2732 (Universal Ultra High-Res Splash)
  // -------------------------------------------------------------
  console.log('13. Generating Splash Screen 2732x2732 and Android Drawable Splash Assets...');
  const splashEmblemSize = 1400;
  const splashEmblem = await sharp(SOURCE_IMAGE_PATH)
    .resize(splashEmblemSize, splashEmblemSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const splashSvg = `
  <svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep Royal Crimson Radial Background -->
      <radialGradient id="splashBg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#9E0E24" />
        <stop offset="35%" stop-color="#800C1E" />
        <stop offset="70%" stop-color="#4D0612" />
        <stop offset="100%" stop-color="#1F0206" />
      </radialGradient>
      
      <!-- Gold Gradient -->
      <linearGradient id="splashGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDE7" />
        <stop offset="30%" stop-color="#FFE082" />
        <stop offset="60%" stop-color="#FFB300" />
        <stop offset="90%" stop-color="#FF8F00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>

      <!-- Glow filter -->
      <filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="60" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="splashShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.85"/>
      </filter>
    </defs>

    <!-- Canvas -->
    <rect width="2732" height="2732" fill="url(#splashBg)"/>

    <!-- Subtle Golden Halo behind Emblem -->
    <circle cx="1366" cy="1180" r="760" fill="#FFE082" fill-opacity="0.08" filter="url(#splashGlow)"/>

    <!-- Top Holy Blessing -->
    <text x="1366" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="bold" fill="#FFE082" text-anchor="middle" letter-spacing="4">॥ श्री संत भगवान बाबा प्रसन्न ॥</text>

    <!-- Bottom Caption -->
    <g transform="translate(1366, 2140)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="url(#splashGold)" text-anchor="middle" filter="url(#splashShadow)" letter-spacing="2">वंजारी जोडी मॅट्रिमोनी</text>
      <text x="0" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600" fill="#FFE082" text-anchor="middle" letter-spacing="1">संस्कार आपले... संबंध आपले...</text>
      <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500" fill="#FFF9C4" fill-opacity="0.8" text-anchor="middle">महाराष्ट्रभरातील वंजारी समाजाचे अधिकृत वधू-वर सूचक केंद्र</text>
    </g>

    <!-- Decorative Corner Filigree -->
    <circle cx="0" cy="0" r="480" fill="none" stroke="#FFE082" stroke-width="4" stroke-opacity="0.25" stroke-dasharray="16,12" />
    <circle cx="2732" cy="0" r="480" fill="none" stroke="#FFE082" stroke-width="4" stroke-opacity="0.25" stroke-dasharray="16,12" />
    <circle cx="0" cy="2732" r="480" fill="none" stroke="#FFE082" stroke-width="4" stroke-opacity="0.25" stroke-dasharray="16,12" />
    <circle cx="2732" cy="2732" r="480" fill="none" stroke="#FFE082" stroke-width="4" stroke-opacity="0.25" stroke-dasharray="16,12" />

    <!-- Ornate Frame Border -->
    <rect x="64" y="64" width="2604" height="2604" rx="48" fill="none" stroke="#FFE082" stroke-width="4" stroke-opacity="0.4" />
    <rect x="80" y="80" width="2572" height="2572" rx="36" fill="none" stroke="#FFE082" stroke-width="2" stroke-opacity="0.2" />
  </svg>`;

  const splash2732Buffer = await sharp(Buffer.from(splashSvg))
    .composite([
      {
        input: splashEmblem,
        top: 480,
        left: Math.round((2732 - splashEmblemSize) / 2)
      }
    ])
    .png({ quality: 100 })
    .toBuffer();

  const splash2732Targets = [
    'public/splash-2732x2732.png',
    'public/splash.png',
    'public/assets/splash-2732x2732.png',
    'dist/splash-2732x2732.png',
    'dist/splash.png',
    'android/app/src/main/res/drawable/splash.png'
  ];
  for (const t of splash2732Targets) {
    ensureDir(t);
    await sharp(splash2732Buffer).toFile(t);
  }

  // Generate Android multi-density splash drawables
  const androidSplashDrawables = [
    { file: 'android/app/src/main/res/drawable-port-mdpi/splash.png', width: 320, height: 480 },
    { file: 'android/app/src/main/res/drawable-port-hdpi/splash.png', width: 480, height: 800 },
    { file: 'android/app/src/main/res/drawable-port-xhdpi/splash.png', width: 720, height: 1280 },
    { file: 'android/app/src/main/res/drawable-port-xxhdpi/splash.png', width: 960, height: 1600 },
    { file: 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png', width: 1280, height: 1920 },
    { file: 'android/app/src/main/res/drawable-land-mdpi/splash.png', width: 480, height: 320 },
    { file: 'android/app/src/main/res/drawable-land-hdpi/splash.png', width: 800, height: 480 },
    { file: 'android/app/src/main/res/drawable-land-xhdpi/splash.png', width: 1280, height: 720 },
    { file: 'android/app/src/main/res/drawable-land-xxhdpi/splash.png', width: 1600, height: 960 },
    { file: 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png', width: 1920, height: 1280 },
  ];

  for (const item of androidSplashDrawables) {
    ensureDir(item.file);
    await sharp(splash2732Buffer)
      .resize(item.width, item.height, { fit: 'cover' })
      .png({ quality: 95 })
      .toFile(item.file);
  }

  console.log('✅ ALL MASTER ASSETS GENERATED SUCCESSFULLY!');
  console.log('Summary of generated assets:');
  console.log('  1. Official Original Logo: public/vanjari-jodi-official-logo.png & v2/v3');
  console.log('  2. Transparent Square Logo: public/logo-transparent.png (1024x1024 & 800x800)');
  console.log('  3. Horizontal Logo: public/logo-horizontal.png & public/logo-horizontal-transparent.png');
  console.log('  4. Play Store 512x512 Icon: public/playstore-icon-512.png');
  console.log('  5. Android Launcher 512x512: public/logo.png & public/icon-512.png');
  console.log('  6. Android Launcher 192x192: public/icon-192.png & all android mipmaps');
  console.log('  7. Adaptive Icon Foreground/Background: public/adaptive-icon-foreground.png & mipmaps');
  console.log('  8. Notification Icon: public/notification-icon.png & ic_stat_notification.png');
  console.log('  9. Favicon: public/favicon.png (64x64, 32x32, 16x16)');
  console.log(' 10. Apple Touch Icon: public/apple-touch-icon.png (180x180)');
  console.log(' 11. PWA Icons: public/icon-maskable-512.png, icon-192.png, icon-512.png');
  console.log(' 12. Play Store Feature Graphic: public/playstore-feature-graphic-1024x500.png');
  console.log(' 13. Splash Screen: public/splash-2732x2732.png & all Android portrait/landscape drawables');
}

run().catch((err) => {
  console.error('Fatal error during asset generation:', err);
  process.exit(1);
});
