import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJSON, postJSON, STATUS, fmtDate } from '../api.js'
import LeafletMap from '../components/LeafletMap.jsx'

export default function SiteDetail() {
  const { id } = useParams()
  const [site, setSite] = useState(null)
  const [trees, setTrees] = useState([])
  const [showBulk, setShowBulk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const load = () => {
    getJSON('/api/sites/' + id).then(setSite).catch(e => setError(e.message))
    getJSON('/api/trees?site=' + id).then(setTrees).catch(() => {})
  }
  useEffect(() => { load() }, [id])

  async function bulkAdd(e) {
    e.preventDefault()
    setBusy(true); setError(null); setResult(null)
    try {
      const fd = new FormData(e.target)
      const r = await postJSON(`/api/sites/${id}/bulk-trees`, {
        count: fd.get('count'),
        species: fd.get('species'),
        local_name: fd.get('local_name'),
        planted_date: fd.get('planted_date'),
        planted_by: fd.get('planted_by'),
        block: fd.get('block'),
        per_row: fd.get('per_row')
      })
      setResult(`✅ ${r.created} trees registered: ${r.firstId} → ${r.lastId}`)
      e.target.reset()
      setShowBulk(false)
      load()
    } catch (err) { setError(err.message) }
    setBusy(false)
  }

  if (error && !site) return <div className="page"><div className="error card">{error}</div></div>
  if (!site) return <div className="loading">Loading…</div>

  const registered = site.tree_count || 0
  const target = site.target_count || registered
  const pct = target ? Math.min(100, Math.round((registered / target) * 100)) : 0
  const located = trees.filter(t => t.lat != null && t.lng != null)
  const markers = located.map(t => ({
    id: t.id, lat: t.lat, lng: t.lng, status: t.status, label: `${t.species} (${t.id})`
  }))

  return (
    <div className="page">
      <div className="hero card">
        <div>
          <h1>🏞️ {site.name}</h1>
          <p>{site.location || 'Plantation site'} · {fmtDate(site.planted_date)}</p>
        </div>
        <div className="hero-rate">
          <strong>{registered}{site.target_count ? `/${site.target_count}` : ''}</strong>
          <span>trees · {pct}%</span>
        </div>
      </div>

      {result && <div className="card" style={{ borderColor: '#16a34a' }}>{result}</div>}

      <div className="stat-grid">
        {Object.entries(STATUS).map(([key, s]) => (
          <Link key={key} to={`/trees?site=${site.id}&status=${key}`} className="stat-card card" style={{ borderColor: s.color }}>
            <span className="stat-emoji">{s.emoji}</span>
            <strong style={{ color: s.color }}>{site[key] || 0}</strong>
            <span className="muted small">{s.label} · {s.hindi}</span>
          </Link>
        ))}
      </div>

      <div className="row gap">
        <button className="btn btn-primary grow" onClick={() => setShowBulk(s => !s)}>
          {showBulk ? 'Cancel' : '📦 Bulk Register Trees'}
        </button>
        <Link to={`/site/${site.id}/print`} className="btn btn-outline grow">🏷️ Print QR Tags</Link>
      </div>

      {showBulk && (
        <form onSubmit={bulkAdd} className="form card">
          <p className="muted small">
            Ek saath saare ped register karo — IDs अपने आप banenge (jaise FDN-0014 → FDN-2013).
            Photo/GPS baad mein field mein har ped par update hogi.
          </p>
          <div className="row gap">
            <label className="grow">Kitne ped? * · Count
              <input name="count" type="number" min="1" max="10000" required placeholder="2000" />
            </label>
            <label className="grow">Species * · प्रजाति
              <input name="species" required placeholder="Neem / Mixed" />
            </label>
          </div>
          <div className="row gap">
            <label className="grow">Local name · स्थानीय नाम
              <input name="local_name" placeholder="नीम" />
            </label>
            <label className="grow">Planted date
              <input name="planted_date" type="date" />
            </label>
          </div>
          <label>Planted by · किसने लगाए
            <input name="planted_by" placeholder="Team / volunteer name" />
          </label>
          <div className="row gap">
            <label className="grow">Block naam · ब्लॉक (optional)
              <input name="block" placeholder="A" maxLength="8" />
            </label>
            <label className="grow">Ek row mein kitne ped? (optional)
              <input name="per_row" type="number" min="1" placeholder="25" />
            </label>
          </div>
          <p className="muted small">
            Block + per-row doge toh har ped ko अपने आप Row/Position milegi (jaise Block A · Row 3 · #12) —
            bina GPS ke bhi ped dhundhna easy. Alag block ke liye alag batch chalao.
          </p>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Registering…' : '✅ Register All Trees'}
          </button>
        </form>
      )}

      <div className="row gap">
        <Link to={`/trees?site=${site.id}`} className="btn btn-outline grow">🌳 View All Trees ({registered})</Link>
      </div>

      {markers.length > 0 && (
        <div className="card pad0">
          <LeafletMap markers={markers} height={300} />
        </div>
      )}
      <div className="muted small">
        📍 {located.length} of {registered} trees have GPS locations (field workers add them via progress updates)
      </div>

      {site.notes && <div className="card"><span className="muted small">Notes</span><p>{site.notes}</p></div>}
    </div>
  )
}
