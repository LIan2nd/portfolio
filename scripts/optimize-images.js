const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, options = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, ext);
  const tempPath = path.join(dir, `${base}_opt${ext}`);

  try {
    let pipeline = sharp(inputPath);

    if (options.width) {
      pipeline = pipeline.resize(options.width, null, { withoutEnlargement: true });
    }

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: options.quality || 70, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: options.quality || 70, compressionLevel: 9, palette: true });
    }

    await pipeline.toFile(tempPath);

    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(tempPath).size;

    // Replace original with optimized
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);

    const reduction = ((1 - newSize / origSize) * 100).toFixed(1);
    console.log(`✅ ${path.relative('public', inputPath)}: ${(origSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${reduction}% smaller)`);
  } catch (err) {
    console.error(`❌ Failed: ${inputPath} — ${err.message}`);
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');

  // Hero background (CRITICAL — 2.1MB, causes 23.6s LCP)
  await optimizeImage('public/img/hero-bg.jpg', { width: 1920, quality: 65 });

  // Profile images
  await optimizeImage('public/img/profile/profile-1.png', { width: 800, quality: 70 });
  await optimizeImage('public/img/profile/profile-2.jpg', { width: 800, quality: 70 });
  await optimizeImage('public/img/profile/profile-3.jpg', { width: 800, quality: 70 });
  await optimizeImage('public/img/profile/profile-4.jpg', { width: 800, quality: 70 });

  // Project screenshots
  await optimizeImage('public/img/projects/roadsense.png', { width: 960, quality: 70 });
  await optimizeImage('public/img/projects/sistem-pendaftaran-event.png', { width: 960, quality: 70 });
  await optimizeImage('public/img/projects/hrd-api.png', { width: 960, quality: 70 });
  await optimizeImage('public/img/projects/esao.png', { width: 960, quality: 70 });
  await optimizeImage("public/img/projects/tetrisn't.png", { width: 960, quality: 70 });

  // Logos (rendered at 36x36px — 592KB is absurd for a tiny logo)
  await optimizeImage('public/img/logo-ma.png', { width: 128, quality: 80 });
  await optimizeImage('public/img/sttnf.png', { width: 128, quality: 80 });

  console.log('\n🎉 Image optimization complete!');
}

main().catch(console.error);
