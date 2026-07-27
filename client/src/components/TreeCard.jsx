import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import { fmtDate, treeLocation } from '../api.js'

export default function TreeCard({ tree }) {
  return (
    <Link to={`/tree/${tree.id}`} className="tree-card">
      <div className="tree-card-photo">
        {tree.photo
          ? <img src={tree.photo} alt={tree.species} loading="lazy" />
          : <div className="photo-placeholder">🌱</div>}
      </div>
      <div className="tree-card-body">
        <div className="tree-card-top">
          <strong>{tree.species}</strong>
          <code>{tree.id}</code>
        </div>
        {tree.local_name && <div className="muted">{tree.local_name}</div>}
        <div className="tree-card-meta">
          <StatusBadge status={tree.status} />
          {tree.height_cm ? <span className="muted">📏 {tree.height_cm} cm</span> : null}
        </div>
        <div className="muted small">
          {treeLocation(tree) ? `🧱 ${treeLocation(tree)} · ` : ''}🌱 {fmtDate(tree.planted_date)}
        </div>
      </div>
    </Link>
  )
}
