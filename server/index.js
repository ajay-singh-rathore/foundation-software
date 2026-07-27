import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { db, nextTreeId, maxTreeNumber, treeIdFromNumber, UPLOADS_DIR, ROOT_DIR } from './db.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

// ---------- photo upload ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg'
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  }
})

const photoUrl = (file) => (file ? '/uploads/' + file.filename : null)
const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v))
const VALID_STATUS = ['healthy', 'needs_attention', 'sick', 'dead']

// ---------- API ----------

app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM trees').get().c
  const byStatus = {}
  for (const row of db.prepare('SELECT status, COUNT(*) AS c FROM trees GROUP BY status').all()) {
    byStatus[row.status] = row.c
  }
  const totalUpdates = db.prepare('SELECT COUNT(*) AS c FROM updates').get().c
  const recent = db
    .prepare(`
      SELECT u.*, t.species, t.local_name
      FROM updates u JOIN trees t ON t.id = u.tree_id
      ORDER BY u.created_at DESC, u.id DESC LIMIT 10
    `)
    .all()
  res.json({ total, byStatus, totalUpdates, recent })
})

app.get('/api/trees', (req, res) => {
  const { search = '', status = '', site = '' } = req.query
  let sql = 'SELECT t.*, s.name AS site_name FROM trees t LEFT JOIN sites s ON s.id = t.site_id WHERE 1=1'
  const params = []
  if (search) {
    sql += ' AND (t.id LIKE ? OR t.species LIKE ? OR t.local_name LIKE ? OR t.planted_by LIKE ? OR t.block = ?)'
    const like = `%${search}%`
    params.push(like, like, like, like, search.trim().toUpperCase())
  }
  if (status && VALID_STATUS.includes(status)) {
    sql += ' AND t.status = ?'
    params.push(status)
  }
  if (site) {
    sql += ' AND t.site_id = ?'
    params.push(Number(site))
  }
  sql += ' ORDER BY t.id'
  res.json(db.prepare(sql).all(...params))
})

app.get('/api/trees/:id', (req, res) => {
  const tree = db
    .prepare('SELECT t.*, s.name AS site_name FROM trees t LEFT JOIN sites s ON s.id = t.site_id WHERE t.id = ?')
    .get(req.params.id)
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const updates = db
    .prepare('SELECT * FROM updates WHERE tree_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.params.id)
  res.json({ ...tree, updates })
})

// ---------- near me ----------

const distanceMeters = (aLat, aLng, bLat, bLng) => {
  const R = 6371000
  const toR = (d) => (d * Math.PI) / 180
  const dLat = toR(bLat - aLat)
  const dLng = toR(bLng - aLng)
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(aLat)) * Math.cos(toR(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

app.get('/api/near', (req, res) => {
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }
  const radius = Math.min(Number(req.query.radius) || 150, 2000)
  const limit = Math.min(Number(req.query.limit) || 25, 100)
  const located = db.prepare(`
    SELECT t.*, s.name AS site_name FROM trees t
    LEFT JOIN sites s ON s.id = t.site_id
    WHERE t.lat IS NOT NULL AND t.lng IS NOT NULL
  `).all()
  const near = located
    .map(t => ({ ...t, distance_m: Math.round(distanceMeters(lat, lng, t.lat, t.lng)) }))
    .filter(t => t.distance_m <= radius)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit)
  res.json(near)
})

// ---------- sites ----------

const SITE_STATS_SQL = `
  SELECT s.*,
    COUNT(t.id) AS tree_count,
    SUM(CASE WHEN t.status = 'healthy' THEN 1 ELSE 0 END) AS healthy,
    SUM(CASE WHEN t.status = 'needs_attention' THEN 1 ELSE 0 END) AS needs_attention,
    SUM(CASE WHEN t.status = 'sick' THEN 1 ELSE 0 END) AS sick,
    SUM(CASE WHEN t.status = 'dead' THEN 1 ELSE 0 END) AS dead
  FROM sites s LEFT JOIN trees t ON t.site_id = s.id
`

app.get('/api/sites', (req, res) => {
  res.json(db.prepare(SITE_STATS_SQL + ' GROUP BY s.id ORDER BY s.id DESC').all())
})

app.get('/api/sites/:id', (req, res) => {
  const site = db.prepare(SITE_STATS_SQL + ' WHERE s.id = ? GROUP BY s.id').get(Number(req.params.id))
  if (!site || !site.id) return res.status(404).json({ error: 'Site not found' })
  res.json(site)
})

app.post('/api/sites', (req, res) => {
  const b = req.body || {}
  if (!b.name) return res.status(400).json({ error: 'Site name is required' })
  const result = db.prepare(`
    INSERT INTO sites (name, location, lat, lng, target_count, planted_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(b.name, b.location || null, num(b.lat), num(b.lng), num(b.target_count), b.planted_date || null, b.notes || null)
  res.status(201).json(db.prepare('SELECT * FROM sites WHERE id = ?').get(result.lastInsertRowid))
})

// Bulk-register N trees on a site in one shot (details filled per-tree later in the field)
app.post('/api/sites/:id/bulk-trees', (req, res) => {
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(Number(req.params.id))
  if (!site) return res.status(404).json({ error: 'Site not found' })
  const b = req.body || {}
  const count = Math.floor(Number(b.count))
  if (!count || count < 1) return res.status(400).json({ error: 'count must be at least 1' })
  if (count > 10000) return res.status(400).json({ error: 'count too large (max 10000 per batch)' })
  if (!b.species) return res.status(400).json({ error: 'Species is required' })

  const insert = db.prepare(`
    INSERT INTO trees (id, species, local_name, planted_date, planted_by, site_id, lat, lng, block, row_no, pos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const block = (b.block || '').trim().toUpperCase() || null
  const perRow = Math.floor(Number(b.per_row)) || 0
  const start = maxTreeNumber() + 1
  db.exec('BEGIN')
  try {
    for (let i = 0; i < count; i++) {
      const rowNo = block && perRow ? Math.floor(i / perRow) + 1 : null
      const pos = block && perRow ? (i % perRow) + 1 : null
      insert.run(
        treeIdFromNumber(start + i), b.species, b.local_name || null,
        b.planted_date || null, b.planted_by || null, site.id,
        num(b.lat), num(b.lng), block, rowNo, pos
      )
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  res.status(201).json({
    created: count,
    firstId: treeIdFromNumber(start),
    lastId: treeIdFromNumber(start + count - 1)
  })
})

app.post('/api/trees', upload.single('photo'), (req, res) => {
  const b = req.body
  if (!b.species) return res.status(400).json({ error: 'Species is required' })
  const status = VALID_STATUS.includes(b.status) ? b.status : 'healthy'
  const id = nextTreeId()
  db.prepare(`
    INSERT INTO trees (id, species, local_name, planted_date, planted_by, site_id, lat, lng, status, height_cm, notes, photo, block, row_no, pos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.species, b.local_name || null, b.planted_date || null, b.planted_by || null,
    num(b.site_id), num(b.lat), num(b.lng), status, num(b.height_cm), b.notes || null, photoUrl(req.file),
    (b.block || '').trim().toUpperCase() || null, num(b.row_no), num(b.pos)
  )
  res.status(201).json(db.prepare('SELECT * FROM trees WHERE id = ?').get(id))
})

app.post('/api/trees/:id/updates', upload.single('photo'), (req, res) => {
  const tree = db.prepare('SELECT * FROM trees WHERE id = ?').get(req.params.id)
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const b = req.body
  const status = VALID_STATUS.includes(b.status) ? b.status : null
  const photo = photoUrl(req.file)

  db.prepare(`
    INSERT INTO updates (tree_id, note, height_cm, status, lat, lng, photo, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(tree.id, b.note || null, num(b.height_cm), status, num(b.lat), num(b.lng), photo, b.updated_by || null)

  db.prepare(`
    UPDATE trees SET
      status = COALESCE(?, status),
      height_cm = COALESCE(?, height_cm),
      photo = COALESCE(?, photo),
      lat = COALESCE(?, lat),
      lng = COALESCE(?, lng),
      block = COALESCE(?, block),
      row_no = COALESCE(?, row_no),
      pos = COALESCE(?, pos),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    status, num(b.height_cm), photo, num(b.lat), num(b.lng),
    (b.block || '').trim().toUpperCase() || null, num(b.row_no), num(b.pos), tree.id
  )

  res.status(201).json(db.prepare('SELECT * FROM trees WHERE id = ?').get(tree.id))
})

app.delete('/api/trees/:id', (req, res) => {
  const result = db.prepare('DELETE FROM trees WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Tree not found' })
  res.json({ ok: true })
})

// ---------- static ----------
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

const DIST = path.join(ROOT_DIR, 'client', 'dist')
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  // SPA fallback: any non-API GET serves index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(DIST, 'index.html'))
    }
    next()
  })
}

app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).json({ error: err.message || 'Something went wrong' })
})

app.listen(PORT, () => {
  console.log(`🌳 Foundation Software server running at http://localhost:${PORT}`)
})
