import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { statusInfo } from '../api.js'

// Renders an OpenStreetMap with one circle-marker per tree, colored by status.
export default function LeafletMap({ markers = [], height, className = '', zoom = 16, interactive = true }) {
  const divRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      tap: interactive
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    map.setView([20.5937, 78.9629], 5) // India fallback view
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (layerRef.current) layerRef.current.remove()
    const group = L.featureGroup()
    for (const m of markers) {
      if (m.lat == null || m.lng == null) continue
      const s = statusInfo(m.status)
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 9, color: '#ffffff', weight: 2, fillColor: s.color, fillOpacity: 0.95
      })
      if (m.label) {
        marker.bindPopup(
          `<div style="font-family:Poppins,sans-serif">
             <strong>${m.label}</strong><br/>${s.emoji} ${s.label}<br/>
             ${m.id ? `<a href="/tree/${m.id}">Open ${m.id} →</a>` : ''}
           </div>`
        )
      }
      marker.addTo(group)
    }
    if (group.getLayers().length > 0) {
      group.addTo(map)
      layerRef.current = group
      const bounds = group.getBounds()
      if (group.getLayers().length === 1) map.setView(bounds.getCenter(), zoom)
      else map.fitBounds(bounds.pad(0.2))
    }
  }, [markers, zoom])

  return (
    <div
      ref={divRef}
      className={('leaflet-box ' + className).trim()}
      style={height != null ? { height } : undefined}
    />
  )
}
