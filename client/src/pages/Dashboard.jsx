import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, STATUS, fmtDateTime } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import Icon from '../components/Icons.jsx'
import { useLang } from '../i18n.jsx'

export default function Dashboard() {
  const { t } = useLang()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { getJSON('/api/stats').then(setStats).catch(e => setError(e.message)) }, [])

  if (error) return <div className="error card">{error}</div>
  if (!stats) return <div className="loading">{t('loading')}</div>

  const surviving = stats.total - (stats.byStatus.dead || 0)
  const survivalRate = stats.total ? Math.round((surviving / stats.total) * 100) : 0

  return (
    <div className="page">
      <div className="hero card">
        <div>
          <h1>{stats.total}</h1>
          <p>{t('trees_planted')}</p>
        </div>
        <div className="hero-rate">
          <strong>{survivalRate}%</strong>
          <span>{t('survival_rate')}</span>
        </div>
      </div>

      <div className="stat-grid">
        {Object.entries(STATUS).map(([key, s]) => (
          <Link key={key} to={`/trees?status=${key}`} className="stat-card card" style={{ borderColor: s.color }}>
            <span className="stat-label muted small">
              <i className="dot" style={{ background: s.color }} /> {t('status_' + key)}
            </span>
            <strong style={{ color: s.color }}>{stats.byStatus[key] || 0}</strong>
          </Link>
        ))}
      </div>

      <div className="row gap">
        <Link to="/trees/new" className="btn btn-primary grow"><Icon name="plus" size={16} /> {t('add_new_tree')}</Link>
        <Link to="/map" className="btn btn-outline grow"><Icon name="map" size={16} /> {t('view_map')}</Link>
      </div>

      <section>
        <h2>{t('recent_activity')}</h2>
        {stats.recent.length === 0 && (
          <div className="card empty">{t('no_updates_yet')}</div>
        )}
        {stats.recent.map(u => (
          <Link to={`/tree/${u.tree_id}`} key={u.id} className="card activity">
            <div className="activity-photo">
              {u.photo
                ? <img src={u.photo} alt="" loading="lazy" />
                : <Icon name="leaf" size={22} strokeWidth={1.7} />}
            </div>
            <div className="grow">
              <div className="row spread">
                <strong>{u.species} <code>{u.tree_id}</code></strong>
                {u.status && <StatusBadge status={u.status} />}
              </div>
              {u.note && <div className="muted small">{u.note}</div>}
              <div className="muted small meta-line">
                {u.updated_by && <span className="meta-item"><Icon name="user" size={13} /> {u.updated_by}</span>}
                <span className="meta-item"><Icon name="calendar" size={13} /> {fmtDateTime(u.created_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
