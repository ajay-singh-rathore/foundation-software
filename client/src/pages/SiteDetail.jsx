import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJSON, postJSON, STATUS, fmtDate } from '../api.js'
import LeafletMap from '../components/LeafletMap.jsx'
import { useLang } from '../i18n.jsx'

export default function SiteDetail() {
  const { t } = useLang()
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
      setResult(`✅ ${r.created} ${t('trees_word')}: ${r.firstId} → ${r.lastId}`)
      e.target.reset()
      setShowBulk(false)
      load()
    } catch (err) { setError(err.message) }
    setBusy(false)
  }

  if (error && !site) return <div className="page"><div className="error card">{error}</div></div>
  if (!site) return <div className="loading">{t('loading')}</div>

  const registered = site.tree_count || 0
  const target = site.target_count || registered
  const pct = target ? Math.min(100, Math.round((registered / target) * 100)) : 0
  const located = trees.filter(tr => tr.lat != null && tr.lng != null)
  const markers = located.map(tr => ({
    id: tr.id, lat: tr.lat, lng: tr.lng, status: tr.status, label: `${tr.species} (${tr.id})`
  }))

  return (
    <div className="page">
      <div className="hero card">
        <div>
          <h1>🏞️ {site.name}</h1>
          <p>{site.location || t('sites_title')} · {fmtDate(site.planted_date)}</p>
        </div>
        <div className="hero-rate">
          <strong>{registered}{site.target_count ? `/${site.target_count}` : ''}</strong>
          <span>{t('trees_word')} · {pct}%</span>
        </div>
      </div>

      {result && <div className="card" style={{ borderColor: '#16a34a' }}>{result}</div>}

      <div className="stat-grid">
        {Object.entries(STATUS).map(([key, s]) => (
          <Link key={key} to={`/trees?site=${site.id}&status=${key}`} className="stat-card card" style={{ borderColor: s.color }}>
            <span className="stat-emoji">{s.emoji}</span>
            <strong style={{ color: s.color }}>{site[key] || 0}</strong>
            <span className="muted small">{t('status_' + key)}</span>
          </Link>
        ))}
      </div>

      <div className="row gap">
        <button className="btn btn-primary grow" onClick={() => setShowBulk(s => !s)}>
          {showBulk ? t('cancel') : '📦 ' + t('bulk_register')}
        </button>
        <Link to={`/site/${site.id}/print`} className="btn btn-outline grow">🏷️ {t('print_qr_tags')}</Link>
      </div>

      {showBulk && (
        <form onSubmit={bulkAdd} className="form card">
          <p className="muted small">{t('bulk_hint')}</p>
          <div className="row gap">
            <label className="grow">{t('count_label')} *
              <input name="count" type="number" min="1" max="10000" required placeholder="2000" />
            </label>
            <label className="grow">{t('species')} *
              <input name="species" required placeholder="Neem / Mixed" />
            </label>
          </div>
          <div className="row gap">
            <label className="grow">{t('local_name')}
              <input name="local_name" placeholder="नीम" />
            </label>
            <label className="grow">{t('planted_date')}
              <input name="planted_date" type="date" />
            </label>
          </div>
          <label>{t('planted_by')}
            <input name="planted_by" placeholder={t('field_worker_name')} />
          </label>
          <div className="row gap">
            <label className="grow">{t('block_name')}
              <input name="block" placeholder="A" maxLength="8" />
            </label>
            <label className="grow">{t('per_row')}
              <input name="per_row" type="number" min="1" placeholder="25" />
            </label>
          </div>
          <p className="muted small">{t('block_hint')}</p>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? t('registering') : '✅ ' + t('register_all')}
          </button>
        </form>
      )}

      <div className="row gap">
        <Link to={`/trees?site=${site.id}`} className="btn btn-outline grow">🌳 {t('view_all_trees')} ({registered})</Link>
      </div>

      {markers.length > 0 && (
        <div className="card pad0">
          <LeafletMap markers={markers} height={300} />
        </div>
      )}
      <div className="muted small">
        📍 {located.length} / {registered} — {t('have_gps')}
      </div>

      {site.notes && <div className="card"><span className="muted small">{t('notes')}</span><p>{site.notes}</p></div>}
    </div>
  )
}
