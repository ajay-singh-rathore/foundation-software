import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { getJSON, fmtDate, fmtDateTime, statusInfo, treeLocation } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LeafletMap from '../components/LeafletMap.jsx'
import Icon from '../components/Icons.jsx'
import { useLang } from '../i18n.jsx'

export default function TreeDetail() {
  const { t } = useLang()
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
    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H', // survives ~30% damage on weather-worn tags
      color: { dark: '#14532d' }
    }).then(setQr)
  }, [tree])

  if (error) return <div className="page"><div className="error card">{error}</div></div>
  if (!tree) return <div className="loading">{t('loading')}</div>

  return (
    <div className="page">
      <div className="detail-photo">
        {tree.photo
          ? <img src={tree.photo} alt={tree.species} />
          : <div className="photo-placeholder big"><Icon name="image" size={48} strokeWidth={1.4} /></div>}
        <div className="detail-photo-overlay">
          <h1>{tree.species} {tree.local_name ? `· ${tree.local_name}` : ''}</h1>
          <code className="tree-id">{tree.id}</code>
        </div>
      </div>

      <div className="row gap">
        <Link to={`/tree/${tree.id}/update`} className="btn btn-primary grow">
          <Icon name="edit" size={16} /> {t('add_progress_update')}
        </Link>
      </div>

      <div className="card info-grid">
        <div><span className="muted small">{t('status')}</span><StatusBadge status={tree.status} large /></div>
        <div><span className="muted small">{t('height')}</span><strong>{tree.height_cm ? `${tree.height_cm} cm` : '—'}</strong></div>
        <div><span className="muted small">{t('planted_on')}</span><strong>{fmtDate(tree.planted_date)}</strong></div>
        <div><span className="muted small">{t('planted_by')}</span><strong>{tree.planted_by || '—'}</strong></div>
        {tree.site_name && (
          <div>
            <span className="muted small">{t('site')}</span>
            <strong><Link to={`/site/${tree.site_id}`}>{tree.site_name}</Link></strong>
          </div>
        )}
        {treeLocation(tree) && (
          <div>
            <span className="muted small">{t('position')}</span>
            <strong>{treeLocation(tree)}</strong>
          </div>
        )}
        <div><span className="muted small">{t('latitude')}</span><strong>{tree.lat ?? '—'}</strong></div>
        <div><span className="muted small">{t('longitude')}</span><strong>{tree.lng ?? '—'}</strong></div>
      </div>

      {tree.notes && <div className="card"><span className="muted small">{t('notes')}</span><p>{tree.notes}</p></div>}

      {tree.lat != null && tree.lng != null && (
        <div className="card pad0">
          <LeafletMap markers={[{ id: tree.id, lat: tree.lat, lng: tree.lng, status: tree.status, label: tree.species }]} height={260} />
          <a
            className="btn btn-outline mlink"
            href={`https://www.google.com/maps?q=${tree.lat},${tree.lng}`}
            target="_blank" rel="noreferrer"
          ><Icon name="navigation" size={16} /> {t('navigate_gmaps')}</a>
        </div>
      )}

      {qr && (
        <div className="card qr-card">
          <img src={qr} alt={`QR code for ${tree.id}`} />
          <div>
            <strong>{t('tree_qr')}</strong>
            <p className="muted small">{t('qr_hint')}</p>
            <a className="btn btn-outline" href={qr} download={`${tree.id}-qr.png`}>
              <Icon name="download" size={16} /> {t('download_qr')}
            </a>
          </div>
        </div>
      )}

      <section>
        <h2>{t('growth_timeline')} ({tree.updates.length})</h2>
        {tree.updates.length === 0 && (
          <div className="card empty">{t('no_tree_updates')}</div>
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
                <div className="muted small meta-line">
                  {u.height_cm ? <span className="meta-item"><Icon name="ruler" size={13} /> {u.height_cm} cm</span> : null}
                  {u.updated_by ? <span className="meta-item"><Icon name="user" size={13} /> {u.updated_by}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        className="btn btn-danger"
        onClick={async () => {
          if (!confirm(`${tree.id} (${tree.species}) — ${t('delete_confirm')}`)) return
          await fetch('/api/trees/' + tree.id, { method: 'DELETE' })
          navigate('/trees')
        }}
      ><Icon name="trash" size={16} /> {t('delete_tree')}</button>
    </div>
  )
}
