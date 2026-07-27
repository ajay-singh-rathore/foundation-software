import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, postJSON } from '../api.js'
import GpsField from '../components/GpsField.jsx'
import { useLang } from '../i18n.jsx'

export default function Sites() {
  const { t } = useLang()
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
        <h2>🏞️ {t('sites_title')} {sites ? `(${sites.length})` : ''}</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? t('cancel') : '➕ ' + t('new_site')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="form card">
          <label>{t('site_name')} *
            <input name="name" required placeholder="Rampur Land, School Campus…" />
          </label>
          <label>{t('site_location')}
            <input name="location" placeholder="Village, tehsil, district…" />
          </label>
          <div className="row gap">
            <label className="grow">{t('target_trees')}
              <input name="target_count" type="number" min="1" placeholder="2000" />
            </label>
            <label className="grow">{t('plantation_date')}
              <input name="planted_date" type="date" />
            </label>
          </div>
          <label>{t('site_gps')}</label>
          <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />
          <label>{t('notes')}
            <textarea name="notes" rows="2" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? t('saving') : '✅ ' + t('create_site')}
          </button>
        </form>
      )}

      {!sites && <div className="loading">{t('loading')}</div>}
      {sites && sites.length === 0 && !showForm && (
        <div className="card empty">{t('no_sites')}</div>
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
              <span>{pct}% {t('registered')}</span>
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
