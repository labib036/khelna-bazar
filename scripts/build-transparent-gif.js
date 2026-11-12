const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const input = path.resolve('scripts/frames/clean_%d.png').replace(/\\/g, '/');
const outputGif = path.resolve('public/images/khelna-bazar-logo.gif').replace(/\\/g, '/');
const outputWebp = path.resolve('public/images/khelna-bazar-logo.webp').replace(/\\/g, '/');

console.log('Generating transparent GIF with infinite loop...');
const cmdGif = `"${ffmpeg}" -y -framerate 10 -i "${input}" -filter_complex "[0:v]split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=00000000[p];[b][p]paletteuse=alpha_threshold=128" -loop 0 "${outputGif}"`;
execSync(cmdGif, { stdio: 'inherit' });

console.log('Generating animated WebP with infinite loop...');
const cmdWebp = `"${ffmpeg}" -y -framerate 10 -i "${input}" -vcodec libwebp -lossless 1 -loop 0 "${outputWebp}"`;
execSync(cmdWebp, { stdio: 'inherit' });

fs.copyFileSync(outputGif, path.resolve('public/images/logo-animated.gif'));
console.log('✓ Successfully created looping transparent GIF and WebP!');
