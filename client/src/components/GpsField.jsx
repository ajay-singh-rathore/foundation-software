import { useState } from 'react'
import { useLang } from '../i18n.jsx'

// Latitude/longitude inputs with a one-tap "use my location" button.
export default function GpsField({ lat, lng, onChange }) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function locate() {
    if (!navigator.geolocation) { setError(t('gps_not_supported')); return }
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
        <input type="number" step="any" placeholder={t('latitude')} value={lat}
          onChange={(e) => onChange({ lat: e.target.value, lng })} />
        <input type="number" step="any" placeholder={t('longitude')} value={lng}
          onChange={(e) => onChange({ lat, lng: e.target.value })} />
      </div>
      <button type="button" className="btn btn-outline" onClick={locate} disabled={busy}>
        {busy ? '📡 ' + t('locating') : '📍 ' + t('use_my_location')}
      </button>
      {error && <div className="error small">{error}</div>}
    </div>
  )
}
