import { useState } from 'react'

// Latitude/longitude inputs with a one-tap "use my location" button.
export default function GpsField({ lat, lng, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function locate() {
    if (!navigator.geolocation) { setError('GPS not supported on this device'); return }
    setBusy(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })
        setBusy(false)
      },
      (err) => { setError(err.message); setBusy(false) },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <div className="gps-field">
      <div className="row">
        <input type="number" step="any" placeholder="Latitude" value={lat}
          onChange={(e) => onChange({ lat: e.target.value, lng })} />
        <input type="number" step="any" placeholder="Longitude" value={lng}
          onChange={(e) => onChange({ lat, lng: e.target.value })} />
      </div>
      <button type="button" className="btn btn-outline" onClick={locate} disabled={busy}>
        {busy ? '📡 Locating…' : '📍 Use my current location / मेरी लोकेशन लें'}
      </button>
      {error && <div className="error small">{error}</div>}
    </div>
  )
}
