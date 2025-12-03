const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Helper to create a simple BMP buffer with a solid color
function createBMP(width, height, colorHex) {
  const headerSize = 54;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const fileSize = headerSize + rowSize * height;
  const buffer = Buffer.alloc(fileSize);

  // BMP Header
  buffer.write('BM');
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(54, 10); // Offset to pixel data

  // DIB Header
  buffer.writeUInt32LE(40, 14); // Header size
  buffer.writeUInt32LE(width, 18);
  buffer.writeUInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26); // Planes
  buffer.writeUInt16LE(24, 28); // BPP
  buffer.writeUInt32LE(0, 30); // Compression
  buffer.writeUInt32LE(rowSize * height, 34); // Image size

  // Pixel Data (BGR format)
  const r = parseInt(colorHex.slice(0, 2), 16);
  const g = parseInt(colorHex.slice(2, 4), 16);
  const b = parseInt(colorHex.slice(4, 6), 16);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = headerSize + (height - 1 - y) * rowSize + x * 3;
      // Draw a pattern: Border
      if (x < 10 || x > width - 10 || y < 10 || y > height - 10) {
        buffer[offset] = 0xFF; // Blue
        buffer[offset + 1] = 0xFF;
        buffer[offset + 2] = 0xFF;
      } else {
        // Gradient-ish effect
        buffer[offset] = b;
        buffer[offset + 1] = g;
        buffer[offset + 2] = r + (x % 50); 
      }
    }
  }

  return buffer;
}

// Azora Blue: #007ACC (BGR: CC 7A 00)
const installerHeader = createBMP(150, 57, '007ACC');
const installerSidebar = createBMP(164, 314, '1E1E1E'); // Dark theme

// Minimal valid ICO (16x16, 32bpp)
const icoBuffer = Buffer.alloc(6 + 16 + 1024); // Header + Entry + Data
icoBuffer.writeUInt16LE(0, 0); // Reserved
icoBuffer.writeUInt16LE(1, 2); // Type (ICO)
icoBuffer.writeUInt16LE(1, 4); // Count

// Entry
icoBuffer.writeUInt8(16, 6); // Width
icoBuffer.writeUInt8(16, 7); // Height
icoBuffer.writeUInt8(0, 8); // Palette
icoBuffer.writeUInt8(0, 9); // Reserved
icoBuffer.writeUInt16LE(1, 10); // Planes
icoBuffer.writeUInt16LE(32, 12); // BPP
icoBuffer.writeUInt32LE(1024, 14); // Size
icoBuffer.writeUInt32LE(22, 18); // Offset

// Fill data with blue pixels
for (let i = 22; i < icoBuffer.length; i++) {
  icoBuffer[i] = 0xCC;
}

function createAssets() {
  console.log('🎨 Generating Advanced AzStudio assets...');
  
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(buildDir, 'file-icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(buildDir, 'installer-header.bmp'), installerHeader);
  fs.writeFileSync(path.join(buildDir, 'installer-sidebar.bmp'), installerSidebar);

  console.log('✅ Assets generated successfully.');
}

createAssets();
