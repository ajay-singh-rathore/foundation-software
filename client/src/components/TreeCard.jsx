import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import Icon from './Icons.jsx'
import { fmtDate, treeLocation } from '../api.js'

export default function TreeCard({ tree }) {
  return (
    <Link to={`/tree/${tree.id}`} className="tree-card">
      <div className="tree-card-photo">
        {tree.photo
          ? <img src={tree.photo} alt={tree.species} loading="lazy" />
          : <div className="photo-placeholder"><Icon name="image" size={26} strokeWidth={1.6} /></div>}
      </div>
      <div className="tree-card-body">
        <div className="tree-card-top">
          <strong>{tree.species}</strong>
          <code>{tree.id}</code>
        </div>
        {tree.local_name && <div className="muted small">{tree.local_name}</div>}
        <div className="tree-card-meta">
          <StatusBadge status={tree.status} />
          {tree.height_cm ? (
            <span className="muted small meta-item"><Icon name="ruler" size={13} /> {tree.height_cm} cm</span>
          ) : null}
        </div>
        <div className="muted small meta-line">
          {treeLocation(tree) && <span className="meta-item"><Icon name="rows" size={13} /> {treeLocation(tree)}</span>}
          <span className="meta-item"><Icon name="calendar" size={13} /> {fmtDate(tree.planted_date)}</span>
        </div>
      </div>
    </Link>
  )
}
