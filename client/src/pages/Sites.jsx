import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, postJSON } from '../api.js'
import GpsField from '../components/GpsField.jsx'

export default function Sites() {
  const [sites, setSites] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [gps, setGps] = useState({ lat: '', lng: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const load = () => getJSON('/api/sites').then(setSites).catch(e => setError(e.message))
  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const fd = new FormData(e.target)
      await postJSON('/api/sites', {
        name: fd.get('name'),
        location: fd.get('location'),
        target_count: fd.get('target_count'),
        planted_date: fd.get('planted_date'),
        notes: fd.get('notes'),
        lat: gps.lat, lng: gps.lng
      })
      e.target.reset()
      setGps({ lat: '', lng: '' })
      setShowForm(false)
      load()
    } catch (err) { setError(err.message) }
    setBusy(false)
  }

  return (
    <div className="page">
      <div className="row spread">
        <h2>🏞️ Plantation Sites · जगहें {sites ? `(${sites.length})` : ''}</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '➕ New Site'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="form card">
          <label>Site name * · जगह का नाम
            <input name="name" required placeholder="e.g. Rampur Land, School Campus" />
          </label>
          <label>Location / address · पता
            <input name="location" placeholder="Village, tehsil, district…" />
          </label>
          <div className="row gap">
            <label className="grow">Trees planted (target) · कितने पेड़
              <input name="target_count" type="number" min="1" placeholder="2000" />
            </label>
            <label className="grow">Plantation date · तारीख
              <input name="planted_date" type="date" />
            </label>
          </div>
          <label>Site location (GPS)</label>
          <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />
          <label>Notes · टिप्पणी
            <textarea name="notes" rows="2" placeholder="Soil, water source, caretaker…" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : '✅ Create Site'}
          </button>
        </form>
      )}

      {!sites && <div className="loading">Loading…</div>}
      {sites && sites.length === 0 && !showForm && (
        <div className="card empty">
          Koi site nahi hai abhi. "New Site" dabao aur apni pehli plantation land banao! 🏞️
        </div>
      )}

      {sites?.map(s => {
        const registered = s.tree_count || 0
        const target = s.target_count || registered
        const pct = target ? Math.min(100, Math.round((registered / target) * 100)) : 0
        return (
          <Link to={`/site/${s.id}`} key={s.id} className="card site-card">
            <div className="row spread">
              <strong>{s.name}</strong>
              <code>{registered}{s.target_count ? ` / ${s.target_count}` : ''} 🌳</code>
            </div>
            {s.location && <div className="muted small">📍 {s.location}</div>}
            <div className="progress"><div style={{ width: pct + '%' }} /></div>
            <div className="row spread small muted">
              <span>{pct}% registered</span>
              <span>
                🌿 {s.healthy || 0} · ⚠️ {s.needs_attention || 0} · 🍂 {s.sick || 0} · 🪵 {s.dead || 0}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
