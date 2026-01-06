const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Simple SVG icon template for EduNexus
const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-weight="bold" fill="white"
        font-size="${size * 0.4}">E</text>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#10B981"/>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate PNG icons
  for (const size of sizes) {
    const svg = createSvgIcon(size);
    const filename = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(filename);

    console.log(`Created: icon-${size}x${size}.png`);
  }

  // Create favicon.ico (using 32x32)
  const faviconSvg = createSvgIcon(32);
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('Created: favicon.png');

  // Create Apple Touch Icon (180x180)
  const appleTouchSvg = createSvgIcon(180);
  await sharp(Buffer.from(appleTouchSvg))
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png');

  // Create shortcut icons
  const shortcutIcons = ['attendance', 'fees', 'exams'];
  for (const name of shortcutIcons) {
    const svg = createSvgIcon(96);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, `${name}.png`));
    console.log(`Created: ${name}.png`);
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
