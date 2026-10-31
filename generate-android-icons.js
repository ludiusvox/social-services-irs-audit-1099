import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Define target directories and sizes for Android icons
const RES_DIR = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');
const ANDROID_MAIN_DIR = path.join(process.cwd(), 'android', 'app', 'src', 'main');
const STORE_DIR = path.join(process.cwd(), 'store');
const ASSETS_DIR = path.join(process.cwd(), 'assets');

// Standard Android Mipmap densities and pixel sizes
const ICON_SIZES = [
  { density: 'mipmap-mdpi', size: 48, adaptiveSize: 108 },
  { density: 'mipmap-hdpi', size: 72, adaptiveSize: 162 },
  { density: 'mipmap-xhdpi', size: 96, adaptiveSize: 216 },
  { density: 'mipmap-xxhdpi', size: 144, adaptiveSize: 324 },
  { density: 'mipmap-xxxhdpi', size: 192, adaptiveSize: 432 },
];

/**
 * Locate source icon from CLI argument or system default locations
 */
function findSourceIcon() {
  const customArg = process.argv[2];
  if (customArg && fs.existsSync(customArg)) {
    return path.resolve(customArg);
  }

  const candidatePaths = [
    path.join('C:', 'Users', 'Aaron', 'Downloads', 'icon rev-01.png'),
    path.join(process.cwd(), 'assets', 'icon.png'),
    path.join(process.cwd(), 'resources', 'icon.png'),
    path.join(process.cwd(), 'public', 'icon.png')
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Source icon not found. Please provide an icon path or place icon rev-01.png in Downloads or assets/icon.png.'
  );
}

/**
 * Locate 1024x500 feature graphic background source
 */
function findFeatureGraphicSource() {
  const candidatePaths = [
    path.join('C:', 'Users', 'Aaron', 'Downloads', 'icon rev-01a.png'),
    path.join(process.cwd(), 'assets', 'icon rev-01a.png')
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Generate SVG Circle mask buffer for round icon creation
 */
function createCircleMask(size) {
  const svg = `<svg width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#ffffff"/>
  </svg>`;
  return Buffer.from(svg);
}

async function generateIcons() {
  try {
    const sourcePath = findSourceIcon();
    console.log(`\n🎨 Using source icon: ${sourcePath}`);

    // Ensure assets directory exists and copy master icon
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
    const masterCopy = path.join(ASSETS_DIR, 'icon.png');
    fs.copyFileSync(sourcePath, masterCopy);
    console.log(`📁 Saved master icon copy to: ${masterCopy}`);

    // Ensure store directory exists
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }

    const sourceImage = sharp(sourcePath);
    const metadata = await sourceImage.metadata();
    console.log(`ℹ️  Source Image Dimensions: ${metadata.width}x${metadata.height}`);

    // 1. Generate Google Play Store 512x512 App Icon
    console.log('\n🚀 Generating Play Store 512x512 App Icon...');
    const playStoreIconPath = path.join(STORE_DIR, 'play_store_512.png');
    const appIcon512Path = path.join(STORE_DIR, 'app_icon_512x512.png');
    const webLauncherPath = path.join(ANDROID_MAIN_DIR, 'ic_launcher-web.png');

    await sharp(sourcePath)
      .resize(512, 512, { fit: 'cover', kernel: 'lanczos3' })
      .toFormat('png')
      .toFile(playStoreIconPath);

    fs.copyFileSync(playStoreIconPath, appIcon512Path);
    fs.copyFileSync(playStoreIconPath, webLauncherPath);
    console.log(`  ✅ Play Store Icon (512x512): ${playStoreIconPath}`);
    console.log(`  ✅ App Icon (512x512): ${appIcon512Path}`);
    console.log(`  ✅ Android Web Launcher: ${webLauncherPath}`);

    // 2. Generate Google Play Store 1024x500 Feature Graphic Background
    console.log('\n🖼️  Generating Play Store 1024x500 Feature Graphic Background...');
    const featureGraphicPath = path.join(STORE_DIR, 'feature_graphic_1024x500.png');
    const featureGraphicBrandedPath = path.join(STORE_DIR, 'feature_graphic_1024x500_branded.png');

    const featureSourcePath = findFeatureGraphicSource();
    if (featureSourcePath) {
      await sharp(featureSourcePath)
        .resize(1024, 500, { fit: 'cover', kernel: 'lanczos3' })
        .toFormat('png')
        .toFile(featureGraphicPath);
      console.log(`  ✅ Feature Graphic (1024x500 from source): ${featureGraphicPath}`);
    } else {
      await sharp(sourcePath)
        .resize(1024, 500, { fit: 'cover', kernel: 'lanczos3' })
        .toFormat('png')
        .toFile(featureGraphicPath);
      console.log(`  ✅ Feature Graphic (1024x500): ${featureGraphicPath}`);
    }

    // Centered brand composite graphic
    const overlayBuffer = await sharp(sourcePath)
      .resize(320, 320, { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: 1024,
        height: 500,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // Deep slate navy (#0F172A)
      }
    })
      .composite([{ input: overlayBuffer, top: 90, left: 352 }])
      .toFormat('png')
      .toFile(featureGraphicBrandedPath);

    console.log(`  ✅ Branded Feature Graphic (1024x500): ${featureGraphicBrandedPath}`);

    // 3. Generate Android Launcher Icons across all mipmap densities
    console.log('\n📱 Generating Android Launcher & Adaptive Icons...');

    for (const item of ICON_SIZES) {
      const folderPath = path.join(RES_DIR, item.density);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Standard launcher icon (ic_launcher.png)
      const launcherPath = path.join(folderPath, 'ic_launcher.png');
      await sharp(sourcePath)
        .resize(item.size, item.size, { fit: 'cover', kernel: 'lanczos3' })
        .toFormat('png')
        .toFile(launcherPath);

      // Round launcher icon (ic_launcher_round.png)
      const roundLauncherPath = path.join(folderPath, 'ic_launcher_round.png');
      const circleMask = createCircleMask(item.size);

      const resizedSquare = await sharp(sourcePath)
        .resize(item.size, item.size, { fit: 'cover', kernel: 'lanczos3' })
        .toBuffer();

      await sharp(resizedSquare)
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .toFormat('png')
        .toFile(roundLauncherPath);

      // Adaptive foreground icon (ic_launcher_foreground.png)
      const innerSize = Math.round(item.adaptiveSize * 0.61);
      const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');

      const resizedForegroundContent = await sharp(sourcePath)
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      await sharp({
        create: {
          width: item.adaptiveSize,
          height: item.adaptiveSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          {
            input: resizedForegroundContent,
            top: Math.round((item.adaptiveSize - innerSize) / 2),
            left: Math.round((item.adaptiveSize - innerSize) / 2)
          }
        ])
        .toFormat('png')
        .toFile(foregroundPath);

      console.log(`  ✅ Density ${item.density}: standard (${item.size}px), round (${item.size}px), adaptive (${item.adaptiveSize}px)`);
    }

    console.log('\n✨ All Android app store & feature graphic images generated successfully!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
    process.exit(1);
  }
}

generateIcons();
