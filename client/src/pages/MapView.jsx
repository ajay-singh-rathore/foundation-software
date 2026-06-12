import { useEffect, useState } from 'react'
import { getJSON, STATUS } from '../api.js'
import LeafletMap from '../components/LeafletMap.jsx'

export default function MapView() {
  const [trees, setTrees] = useState([])

  useEffect(() => { getJSON('/api/trees').then(setTrees).catch(() => {}) }, [])

  const markers = trees.map(t => ({
    id: t.id, lat: t.lat, lng: t.lng, status: t.status,
    label: `${t.species} (${t.id})`
  }))
  const located = markers.filter(m => m.lat != null && m.lng != null)

  return (
    <div className="page">
      <h2>🗺️ Plantation Map · {located.length} trees located</h2>
      <div className="legend card">
        {Object.values(STATUS).map(s => (
          <span key={s.label}><i style={{ background: s.color }} /> {s.label}</span>
        ))}
      </div>
      <div className="card pad0">
        <LeafletMap markers={markers} className="map-full" />
      </div>
    </div>
  )
}
