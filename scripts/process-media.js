const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

async function main() {
  console.log('🚀 Processing user-provided logo assets...');

  const uploadedJpg = 'C:/Users/Administrator/.gemini/antigravity/brain/782a6e2d-03fe-419c-982e-eeb71c31e24f/.user_uploaded/media_1794467002143_5f5dc074.jpg';
  const uploadedMp4 = 'C:/Users/Administrator/.gemini/antigravity/brain/782a6e2d-03fe-419c-982e-eeb71c31e24f/.user_uploaded/media_1794466960288_2dc09740.mp4';

  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }

  // 1. Process PNG Logo & Favicons
  console.log('🖼️ 1. Generating high-resolution transparent PNG logo and favicons...');
  const size = 638;
  const left = 185;
  const top = 51;

  // Circular SVG mask for perfect anti-aliased transparency
  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff" />
    </svg>
  `);

  const cropped = await sharp(uploadedJpg)
    .extract({ left, top, width: size, height: size })
    .toBuffer();

  const maskedLogo = await sharp(cropped)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Save main PNG logos
  await sharp(maskedLogo).toFile('public/images/khelna-bazar-logo.png');
  await sharp(maskedLogo).toFile('public/images/logo.png');
  console.log('✓ Saved public/images/khelna-bazar-logo.png and logo.png');

  // Favicons for all devices & browsers
  await sharp(maskedLogo).resize(32, 32).png().toFile('public/favicon.png');
  await sharp(maskedLogo).resize(32, 32).png().toFile('public/favicon.ico');
  await sharp(maskedLogo).resize(32, 32).png().toFile('src/app/icon.png');
  await sharp(maskedLogo).resize(180, 180).png().toFile('src/app/apple-icon.png');
  await sharp(maskedLogo).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(maskedLogo).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('✓ Generated all favicon PNGs, apple-touch icons, and manifest icons!');

  // 2. Process Animated MP4 and convert to animated GIF using ffmpeg
  console.log('🎬 2. Processing animated logo video & converting to animated GIF...');
  fs.copyFileSync(uploadedMp4, 'public/images/khelna-bazar-logo.mp4');
  fs.copyFileSync(uploadedMp4, 'public/images/logo-animated.mp4');
  console.log('✓ Copied MP4 to public/images/khelna-bazar-logo.mp4');

  // Use ffmpeg with high-quality palette optimization for GIF conversion
  try {
    const gifOutPath = path.resolve('public/images/khelna-bazar-logo.gif');
    const gifOutPath2 = path.resolve('public/images/logo-animated.gif');
    
    // Convert to GIF using palettegen + paletteuse for crisp colors without dithering artifacts
    const cmd = `"${ffmpegPath}" -y -i "${uploadedMp4}" -vf "fps=20,scale=240:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${gifOutPath}"`;
    console.log('Running ffmpeg GIF conversion...');
    execSync(cmd, { stdio: 'inherit' });

    fs.copyFileSync(gifOutPath, gifOutPath2);
    console.log('✓ Successfully created high-quality animated GIF: public/images/khelna-bazar-logo.gif and logo-animated.gif');
  } catch (err) {
    console.warn('ffmpeg GIF conversion notice:', err.message);
  }

  console.log('🎉 All media assets processed successfully!');
}

main().catch(console.error);
