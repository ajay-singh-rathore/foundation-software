import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { getJSON, fmtDate, fmtDateTime, statusInfo } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LeafletMap from '../components/LeafletMap.jsx'

export default function TreeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tree, setTree] = useState(null)
  const [error, setError] = useState(null)
  const [qr, setQr] = useState(null)

  useEffect(() => {
    getJSON('/api/trees/' + id).then(setTree).catch(e => setError(e.message))
  }, [id])

  useEffect(() => {
    if (!tree) return
    const url = window.location.origin + '/tree/' + tree.id
    QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: '#14532d' } }).then(setQr)
  }, [tree])

  if (error) return <div className="page"><div className="error card">{error}</div></div>
  if (!tree) return <div className="loading">Loading…</div>

  const s = statusInfo(tree.status)

  return (
    <div className="page">
      <div className="detail-photo">
        {tree.photo
          ? <img src={tree.photo} alt={tree.species} />
          : <div className="photo-placeholder big">🌱</div>}
        <div className="detail-photo-overlay">
          <h1>{tree.species} {tree.local_name ? `· ${tree.local_name}` : ''}</h1>
          <code className="tree-id">{tree.id}</code>
        </div>
      </div>

      <div className="row gap">
        <Link to={`/tree/${tree.id}/update`} className="btn btn-primary grow">📝 Add Progress Update</Link>
      </div>

      <div className="card info-grid">
        <div><span className="muted small">Status</span><StatusBadge status={tree.status} large /></div>
        <div><span className="muted small">Height · ऊँचाई</span><strong>{tree.height_cm ? `${tree.height_cm} cm` : '—'}</strong></div>
        <div><span className="muted small">Planted on · लगाया गया</span><strong>{fmtDate(tree.planted_date)}</strong></div>
        <div><span className="muted small">Planted by · किसने लगाया</span><strong>{tree.planted_by || '—'}</strong></div>
        <div><span className="muted small">Latitude</span><strong>{tree.lat ?? '—'}</strong></div>
        <div><span className="muted small">Longitude</span><strong>{tree.lng ?? '—'}</strong></div>
      </div>

      {tree.notes && <div className="card"><span className="muted small">Notes</span><p>{tree.notes}</p></div>}

      {tree.lat != null && tree.lng != null && (
        <div className="card pad0">
          <LeafletMap markers={[{ id: tree.id, lat: tree.lat, lng: tree.lng, status: tree.status, label: tree.species }]} height={260} />
          <a
            className="btn btn-outline mlink"
            href={`https://www.google.com/maps?q=${tree.lat},${tree.lng}`}
            target="_blank" rel="noreferrer"
          >🧭 Navigate with Google Maps</a>
        </div>
      )}

      {qr && (
        <div className="card qr-card">
          <img src={qr} alt={`QR code for ${tree.id}`} />
          <div>
            <strong>Tree QR Code</strong>
            <p className="muted small">Print &amp; tie this tag to the tree. Scanning opens this page instantly. · इसे प्रिंट करके पेड़ पर बांधें — स्कैन करते ही पेड़ की पूरी जानकारी खुलेगी।</p>
            <a className="btn btn-outline" href={qr} download={`${tree.id}-qr.png`}>⬇️ Download QR</a>
          </div>
        </div>
      )}

      <section>
        <h2>Growth timeline · विकास यात्रा ({tree.updates.length})</h2>
        {tree.updates.length === 0 && (
          <div className="card empty">No updates yet — add the first one! 🌱</div>
        )}
        <div className="timeline">
          {tree.updates.map(u => (
            <div className="timeline-item" key={u.id}>
              <div className="timeline-dot" style={{ background: statusInfo(u.status || tree.status).color }} />
              <div className="card grow">
                <div className="row spread">
                  <strong>{fmtDateTime(u.created_at)}</strong>
                  {u.status && <StatusBadge status={u.status} />}
                </div>
                {u.photo && <img className="timeline-photo" src={u.photo} alt="" loading="lazy" />}
                {u.note && <p>{u.note}</p>}
                <div className="muted small">
                  {u.height_cm ? `📏 ${u.height_cm} cm · ` : ''}
                  {u.updated_by ? `👤 ${u.updated_by}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        className="btn btn-danger"
        onClick={async () => {
          if (!confirm(`Delete ${tree.id} (${tree.species})? This cannot be undone.`)) return
          await fetch('/api/trees/' + tree.id, { method: 'DELETE' })
          navigate('/trees')
        }}
      >🗑️ Delete tree</button>
    </div>
  )
}
