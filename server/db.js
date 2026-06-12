import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT_DIR = path.join(__dirname, '..')
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, 'data')
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

export const db = new DatabaseSync(path.join(DATA_DIR, 'foundation.db'))

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS trees (
    id          TEXT PRIMARY KEY,
    species     TEXT NOT NULL,
    local_name  TEXT,
    planted_date TEXT,
    planted_by  TEXT,
    lat         REAL,
    lng         REAL,
    status      TEXT NOT NULL DEFAULT 'healthy',
    height_cm   REAL,
    notes       TEXT,
    photo       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS updates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_id     TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    note        TEXT,
    height_cm   REAL,
    status      TEXT,
    lat         REAL,
    lng         REAL,
    photo       TEXT,
    updated_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_updates_tree ON updates(tree_id, created_at DESC);
`)

export function nextTreeId() {
  const row = db
    .prepare(`SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS n FROM trees WHERE id LIKE 'FDN-%'`)
    .get()
  const n = (row?.n || 0) + 1
  return 'FDN-' + String(n).padStart(4, '0')
}
