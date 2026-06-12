# 🌳 Foundation Software — Tree Plantation Tracker

**Module 1: Tree Tracker** — track every planted tree with its photo, GPS location, health status and full growth timeline. Built for field workers on mobile.

## Features

- 📋 **Tree registry** — every tree gets a unique ID (`FDN-0001`), species, planting date, planter name
- 📷 **Photo capture** — take photos directly from the phone camera
- 📍 **GPS location** — one-tap latitude/longitude capture; navigate back to any tree via Google Maps
- 📈 **Growth timeline** — progress updates with photo, height, health status and notes
- 🏷️ **QR code per tree** — print & tie the QR tag to the tree; scanning it opens the tree's full identity instantly
- 🗺️ **Plantation map** — all trees on an OpenStreetMap, color-coded by health
- 📊 **Dashboard** — totals, survival rate, status breakdown, recent field activity
- 📱 **Mobile-first PWA** — installable on any phone, bilingual labels (English + हिंदी)

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Leaflet maps, QR generation |
| Backend | Node.js + Express |
| Database | SQLite (Node's built-in `node:sqlite` — zero external services) |
| Photos | Stored on disk in `data/uploads/` |

## Run locally

```bash
npm install
npm run build      # build the frontend
npm run seed       # optional: add 12 demo trees
npm start          # → http://localhost:4000
```

For development with hot reload, run in two terminals:

```bash
npm run dev:server   # API on :4000
npm run dev:client   # Vite dev server on :5173 (proxies /api)
```

## Deploy

**Render (recommended, free tier):** push to GitHub → create a *Blueprint* on render.com pointing at this repo — `render.yaml` configures everything including a persistent disk for photos/database.

**Docker:**

```bash
docker build -t foundation-software .
docker run -p 4000:4000 -v foundation-data:/data foundation-software
```

> ⚠️ Camera and GPS in the browser require **HTTPS** (any deployed URL works; `localhost` is also fine for testing).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/stats` | Dashboard totals + recent activity |
| GET | `/api/trees?search=&status=` | List/filter trees |
| POST | `/api/trees` | Register a tree (multipart, `photo` field) |
| GET | `/api/trees/:id` | Tree identity + full update history |
| POST | `/api/trees/:id/updates` | Add progress update (multipart) |
| DELETE | `/api/trees/:id` | Remove a tree |

## Roadmap (future modules)

- 🔐 User accounts & roles for field workers
- 💧 Watering schedules & reminders
- 📦 Other Foundation programs (this is module 1 of many)
