import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master SVG design for Vanjari Jodi Logo / App Icon
const generateSvgLogo = (width, height, isForegroundOnly = false) => {
  const bgFill = isForegroundOnly ? 'transparent' : 'url(#bgGradient)';
  const borderRadius = isForegroundOnly ? '0' : '20%';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}">
  <defs>
    <!-- Rich Crimson Red Royal Background Gradient -->
    <radialGradient id="bgGradient" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#B21E35" />
      <stop offset="60%" stop-color="#800C1E" />
      <stop offset="100%" stop-color="#540511" />
    </radialGradient>

    <!-- Royal Gold Metallic Gradient -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF099" />
      <stop offset="25%" stop-color="#F1C40F" />
      <stop offset="50%" stop-color="#E67E22" />
      <stop offset="75%" stop-color="#F39C12" />
      <stop offset="100%" stop-color="#B7950B" />
    </linearGradient>

    <linearGradient id="brightGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFE066" />
      <stop offset="50%" stop-color="#FFF" />
      <stop offset="100%" stop-color="#FFD700" />
    </linearGradient>

    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  ${!isForegroundOnly ? `
  <!-- Base Background Box with Smooth Rounded Corners for App Icon -->
  <rect width="512" height="512" rx="108" fill="${bgFill}" />
  ` : ''}

  <!-- Outer Ornate Gold Circular Crest Frame -->
  <g filter="url(#shadow)">
    <!-- Outer Gold Ring -->
    <circle cx="256" cy="256" r="220" fill="none" stroke="url(#goldGradient)" stroke-width="12" />
    <circle cx="256" cy="256" r="210" fill="none" stroke="#FFD700" stroke-width="2" stroke-dasharray="6,6" opacity="0.8" />
    <circle cx="256" cy="256" r="202" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
  </g>

  <!-- Traditional Top Mantra Header -->
  <g text-anchor="middle">
    <!-- Mantra Ribbon Background -->
    <path d="M 140,88 Q 256,70 372,88 L 360,118 Q 256,100 152,118 Z" fill="#42040B" stroke="url(#goldGradient)" stroke-width="1.5" />
    <text x="256" y="106" font-family="'Sanskrit', 'Noto Sans Devanagari', 'Arial', sans-serif" font-size="18" font-weight="900" fill="url(#brightGold)" text-anchor="middle" letter-spacing="1">
      ॥ श्री संत भगवान बाबा प्रसन्न ॥
    </text>
  </g>

  <!-- Central Auspicious Marriage Icon (Shubh Kalash & Tilak) -->
  <g transform="translate(256, 235)" filter="url(#shadow)">
    <!-- Shubh Kalash Base & Pot -->
    <!-- Mango Leaves -->
    <path d="M -45,-30 Q -70,-60 -30,-75 Q 0,-40 -5,-25 Z" fill="#2E7D32" stroke="#FFD700" stroke-width="1.5"/>
    <path d="M 45,-30 Q 70,-60 30,-75 Q 0,-40 5,-25 Z" fill="#2E7D32" stroke="#FFD700" stroke-width="1.5"/>
    <path d="M -25,-35 Q -35,-80 0,-95 Q 10,-50 0,-30 Z" fill="#388E3C" stroke="#FFD700" stroke-width="1.5"/>
    <path d="M 25,-35 Q 35,-80 0,-95 Q -10,-50 0,-30 Z" fill="#388E3C" stroke="#FFD700" stroke-width="1.5"/>
    
    <!-- Coconut / Nariyal with Tilak -->
    <circle cx="0" cy="-60" r="32" fill="#6D4C41" stroke="url(#goldGradient)" stroke-width="3" />
    <path d="M 0,-76 L 0,-44 M -16,-60 L 16,-60" stroke="#E53935" stroke-width="4" stroke-linecap="round" />
    <circle cx="0" cy="-60" r="5" fill="#FFD700" />

    <!-- Golden Kalash Vessel -->
    <path d="M -30,-20 C -40,-20 -40,-10 -25,-10 C -45,15 -40,45 0,52 C 40,45 45,15 25,-10 C 40,-10 40,-20 30,-20 Z" fill="url(#goldGradient)" stroke="#FFE066" stroke-width="2" />
    <!-- Kalash Neck Swastik / Sacred Lines -->
    <path d="M -25,12 Q 0,22 25,12" fill="none" stroke="#800C1E" stroke-width="3" />
    <circle cx="0" cy="22" r="4" fill="#800C1E" />
  </g>

  <!-- Main Brand Title: वंजारी जोडी -->
  <g text-anchor="middle" filter="url(#goldGlow)">
    <!-- Shadow effect behind title -->
    <text x="258" y="380" font-family="'Mukta', 'Noto Sans Devanagari', 'Tiro Devanagari Marathi', sans-serif" font-size="64" font-weight="900" fill="#2B0207" text-anchor="middle">
      वंजारी जोडी
    </text>
    <!-- Main Golden Title -->
    <text x="256" y="376" font-family="'Mukta', 'Noto Sans Devanagari', 'Tiro Devanagari Marathi', sans-serif" font-size="64" font-weight="900" fill="url(#brightGold)" stroke="#600812" stroke-width="2" text-anchor="middle" letter-spacing="1">
      वंजारी जोडी
    </text>
  </g>

  <!-- Tagline Badge at Bottom -->
  <g text-anchor="middle">
    <rect x="136" y="402" width="240" height="34" rx="17" fill="#42040B" stroke="url(#goldGradient)" stroke-width="2" />
    <text x="256" y="424" font-family="'Noto Sans Devanagari', sans-serif" font-size="18" font-weight="800" fill="#FFE066" text-anchor="middle" letter-spacing="1.5">
      वधू-वर सूचक
    </text>
  </g>

  <!-- Bottom Corner Ornate Stars -->
  <circle cx="256" cy="458" r="4" fill="url(#goldGradient)" />
  <circle cx="240" cy="458" r="2.5" fill="#FFD700" opacity="0.7" />
  <circle cx="272" cy="458" r="2.5" fill="#FFD700" opacity="0.7" />
</svg>`;
};

async function main() {
  console.log('Generating Vanjari Jodi high-resolution app icons...');

  const fullSvg = generateSvgLogo(512, 512, false);
  const foregroundSvg = generateSvgLogo(512, 512, true);

  // Write SVGs to public
  fs.writeFileSync(path.join(process.cwd(), 'public/vanjari-jodi-logo.svg'), fullSvg);

  // Write PNG icons to public
  const publicIcons = [
    { name: 'public/logo.png', size: 512 },
    { name: 'public/icon-192.png', size: 192 },
    { name: 'public/icon-512.png', size: 512 },
    { name: 'public/apple-touch-icon.png', size: 180 },
    { name: 'public/favicon.png', size: 64 },
  ];

  for (const icon of publicIcons) {
    const filePath = path.join(process.cwd(), icon.name);
    await sharp(Buffer.from(fullSvg))
      .resize(icon.size, icon.size)
      .png()
      .toFile(filePath);
    console.log(`Created ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Android mipmap icons
  const androidResDir = path.join(process.cwd(), 'android/app/src/main/res');

  if (fs.existsSync(androidResDir)) {
    const mipmapConfigs = [
      { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
      { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
      { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
      { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
      { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
    ];

    for (const config of mipmapConfigs) {
      const folderPath = path.join(androidResDir, config.folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // ic_launcher.png
      await sharp(Buffer.from(fullSvg))
        .resize(config.launcherSize, config.launcherSize)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // ic_launcher_round.png
      await sharp(Buffer.from(fullSvg))
        .resize(config.launcherSize, config.launcherSize)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));

      // ic_launcher_foreground.png
      await sharp(Buffer.from(foregroundSvg))
        .resize(config.foregroundSize, config.foregroundSize)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

      console.log(`Updated Android ${config.folder} launcher icons`);
    }

    // Splash screen update
    const drawableDir = path.join(androidResDir, 'drawable');
    if (fs.existsSync(drawableDir)) {
      await sharp(Buffer.from(fullSvg))
        .resize(1024, 1024)
        .png()
        .toFile(path.join(drawableDir, 'splash.png'));
      console.log('Updated Android splash.png');
    }
  }

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
