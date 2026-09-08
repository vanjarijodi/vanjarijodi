import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateOfficialLogo() {
  console.log('🎨 Generating Official Royal Vanjari Jodi Logo with Real Photo of Saint Bhagwan Baba...');

  // 1. Read the cropped photo of Saint Bhagwan Baba
  const babaHeadPath = path.resolve('public/bhagwan-baba-head.png');
  if (!fs.existsSync(babaHeadPath)) {
    console.error('File public/bhagwan-baba-head.png not found!');
    process.exit(1);
  }

  const babaHeadBase64 = fs.readFileSync(babaHeadPath).toString('base64');
  const babaDataUri = `data:image/png;base64,${babaHeadBase64}`;

  // 2. Construct 800x800 High-Res SVG
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <!-- Deep Royal Crimson Radial Background -->
    <radialGradient id="vjMaroonBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#8E0C20" />
      <stop offset="50%" stop-color="#5B0513" />
      <stop offset="85%" stop-color="#320108" />
      <stop offset="100%" stop-color="#1A0004" />
    </radialGradient>

    <!-- Metallic Gold Gradients -->
    <linearGradient id="vjGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDE7" />
      <stop offset="20%" stop-color="#FFE082" />
      <stop offset="45%" stop-color="#FFB300" />
      <stop offset="70%" stop-color="#FF8F00" />
      <stop offset="90%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF6F00" />
    </linearGradient>

    <linearGradient id="vjGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="50%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFB300" />
    </linearGradient>

    <linearGradient id="vjBannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDE7" />
      <stop offset="40%" stop-color="#FFF59D" />
      <stop offset="80%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFCA28" />
    </linearGradient>

    <!-- Radiant Sunburst Halo -->
    <radialGradient id="vjHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF9C4" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#FFE082" stop-opacity="0.7" />
      <stop offset="75%" stop-color="#FF8F00" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#8E0C20" stop-opacity="0" />
    </radialGradient>

    <!-- Filters -->
    <filter id="vjDropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <filter id="vjGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#FFD54F" flood-opacity="0.8" />
    </filter>

    <filter id="vj3DTextShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#1A0004" flood-opacity="0.9" />
    </filter>

    <!-- Clip Paths -->
    <clipPath id="babaCircleClip">
      <circle cx="400" cy="220" r="92" />
    </clipPath>
    <clipPath id="innerMaroonClip">
      <circle cx="400" cy="400" r="366" />
    </clipPath>
  </defs>

  <!-- Outer Metallic Gold Ring Frame -->
  <circle cx="400" cy="400" r="390" fill="none" stroke="url(#vjGoldGrad)" stroke-width="18" filter="url(#vjDropShadow)" />
  <circle cx="400" cy="400" r="378" fill="none" stroke="#FFE082" stroke-width="3" />
  <circle cx="400" cy="400" r="368" fill="url(#vjMaroonBg)" stroke="url(#vjGoldGrad)" stroke-width="5" />

  <!-- Inner Decorative Ring Dots -->
  <g opacity="0.35">
    ${Array.from({ length: 48 })
      .map((_, i) => {
        const angle = (i * 360) / 48;
        const rad = (angle * Math.PI) / 180;
        const cx = 400 + 363 * Math.cos(rad);
        const cy = 400 + 363 * Math.sin(rad);
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3" fill="#FFE082" />`;
      })
      .join('\n')}
  </g>

  <!-- 1. SUNBURST HALO BEHIND SAINT BHAGWAN BABA -->
  <circle cx="400" cy="220" r="140" fill="url(#vjHalo)" />

  <!-- Sun Rays -->
  <g opacity="0.25">
    ${Array.from({ length: 24 })
      .map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x2 = 400 + 135 * Math.cos(rad);
        const y2 = 220 + 135 * Math.sin(rad);
        return `<line x1="400" y1="220" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FFE082" stroke-width="2" />`;
      })
      .join('\n')}
  </g>

  <!-- 2. SAINT SHRI BHAGWAN BABA REAL PHOTO PORTRAIT -->
  <!-- Outer Gold Frame for Portrait -->
  <circle cx="400" cy="220" r="98" fill="none" stroke="url(#vjGoldGrad)" stroke-width="6" filter="url(#vjGoldGlow)" />
  <circle cx="400" cy="220" r="93" fill="#5B0513" />

  <!-- Real Portrait Image -->
  <image
    href="${babaDataUri}"
    x="300"
    y="120"
    width="200"
    height="200"
    clip-path="url(#babaCircleClip)"
    preserveAspectRatio="xMidYMid slice"
  />

  <!-- 3. FLANKING CALLIGRAPHY TEXT -->
  <!-- Left: संस्कार आपले... -->
  <g filter="url(#vj3DTextShadow)">
    <text x="170" y="200" fill="#FFF9C4" font-size="28" font-weight="900" font-family="'Yatra One', 'Baloo 2', serif" text-anchor="middle">संस्कार</text>
    <text x="170" y="235" fill="#FFD54F" font-size="26" font-weight="900" font-family="'Yatra One', 'Baloo 2', serif" text-anchor="middle">आपले...</text>
  </g>

  <!-- Right: संबंध आपले... -->
  <g filter="url(#vj3DTextShadow)">
    <text x="630" y="200" fill="#FFF9C4" font-size="28" font-weight="900" font-family="'Yatra One', 'Baloo 2', serif" text-anchor="middle">संबंध</text>
    <text x="630" y="235" fill="#FFD54F" font-size="26" font-weight="900" font-family="'Yatra One', 'Baloo 2', serif" text-anchor="middle">आपले...</text>
  </g>

  <!-- 4. GOLDEN HEART MEDALLION WITH SILHOUETTES -->
  <g transform="translate(400, 360)">
    <!-- Heart Frame Outer -->
    <path
      d="M 0,40 C -60,-15 -100,-50 -100,-90 C -100,-125 -70,-150 -35,-150 C -15,-15 0,0 0,0 C 0,0 15,-15 35,-150 C 70,-150 100,-125 100,-90 C 100,-50 60,-15 0,40 Z"
      fill="url(#vjGoldGrad)"
      filter="url(#vjDropShadow)"
    />
    <!-- Heart Inner Fill -->
    <path
      d="M 0,32 C -52,-18 -88,-48 -88,-82 C -88,-112 -62,-134 -30,-134 C -12,-134 0,-120 0,-120 C 0,-120 12,-134 30,-134 C 62,-134 88,-112 88,-82 C 88,-48 52,-18 0,32 Z"
      fill="#4A020B"
      stroke="url(#vjGoldLight)"
      stroke-width="2"
    />

    <!-- Groom & Bride Silhouettes inside Heart -->
    <!-- Groom (Left) -->
    <g transform="translate(-25, -75) scale(0.75)">
      <!-- Pheta -->
      <path d="M -20,-15 C -25,-30 0,-40 20,-25 C 25,-15 15,0 -5,5 Z" fill="#FF8F00" />
      <!-- Face profile -->
      <path d="M -10,-10 C -5,-10 0,-5 2,5 C 4,12 8,15 12,18 C 5,22 -5,22 -12,15 Z" fill="#FFF9C4" />
      <!-- Mustache & Coat -->
      <path d="M 0,8 Q 8,6 12,12 Z" fill="#1A0004" />
      <path d="M -20,25 C -15,15 15,15 20,25 L 22,45 L -22,45 Z" fill="#FFFDE7" />
    </g>

    <!-- Bride (Right) -->
    <g transform="translate(25, -75) scale(0.75)">
      <!-- Hair bun with flowers -->
      <circle cx="15" cy="-5" r="10" fill="#1A0004" />
      <circle cx="18" cy="-5" r="5" fill="#FFD54F" />
      <!-- Face profile -->
      <path d="M 10,-10 C 5,-10 0,-5 -2,5 C -4,12 -8,15 -12,18 C -5,22 5,22 12,15 Z" fill="#FFF9C4" />
      <circle cx="-2" cy="0" r="2" fill="#D50000" /> <!-- Bindi -->
      <!-- Saree drape -->
      <path d="M -20,25 C -15,15 15,15 20,25 L 22,45 L -22,45 Z" fill="#FF8F00" />
    </g>
  </g>

  <!-- 5. MAIN BRAND NAME - 3D GOLDEN DEVANAGARI TEXT -->
  <g filter="url(#vjDropShadow)">
    <!-- 3D Shadow Layers for Extrusion -->
    <text x="400" y="508" fill="#1A0004" font-size="88" font-weight="900" font-family="'Yatra One', 'Rozha One', 'Baloo 2', serif" text-anchor="middle" letter-spacing="1">वंजारी जोडी</text>
    <text x="400" y="506" fill="#3D010A" font-size="88" font-weight="900" font-family="'Yatra One', 'Rozha One', 'Baloo 2', serif" text-anchor="middle" letter-spacing="1">वंजारी जोडी</text>
    <text x="400" y="504" fill="#B8860B" font-size="88" font-weight="900" font-family="'Yatra One', 'Rozha One', 'Baloo 2', serif" text-anchor="middle" letter-spacing="1">वंजारी जोडी</text>
    
    <!-- Top Gold Gradient Fill -->
    <text x="400" y="500" fill="url(#vjGoldGrad)" stroke="#FFE082" stroke-width="2" font-size="88" font-weight="900" font-family="'Yatra One', 'Rozha One', 'Baloo 2', serif" text-anchor="middle" letter-spacing="1">वंजारी जोडी</text>
  </g>

  <!-- Trademark TM -->
  <text x="668" y="450" fill="#FFE082" font-size="22" font-weight="900" font-family="sans-serif">TM</text>

  <!-- 6. GOLD PARCHMENT BANNER RIBBON -->
  <g transform="translate(400, 580)" filter="url(#vjDropShadow)">
    <!-- Banner Shape -->
    <path
      d="M -260,-25 L 260,-25 Q 280,-25 280,0 Q 280,25 260,25 L -260,25 Q -280,25 -280,0 Q -280,-25 -260,-25 Z"
      fill="url(#vjBannerGrad)"
      stroke="url(#vjGoldGrad)"
      stroke-width="4"
    />
    <!-- Banner Inner Border -->
    <path
      d="M -252,-19 L 252,-19 Q 270,-19 270,0 Q 270,19 252,19 L -252,19 Q -270,19 -270,0 Q -270,-19 -252,-19 Z"
      fill="none"
      stroke="#B8860B"
      stroke-width="1.5"
    />

    <!-- Banner Side Fold Decor -->
    <circle cx="-250" cy="0" r="6" fill="#8E0C20" />
    <circle cx="250" cy="0" r="6" fill="#8E0C20" />

    <!-- Banner Text -->
    <text
      x="0"
      y="11"
      fill="#5B0513"
      font-size="34"
      font-weight="900"
      font-family="'Yatra One', 'Baloo 2', serif"
      text-anchor="middle"
      letter-spacing="0.5"
    >वधू-वर परिचय केंद्र</text>
  </g>

  <!-- 7. TAGLINE -->
  <g filter="url(#vj3DTextShadow)">
    <text
      x="400"
      y="650"
      fill="#FFF9C4"
      font-size="26"
      font-weight="900"
      font-family="'Yatra One', 'Baloo 2', serif"
      text-anchor="middle"
      letter-spacing="0.5"
    >पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात</text>
  </g>

  <!-- 8. BOTTOM INTERLOCKING WEDDING RINGS & FILIGREE -->
  <g transform="translate(400, 715)" filter="url(#vjDropShadow)">
    <!-- Scroll Filigree Left -->
    <path d="M -30,0 C -60,15 -110,-10 -150,0 C -120,-20 -70,0 -30,0 Z" fill="url(#vjGoldGrad)" />
    <!-- Scroll Filigree Right -->
    <path d="M 30,0 C 60,15 110,-10 150,0 C 120,-20 70,0 30,0 Z" fill="url(#vjGoldGrad)" />

    <!-- Interlocking Rings -->
    <!-- Left Ring -->
    <ellipse cx="-16" cy="-5" rx="26" ry="16" fill="none" stroke="url(#vjGoldGrad)" stroke-width="7" />
    <ellipse cx="-16" cy="-5" rx="26" ry="16" fill="none" stroke="#FFF9C4" stroke-width="2" />

    <!-- Right Ring -->
    <ellipse cx="16" cy="-5" rx="26" ry="16" fill="none" stroke="url(#vjGoldGrad)" stroke-width="7" />
    <ellipse cx="16" cy="-5" rx="26" ry="16" fill="none" stroke="#FFF9C4" stroke-width="2" />

    <!-- Diamond Sparkle -->
    <polygon points="0,-22 4,-16 0,-10 -4,-16" fill="#FFF" />
  </g>
</svg>`;

  // Write SVG file to public/vanjari-jodi-logo.svg
  fs.writeFileSync('public/vanjari-jodi-logo.svg', svgContent);
  console.log('✓ Successfully wrote public/vanjari-jodi-logo.svg');

  // 3. Render SVG to all PNG asset sizes using Sharp
  const svgBuffer = Buffer.from(svgContent);

  async function renderPng(outputPath, size) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`  ✓ Generated ${outputPath} (${size}x${size})`);
  }

  console.log('🖼️ Converting SVG to PNG assets for web and Android APK...');
  await renderPng('public/logo.png', 800);
  await renderPng('public/icon-512.png', 512);
  await renderPng('public/icon-192.png', 192);
  await renderPng('public/apple-touch-icon.png', 180);
  await renderPng('public/favicon.png', 64);

  // Android Mipmap Icons
  const androidMipmaps = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const item of androidMipmaps) {
    await renderPng(path.join(item.dir, 'ic_launcher.png'), item.size);
    await renderPng(path.join(item.dir, 'ic_launcher_round.png'), item.size);
    await renderPng(path.join(item.dir, 'ic_launcher_foreground.png'), item.size);
  }

  // Android Public Assets bundle
  const androidAssetsPublic = 'android/app/src/main/assets/public';
  if (fs.existsSync(androidAssetsPublic)) {
    await renderPng(path.join(androidAssetsPublic, 'logo.png'), 800);
    await renderPng(path.join(androidAssetsPublic, 'icon-512.png'), 512);
    await renderPng(path.join(androidAssetsPublic, 'icon-192.png'), 192);
    await renderPng(path.join(androidAssetsPublic, 'apple-touch-icon.png'), 180);
    await renderPng(path.join(androidAssetsPublic, 'favicon.png'), 64);
  }

  console.log('🎉 ALL LOGO AND APP ICON ASSETS UPDATED PERFECTLY!');
}

generateOfficialLogo().catch((err) => {
  console.error('Error in generateOfficialLogo:', err);
  process.exit(1);
});
