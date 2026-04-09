import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../src/assets');

// Images used on the Businesses page that need converting
// maxWidth = largest displayed width at 2x density
const images = [
  { file: 'perriswood-archery.png', maxWidth: 800 },
  { file: 'parc-le-breos.png', maxWidth: 800 },
  { file: 'pennard-castle.png', maxWidth: 800 },
  { file: 'oxwich-hotel.png', maxWidth: 800 },
  { file: 'oxwich-bay.png', maxWidth: 1000 },  // 2-col grid, wider
  { file: 'little-valley-bakery.jpg', maxWidth: 800 },
  { file: 'beach-house.jpg', maxWidth: 800 },
  { file: 'gower-coast-adventures.png', maxWidth: 1000 },
  { file: 'gower-heritage-centre.png', maxWidth: 1000 },
  { file: 'three-cliffs-bay.png', maxWidth: 1000 },
  { file: 'holiday-park.png', maxWidth: 800 },
  { file: 'tor-bay-beach.png', maxWidth: 1000 },
  { file: 'oxwich-castle.png', maxWidth: 1000 },
  { file: 'gower-inn.jpg', maxWidth: 800 },
  { file: 'ivy-cottage-caravans.jpg', maxWidth: 800 },
  { file: 'sheperds-shop-edit-2.jpg', maxWidth: 800 },
];

for (const { file, maxWidth } of images) {
  const input = path.join(assetsDir, file);
  const output = path.join(assetsDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));

  try {
    const meta = await sharp(input).metadata();
    const resize = meta.width > maxWidth ? { width: maxWidth } : undefined;

    const info = await sharp(input)
      .resize(resize)
      .webp({ quality: 75 })
      .toFile(output);
    console.log(`✓ ${file} → ${path.basename(output)} (${(info.size / 1024).toFixed(1)} KB, ${info.width}x${info.height})`);
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}
