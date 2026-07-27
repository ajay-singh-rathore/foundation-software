import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, statusInfo, treeLocation } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function NearMe() {
  const [state, setState] = useState('idle') // idle | locating | done | error
  const [error, setError] = useState(null)
  const [trees, setTrees] = useState([])
  const [accuracy, setAccuracy] = useState(null)
  const [radius, setRadius] = useState(150)

  function locate(r = radius) {
    if (!navigator.geolocation) { setState('error'); setError('GPS not supported on this device'); return }
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
      <h2>📍 Near Me · मेरे पास के पेड़</h2>
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="muted small">
          Ped ke paas khade hoke button dabao — aas-paas ke registered trees distance ke hisaab se dikhenge.
        </p>
        <button className="btn btn-primary" onClick={() => locate()} disabled={state === 'locating'}>
          {state === 'locating' ? '📡 Locating…' : state === 'done' ? '🔄 Refresh location' : '📍 Find trees near me'}
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
          <div className="muted small" style={{ marginTop: 8 }}>GPS accuracy: ±{accuracy} m</div>
        )}
      </div>

      {state === 'error' && <div className="error card">{error}</div>}

      {state === 'done' && trees.length === 0 && (
        <div className="card empty">
          {radius} m ke andar koi registered tree nahi mila.
          Radius badhao, ya is ped ko pehle register/GPS-update karo. 🌱
        </div>
      )}

      {trees.map((t, i) => (
        <Link to={`/tree/${t.id}`} key={t.id} className="card near-row">
          <div className="near-rank" style={{ background: statusInfo(t.status).color }}>
            {i === 0 ? '🎯' : i + 1}
          </div>
          <div className="grow">
            <div className="row spread">
              <strong>{t.species} <code>{t.id}</code></strong>
              <StatusBadge status={t.status} />
            </div>
            <div className="muted small">
              {treeLocation(t) ? `🧱 ${treeLocation(t)} · ` : ''}
              {t.site_name ? `🏞️ ${t.site_name} · ` : ''}
              📏 <strong>{t.distance_m} m door</strong>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
