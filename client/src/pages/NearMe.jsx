import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, statusInfo, treeLocation } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { useLang } from '../i18n.jsx'

export default function NearMe() {
  const { t } = useLang()
  const [state, setState] = useState('idle') // idle | locating | done | error
  const [error, setError] = useState(null)
  const [trees, setTrees] = useState([])
  const [accuracy, setAccuracy] = useState(null)
  const [radius, setRadius] = useState(150)

  function locate(r = radius) {
    if (!navigator.geolocation) { setState('error'); setError(t('gps_not_supported')); return }
    setState('locating'); setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setAccuracy(Math.round(pos.coords.accuracy))
          const list = await getJSON(
            `/api/near?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=${r}`
          )
          setTrees(list)
          setState('done')
        } catch (e) { setState('error'); setError(e.message) }
      },
      (err) => { setState('error'); setError(err.message) },
      { enableHighAccuracy: true, timeout: 20000 }
    )
  }

  return (
    <div className="page">
      <h2>📍 {t('nav_near')}</h2>
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="muted small">{t('near_hint')}</p>
        <button className="btn btn-primary" onClick={() => locate()} disabled={state === 'locating'}>
          {state === 'locating' ? '📡 ' + t('locating') : state === 'done' ? '🔄 ' + t('refresh_location') : '📍 ' + t('find_near')}
        </button>
        <div className="chips" style={{ justifyContent: 'center', marginTop: 10 }}>
          {[50, 150, 500].map(r => (
            <button
              key={r}
              className={'chip' + (radius === r ? ' active' : '')}
              onClick={() => { setRadius(r); if (state === 'done') locate(r) }}
            >{r} m</button>
          ))}
        </div>
        {accuracy != null && state === 'done' && (
          <div className="muted small" style={{ marginTop: 8 }}>{t('gps_accuracy')}: ±{accuracy} m</div>
        )}
      </div>

      {state === 'error' && <div className="error card">{error}</div>}

      {state === 'done' && trees.length === 0 && (
        <div className="card empty">{t('near_empty')}</div>
      )}

      {trees.map((tr, i) => (
        <Link to={`/tree/${tr.id}`} key={tr.id} className="card near-row">
          <div className="near-rank" style={{ background: statusInfo(tr.status).color }}>
            {i === 0 ? '🎯' : i + 1}
          </div>
          <div className="grow">
            <div className="row spread">
              <strong>{tr.species} <code>{tr.id}</code></strong>
              <StatusBadge status={tr.status} />
            </div>
            <div className="muted small">
              {treeLocation(tr) ? `🧱 ${treeLocation(tr)} · ` : ''}
              {tr.site_name ? `🏞️ ${tr.site_name} · ` : ''}
              📏 <strong>{tr.distance_m} m {t('away')}</strong>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
