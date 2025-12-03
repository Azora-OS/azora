const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;

// Create a proper PNG first, then convert to ICO
function createPNG(size) {
  const png = new PNG({
    width: size,
    height: size,
    filterType: -1
  });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Create a modern gradient from blue to purple
      const t = x / size;
      const r = Math.floor(30 + t * 100);  // 30 -> 130
      const g = Math.floor(60 + t * 80);   // 60 -> 140
      const b = Math.floor(150 + t * 50);  // 150 -> 200
      
      // Add a subtle pattern
      const pattern = Math.sin(x * 0.05) * Math.sin(y * 0.05) * 20;
      
      png.data[idx] = Math.max(0, Math.min(255, b + pattern));     // Blue
      png.data[idx + 1] = Math.max(0, Math.min(255, g + pattern)); // Green
      png.data[idx + 2] = Math.max(0, Math.min(255, r + pattern)); // Red
      png.data[idx + 3] = 255; // Alpha
    }
  }

  return PNG.sync.write(png);
}

console.log('🎨 Generating proper AzStudio icon...');

// Create multiple sizes for ICO
const sizes = [256, 128, 64, 32, 16];
const pngBuffers = sizes.map(size => createPNG(size));

// Create a simple ICO structure (multiple images)
const createICO = (pngBuffers) => {
  const images = [];
  let offset = 6 + (pngBuffers.length * 16); // Header + directory entries
  
  for (const pngBuffer of pngBuffers) {
    const size = Math.sqrt(pngBuffer.length / 4); // Approximate size from PNG data
    images.push({
      width: size,
      height: size,
      offset: offset,
      size: pngBuffer.length,
      data: pngBuffer
    });
    offset += pngBuffer.length;
  }
  
  // ICO Header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(images.length, 4); // Number of images
  
  // Directory entries
  const directory = Buffer.alloc(images.length * 16);
  let dirOffset = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    directory.writeUInt8(img.width === 256 ? 0 : img.width, dirOffset);
    directory.writeUInt8(img.height === 256 ? 0 : img.height, dirOffset + 1);
    directory.writeUInt8(0, dirOffset + 2); // Color palette
    directory.writeUInt8(0, dirOffset + 3); // Reserved
    directory.writeUInt16LE(1, dirOffset + 4); // Color planes
    directory.writeUInt16LE(32, dirOffset + 6); // Bits per pixel
    directory.writeUInt32LE(img.size, dirOffset + 8); // Image size
    directory.writeUInt32LE(img.offset, dirOffset + 12); // Offset to image
    dirOffset += 16;
  }
  
  // Combine all parts
  return Buffer.concat([header, directory, ...images.map(img => img.data)]);
};

// Use the largest PNG as a simple icon (electron-builder can handle PNG)
const largestPNG = pngBuffers[0];
fs.writeFileSync(path.join(__dirname, '../build/icon.png'), largestPNG);

// Also create a simple ICO (basic structure)
const icoBuffer = createICO([pngBuffers[0]]); // Just use 256x256
fs.writeFileSync(path.join(__dirname, '../build/icon.ico'), icoBuffer);

console.log('✅ Icon generated successfully as PNG and ICO formats.');
