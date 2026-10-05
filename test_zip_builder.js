const fs = require('fs');
const path = require('path');

// CRC32 Table for standard ZIP files
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZipArchive(files) {
  // files = [{ filename: "file.txt", data: Buffer }]
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const filenameBuf = Buffer.from(file.filename, 'utf8');
    const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
    const crc = calculateCrc32(dataBuf);
    const size = dataBuf.length;

    // Local header (30 bytes + filename length)
    const localHeader = Buffer.alloc(30 + filenameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed
    localHeader.writeUInt16LE(0, 6);          // Flags
    localHeader.writeUInt16LE(0, 8);          // Compression method (0 = STORE)
    localHeader.writeUInt16LE(0, 10);         // Mod time
    localHeader.writeUInt16LE(0, 12);         // Mod date
    localHeader.writeUInt32LE(crc, 14);       // CRC32
    localHeader.writeUInt32LE(size, 18);      // Compressed size
    localHeader.writeUInt32LE(size, 22);      // Uncompressed size
    localHeader.writeUInt16LE(filenameBuf.length, 26); // Filename len
    localHeader.writeUInt16LE(0, 28);         // Extra field len
    filenameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader);
    localHeaders.push(dataBuf);

    // Central directory header (46 bytes + filename length)
    const centralHeader = Buffer.alloc(46 + filenameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4);         // Made by
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0, 8);          // Flags
    centralHeader.writeUInt16LE(0, 10);         // Compression method
    centralHeader.writeUInt16LE(0, 12);         // Mod time
    centralHeader.writeUInt16LE(0, 14);         // Mod date
    centralHeader.writeUInt32LE(crc, 16);       // CRC32
    centralHeader.writeUInt32LE(size, 20);      // Compressed size
    centralHeader.writeUInt32LE(size, 24);      // Uncompressed size
    centralHeader.writeUInt16LE(filenameBuf.length, 28); // Filename len
    centralHeader.writeUInt16LE(0, 30);         // Extra field len
    centralHeader.writeUInt16LE(0, 32);         // Comment len
    centralHeader.writeUInt16LE(0, 34);         // Disk start
    centralHeader.writeUInt16LE(0, 36);         // Internal attr
    centralHeader.writeUInt32LE(0, 38);         // External attr
    centralHeader.writeUInt32LE(offset, 42);    // Local header offset
    filenameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + dataBuf.length;
  }

  const centralDirStart = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) centralDirSize += ch.length;

  // End of Central Directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);                 // Signature
  eocd.writeUInt16LE(0, 4);                          // Disk num
  eocd.writeUInt16LE(0, 6);                          // Start disk
  eocd.writeUInt16LE(files.length, 8);               // Num entries on disk
  eocd.writeUInt16LE(files.length, 10);              // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);            // Central dir size
  eocd.writeUInt32LE(centralDirStart, 16);           // Central dir offset
  eocd.writeUInt16LE(0, 20);                         // Comment len

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

// Quick test
const testZip = createZipArchive([
  { filename: 'hello.txt', data: 'Hello TravelBells!' },
  { filename: 'info.json', data: JSON.stringify({ status: 'ok' }) }
]);

fs.writeFileSync(path.join(__dirname, 'test_bundle.zip'), testZip);
console.log("Successfully created test ZIP bundle! Size:", testZip.length, "bytes");
