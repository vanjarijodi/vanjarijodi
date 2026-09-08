import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateChatGPTStyleLogo() {
  console.log('🎨 Creating ChatGPT AI-style Royal Vanjari Jodi Logo with AI Illustrated Saint Bhagwan Baba...');

  // Construct 800x800 High-Res SVG matching ChatGPT AI artwork
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

    <!-- Saffron Orange Turban Gradient -->
    <linearGradient id="vjPhetaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9800" />
      <stop offset="40%" stop-color="#FF6F00" />
      <stop offset="80%" stop-color="#E65100" />
      <stop offset="100%" stop-color="#BF360C" />
    </linearGradient>

    <linearGradient id="vjPhetaGoldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFB300" />
    </linearGradient>

    <!-- Skin Tone Gradient -->
    <linearGradient id="vjSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE0B2" />
      <stop offset="60%" stop-color="#F5C28B" />
      <stop offset="100%" stop-color="#E0A367" />
    </linearGradient>

    <linearGradient id="vjBannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDE7" />
      <stop offset="40%" stop-color="#FFF59D" />
      <stop offset="80%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFCA28" />
    </linearGradient>

    <!-- Radiant Sunburst Halo -->
    <radialGradient id="vjHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF9C4" stop-opacity="1" />
      <stop offset="35%" stop-color="#FFE082" stop-opacity="0.85" />
      <stop offset="70%" stop-color="#FF8F00" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#8E0C20" stop-opacity="0" />
    </radialGradient>

    <!-- Filters -->
    <filter id="vjDropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <filter id="vjGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#FFD54F" flood-opacity="0.85" />
    </filter>

    <filter id="vj3DTextShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#1A0004" flood-opacity="0.9" />
    </filter>
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

  <!-- 1. RADIANT GOLDEN HALO BEHIND SAINT BHAGWAN BABA -->
  <circle cx="400" cy="215" r="145" fill="url(#vjHalo)" />

  <!-- Sun Rays -->
  <g opacity="0.3">
    ${Array.from({ length: 24 })
      .map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x2 = 400 + 140 * Math.cos(rad);
        const y2 = 215 + 140 * Math.sin(rad);
        return `<line x1="400" y1="215" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FFE082" stroke-width="2.5" />`;
      })
      .join('\n')}
  </g>

  <!-- 2. AI ILLUSTRATION PORTRAIT OF SAINT BHAGWAN BABA (MATCHING CHATGPT ARTWORK) -->
  <g transform="translate(400, 215)" filter="url(#vjDropShadow)">
    <!-- Outer Gold Frame for Portrait Medallion -->
    <circle cx="0" cy="0" r="102" fill="none" stroke="url(#vjGoldGrad)" stroke-width="6" filter="url(#vjGoldGlow)" />
    <circle cx="0" cy="0" r="97" fill="#4A020B" stroke="#FFE082" stroke-width="2" />

    <g transform="translate(0, -5)">
      <!-- A. White Shirt / Kurta Base -->
      <path d="M -60,65 C -55,38 -35,30 0,30 C 35,30 55,38 60,65 L 68,95 L -68,95 Z" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1.5" />
      <path d="M -12,32 L 0,55 L 12,32 Z" fill="#F5F5F5" />
      <!-- Collar Lines -->
      <path d="M -25,32 L -10,50 L 0,33 L 10,50 L 25,32" fill="none" stroke="#D6D6D6" stroke-width="2" />

      <!-- B. Green Leaf Garland (हिरवी पानांची माळ) -->
      <g>
        <!-- Left Strand -->
        <path d="M -45,35 Q -30,68 0,72 Q -30,62 -40,32 Z" fill="#2E7D32" stroke="#1B5E20" stroke-width="1" />
        <circle cx="-38" cy="40" r="6" fill="#4CAF50" />
        <circle cx="-30" cy="52" r="7" fill="#388E3C" />
        <circle cx="-18" cy="63" r="6" fill="#81C784" />

        <!-- Right Strand -->
        <path d="M 45,35 Q 30,68 0,72 Q 30,62 40,32 Z" fill="#2E7D32" stroke="#1B5E20" stroke-width="1" />
        <circle cx="38" cy="40" r="6" fill="#4CAF50" />
        <circle cx="30" cy="52" r="7" fill="#388E3C" />
        <circle cx="18" cy="63" r="6" fill="#81C784" />

        <!-- Central Pendant Leaf -->
        <circle cx="0" cy="72" r="8" fill="#FFD54F" stroke="#E65100" stroke-width="2" />
      </g>

      <!-- C. Neck -->
      <path d="M -18,12 L -18,35 C -18,42 18,42 18,35 L 18,12 Z" fill="url(#vjSkinGrad)" />

      <!-- D. Face Outline -->
      <path d="M -32,-25 C -35,-5 -28,25 0,28 C 28,25 35,-5 32,-25 C 30,-42 -30,-42 -32,-25 Z" fill="url(#vjSkinGrad)" stroke="#D7CCC8" stroke-width="1" />

      <!-- Ears -->
      <circle cx="-32" cy="-5" r="7" fill="#F5C28B" />
      <circle cx="32" cy="-5" r="7" fill="#F5C28B" />

      <!-- E. Eyes & Eyebrows -->
      <!-- Left Eye -->
      <path d="M -22,-12 Q -15,-18 -8,-12 Q -15,-8 -22,-12 Z" fill="#FFFFFF" stroke="#3E2723" stroke-width="1" />
      <circle cx="-15" cy="-13" r="3.5" fill="#1A0004" />
      <path d="M -24,-19 Q -15,-24 -6,-19" fill="none" stroke="#212121" stroke-width="3" stroke-linecap="round" />

      <!-- Right Eye -->
      <path d="M 8,-12 Q 15,-18 22,-12 Q 15,-8 8,-12 Z" fill="#FFFFFF" stroke="#3E2723" stroke-width="1" />
      <circle cx="15" cy="-13" r="3.5" fill="#1A0004" />
      <path d="M 6,-19 Q 15,-24 24,-19" fill="none" stroke="#212121" stroke-width="3" stroke-linecap="round" />

      <!-- Nose -->
      <path d="M 0,-15 L -3,3 Q 0,7 3,3 Z" fill="none" stroke="#D7A15C" stroke-width="2" stroke-linecap="round" />

      <!-- Red Saffron Tilak / Bindi on Forehead -->
      <path d="M -4,-28 L 0,-36 L 4,-28 Q 0,-24 -4,-28 Z" fill="#D50000" />
      <circle cx="0" cy="-22" r="3" fill="#FF6F00" />

      <!-- F. Classic Black Mustache (मीशी) -->
      <path d="M -22,12 C -12,4 -2,8 0,11 C 2,8 12,4 22,12 C 26,15 16,18 0,14 C -16,18 -26,15 -22,12 Z" fill="#1A0004" stroke="#000" stroke-width="0.5" />

      <!-- Gentle Smile Line -->
      <path d="M -8,20 Q 0,24 8,20" fill="none" stroke="#8D6E63" stroke-width="1.5" stroke-linecap="round" />

      <!-- G. AI-Illustrated Saffron Orange Pheta (भगवा फेटा / Turban) -->
      <g>
        <!-- Pheta Base Layer -->
        <path d="M -38,-22 C -42,-45 -25,-68 0,-68 C 25,-68 42,-45 38,-22 C 34,-18 28,-28 0,-28 C -28,-28 -34,-18 -38,-22 Z" fill="url(#vjPhetaGrad)" filter="url(#vjDropShadow)" />

        <!-- Pheta Swirls & Folds (कापडाच्या घड्या) -->
        <path d="M -38,-28 C -25,-52 0,-58 35,-42 C 10,-55 -20,-48 -35,-32 Z" fill="#FF9800" opacity="0.9" />
        <path d="M -35,-40 C -15,-62 18,-64 38,-35 C 15,-52 -10,-50 -30,-38 Z" fill="#E65100" opacity="0.85" />
        <path d="M -28,-50 C -5,-72 25,-68 36,-48 C 18,-60 -2,-58 -22,-46 Z" fill="#FF8F00" />

        <!-- Gold Pheta Border/Patti -->
        <path d="M -36,-24 Q 0,-34 36,-24 Q 0,-28 -36,-24 Z" fill="url(#vjPhetaGoldHighlight)" />

        <!-- Top Saffron Turra / Fan Crest (फेट्याचा तुरा) -->
        <path d="M 12,-62 C 18,-82 38,-85 45,-68 C 38,-65 28,-62 12,-62 Z" fill="#FF6F00" stroke="#FFE082" stroke-width="1" />
        <path d="M 22,-65 C 28,-80 42,-82 46,-70" fill="none" stroke="#FFD54F" stroke-width="1.5" />
      </g>
    </g>
  </g>

  <!-- 3. FLANKING DEVANAGARI TEXT -->
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

  // Render SVG to all PNG asset sizes using Sharp
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

  console.log('🖼️ Converting ChatGPT AI Artwork SVG to PNG assets...');
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

  console.log('🎉 CHATGPT AI LOGO SUCCESSFULLY APPLIED TO ALL ASSETS!');
}

generateChatGPTStyleLogo().catch((err) => {
  console.error('Error in generateChatGPTStyleLogo:', err);
  process.exit(1);
});
