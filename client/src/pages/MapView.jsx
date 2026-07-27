import { useEffect, useState } from 'react'
import { getJSON, STATUS } from '../api.js'
import LeafletMap from '../components/LeafletMap.jsx'
import { useLang } from '../i18n.jsx'

export default function MapView() {
  const { t } = useLang()
  const [trees, setTrees] = useState([])

  useEffect(() => { getJSON('/api/trees').then(setTrees).catch(() => {}) }, [])

  const markers = trees.map(tr => ({
    id: tr.id, lat: tr.lat, lng: tr.lng, status: tr.status,
    label: `${tr.species} (${tr.id})`
  }))
  const located = markers.filter(m => m.lat != null && m.lng != null)

  return (
    <div className="page">
      <h2>🗺️ {t('plantation_map')} · {located.length} {t('trees_located')}</h2>
      <div className="legend card">
        {Object.entries(STATUS).map(([key, s]) => (
          <span key={key}><i style={{ background: s.color }} /> {t('status_' + key)}</span>
        ))}
      </div>
      <div className="card pad0">
        <LeafletMap markers={markers} className="map-full" />
      </div>
    </div>
  )
}
