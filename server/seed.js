// Seeds demo trees so the app has data to explore on first run.
// Usage: npm run seed   (safe: skips if trees already exist)
import { db, nextTreeId } from './db.js'

const existing = db.prepare('SELECT COUNT(*) AS c FROM trees').get().c
if (existing > 0) {
  console.log(`Database already has ${existing} trees — skipping seed.`)
  process.exit(0)
}

// Base location: Jaipur, Rajasthan (change to your plantation site)
const BASE = { lat: 26.9124, lng: 75.7873 }

const SPECIES = [
  ['Neem', 'नीम'], ['Peepal', 'पीपल'], ['Banyan', 'बरगद'], ['Mango', 'आम'],
  ['Gulmohar', 'गुलमोहर'], ['Amla', 'आंवला'], ['Jamun', 'जामुन'], ['Ashok', 'अशोक'],
  ['Sheesham', 'शीशम'], ['Kachnar', 'कचनार'], ['Arjun', 'अर्जुन'], ['Bael', 'बेल']
]
const STATUSES = ['healthy', 'healthy', 'healthy', 'healthy', 'needs_attention', 'sick']
const VOLUNTEERS = ['Ajay Singh', 'Priya Sharma', 'Rahul Verma', 'Team Foundation']

const insertTree = db.prepare(`
  INSERT INTO trees (id, species, local_name, planted_date, planted_by, lat, lng, status, height_cm, notes, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertUpdate = db.prepare(`
  INSERT INTO updates (tree_id, note, height_cm, status, lat, lng, updated_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 19).replace('T', ' ')

for (let i = 0; i < SPECIES.length; i++) {
  const [species, localName] = SPECIES[i]
  const id = nextTreeId()
  const lat = BASE.lat + (Math.random() - 0.5) * 0.02
  const lng = BASE.lng + (Math.random() - 0.5) * 0.02
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
  const plantedDaysAgo = 30 + Math.floor(Math.random() * 150)
  const height = 40 + Math.floor(Math.random() * 120)

  insertTree.run(
    id, species, localName,
    daysAgo(plantedDaysAgo).slice(0, 10),
    VOLUNTEERS[i % VOLUNTEERS.length],
    lat, lng, status, height,
    'Planted under Foundation plantation drive.',
    daysAgo(plantedDaysAgo), daysAgo(plantedDaysAgo)
  )

  const updateCount = 1 + Math.floor(Math.random() * 3)
  for (let u = updateCount; u >= 1; u--) {
    insertUpdate.run(
      id,
      ['Growing well, watered today.', 'Added compost and mulch.', 'Checked for pests, all clear.', 'Soil moisture low, watered extra.'][Math.floor(Math.random() * 4)],
      height - u * 10,
      u === 1 ? status : 'healthy',
      lat, lng,
      VOLUNTEERS[Math.floor(Math.random() * VOLUNTEERS.length)],
      daysAgo(u * 12)
    )
  }
}

console.log(`Seeded ${SPECIES.length} demo trees with progress updates. 🌱`)
