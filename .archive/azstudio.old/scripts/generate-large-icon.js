const fs = require('fs');
const path = require('path');

// Create a 256x256 BMP icon for AzStudio
function createLargeIcon() {
  const size = 256;
  const bytesPerPixel = 4; // RGBA
  const rowSize = size * bytesPerPixel;
  const pixelDataSize = rowSize * size;
  
  // BMP file header (14 bytes) + DIB header (124 bytes for BITMAPV5HEADER)
  const headerSize = 14 + 124;
  const fileSize = headerSize + pixelDataSize;
  
  const buffer = Buffer.alloc(fileSize);
  let offset = 0;
  
  // BMP File Header
  buffer.write('BM', offset); offset += 2; // Signature
  buffer.writeUInt32LE(fileSize, offset); offset += 4; // File size
  buffer.writeUInt32LE(0, offset); offset += 4; // Reserved
  buffer.writeUInt32LE(headerSize, offset); offset += 4; // Pixel data offset
  
  // DIB Header (BITMAPV5HEADER)
  buffer.writeUInt32LE(124, offset); offset += 4; // Header size
  buffer.writeInt32LE(size, offset); offset += 4; // Width
  buffer.writeInt32LE(-size, offset); offset += 4; // Height (negative for top-down)
  buffer.writeUInt16LE(1, offset); offset += 2; // Planes
  buffer.writeUInt16LE(32, offset); offset += 2; // Bits per pixel
  buffer.writeUInt32LE(0, offset); offset += 4; // Compression (BI_BITFIELDS for RGBA)
  buffer.writeUInt32LE(pixelDataSize, offset); offset += 4; // Image size
  buffer.writeInt32LE(2835, offset); offset += 4; // Horizontal resolution (72 DPI)
  buffer.writeInt32LE(2835, offset); offset += 4; // Vertical resolution (72 DPI)
  buffer.writeUInt32LE(0, offset); offset += 4; // Colors in palette
  buffer.writeUInt32LE(0, offset); offset += 4; // Important colors
  
  // BITMAPV5HEADER color space and gamma fields
  buffer.writeUInt32LE(0x57696E20, offset); offset += 4; // LCS_WINDOWS_COLOR_SPACE
  buffer.writeUInt32LE(0, offset); offset += 4; // Red gamma
  buffer.writeUInt32LE(0, offset); offset += 4; // Green gamma
  buffer.writeUInt32LE(0, offset); offset += 4; // Blue gamma
  buffer.writeUInt32LE(0, offset); offset += 4; // Red gamma
  buffer.writeUInt32LE(0, offset); offset += 4; // Green gamma
  buffer.writeUInt32LE(0, offset); offset += 4; // Blue gamma
  buffer.writeUInt32LE(0x00200000, offset); offset += 4; // Intent (LCS_GM_IMAGES)
  buffer.writeUInt32LE(0, offset); offset += 4; // Profile data
  buffer.writeUInt32LE(0, offset); offset += 4; // Profile size
  buffer.writeUInt32LE(0, offset); offset += 4; // Reserved
  
  // Color masks for RGBA
  buffer.writeUInt32LE(0x00ff0000, offset); offset += 4; // Red mask
  buffer.writeUInt32LE(0x0000ff00, offset); offset += 4; // Green mask
  buffer.writeUInt32LE(0x000000ff, offset); offset += 4; // Blue mask
  buffer.writeUInt32LE(0xff000000, offset); offset += 4; // Alpha mask
  
  // Generate gradient pixels
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pixelOffset = headerSize + (y * rowSize) + (x * bytesPerPixel);
      
      // Create a modern gradient from blue to purple
      const t = x / size;
      const r = Math.floor(30 + t * 100);  // 30 -> 130
      const g = Math.floor(60 + t * 80);   // 60 -> 140
      const b = Math.floor(150 + t * 50);  // 150 -> 200
      const a = 255;
      
      // Add a subtle pattern
      const pattern = Math.sin(x * 0.05) * Math.sin(y * 0.05) * 20;
      
      buffer.writeUInt8(Math.max(0, Math.min(255, b + pattern)), pixelOffset);     // Blue
      buffer.writeUInt8(Math.max(0, Math.min(255, g + pattern)), pixelOffset + 1); // Green
      buffer.writeUInt8(Math.max(0, Math.min(255, r + pattern)), pixelOffset + 2); // Red
      buffer.writeUInt8(a, pixelOffset + 3); // Alpha
    }
  }
  
  return buffer;
}

console.log('🎨 Generating 256x256 AzStudio icon...');
const iconBuffer = createLargeIcon();
fs.writeFileSync(path.join(__dirname, '../build/icon.ico'), iconBuffer);
console.log('✅ Large icon generated successfully.');
