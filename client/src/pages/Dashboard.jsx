import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, STATUS, fmtDateTime } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { getJSON('/api/stats').then(setStats).catch(e => setError(e.message)) }, [])

  if (error) return <div className="error card">{error}</div>
  if (!stats) return <div className="loading">Loading…</div>

  const healthy = stats.byStatus.healthy || 0
  const surviving = stats.total - (stats.byStatus.dead || 0)
  const survivalRate = stats.total ? Math.round((surviving / stats.total) * 100) : 0

  return (
    <div className="page">
      <div className="hero card">
        <div>
          <h1>🌳 {stats.total}</h1>
          <p>Trees planted · पेड़ लगाए गए</p>
        </div>
        <div className="hero-rate">
          <strong>{survivalRate}%</strong>
          <span>Survival rate</span>
        </div>
      </div>

      <div className="stat-grid">
        {Object.entries(STATUS).map(([key, s]) => (
          <Link key={key} to={`/trees?status=${key}`} className="stat-card card" style={{ borderColor: s.color }}>
            <span className="stat-emoji">{s.emoji}</span>
            <strong style={{ color: s.color }}>{stats.byStatus[key] || 0}</strong>
            <span className="muted small">{s.label} · {s.hindi}</span>
          </Link>
        ))}
      </div>

      <div className="row gap">
        <Link to="/trees/new" className="btn btn-primary grow">➕ Add New Tree</Link>
        <Link to="/map" className="btn btn-outline grow">🗺️ View Map</Link>
      </div>

      <section>
        <h2>Recent activity · हाल की गतिविधि</h2>
        {stats.recent.length === 0 && (
          <div className="card empty">No updates yet. Visit a tree and add its first progress update! 🌱</div>
        )}
        {stats.recent.map(u => (
          <Link to={`/tree/${u.tree_id}`} key={u.id} className="card activity">
            <div className="activity-photo">
              {u.photo ? <img src={u.photo} alt="" loading="lazy" /> : <span>🌱</span>}
            </div>
            <div className="grow">
              <div className="row spread">
                <strong>{u.species} <code>{u.tree_id}</code></strong>
                {u.status && <StatusBadge status={u.status} />}
              </div>
              {u.note && <div className="muted">{u.note}</div>}
              <div className="muted small">
                {u.updated_by ? `👤 ${u.updated_by} · ` : ''}{fmtDateTime(u.created_at)}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
