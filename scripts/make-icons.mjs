// Generates PNG app icons (rounded green square + tree) without any image libraries.
// Usage: node scripts/make-icons.mjs
import zlib from 'node:zlib'
import fs from 'node:fs'

function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let c = ~0
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function makeIcon(size, file) {
  const px = Buffer.alloc(size * size * 4)
  const S = size / 192
  const inCircle = (x, y, cx, cy, r) => {
    const dx = x - cx, dy = y - cy
    return dx * dx + dy * dy <= r * r
  }
  const inRoundedSquare = (x, y) => {
    const r = 40 * S, w = size - 1
    const cx = Math.min(Math.max(x, r), w - r)
    const cy = Math.min(Math.max(y, r), w - r)
    if ((x < r || x > w - r) && (y < r || y > w - r)) return inCircle(x, y, cx, cy, r)
    return true
  }
  const set = (i, r, g, b, a = 255) => { px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (!inRoundedSquare(x, y)) { set(i, 0, 0, 0, 0); continue }
      set(i, 0x16, 0x65, 0x34)
      if (x >= 88 * S && x < 104 * S && y >= 96 * S && y < 152 * S) set(i, 0x92, 0x40, 0x0e)
      if (inCircle(x, y, 64 * S, 90 * S, 28 * S)) set(i, 0x22, 0xc5, 0x5e)
      if (inCircle(x, y, 128 * S, 90 * S, 28 * S)) set(i, 0x22, 0xc5, 0x5e)
      if (inCircle(x, y, 96 * S, 70 * S, 40 * S)) set(i, 0x4a, 0xde, 0x80)
    }
  }

  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
  fs.writeFileSync(file, png)
  console.log('wrote', file, png.length, 'bytes')
}

makeIcon(192, 'client/public/icon-192.png')
makeIcon(512, 'client/public/icon-512.png')
