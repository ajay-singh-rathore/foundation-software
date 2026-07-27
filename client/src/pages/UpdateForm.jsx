import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { postForm, STATUS } from '../api.js'
import PhotoInput from '../components/PhotoInput.jsx'
import GpsField from '../components/GpsField.jsx'
import { useLang } from '../i18n.jsx'

export default function UpdateForm() {
  const { t } = useLang()
  const { id } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [gps, setGps] = useState({ lat: '', lng: '' })
  const [status, setStatus] = useState('healthy')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const fd = new FormData(e.target)
      if (photo) fd.set('photo', photo)
      fd.set('lat', gps.lat); fd.set('lng', gps.lng)
      fd.set('status', status)
      await postForm(`/api/trees/${id}/updates`, fd)
      navigate('/tree/' + id)
    } catch (err) {
      setError(err.message); setBusy(false)
    }
  }

  return (
    <div className="page">
      <h2>📝 {t('add_progress_update')} — <code>{id}</code></h2>
      <form onSubmit={submit} className="form card">
        <PhotoInput onChange={setPhoto} />

        <label>{t('tree_condition')}</label>
        <div className="chips">
          {Object.entries(STATUS).map(([key, s]) => (
            <button
              type="button" key={key}
              className={'chip' + (status === key ? ' active' : '')}
              style={status === key ? { background: s.color, borderColor: s.color } : {}}
              onClick={() => setStatus(key)}
            >{s.emoji} {t('status_' + key)}</button>
          ))}
        </div>

        <div className="row gap">
          <label className="grow">{t('height_cm')}
            <input name="height_cm" type="number" step="any" min="0" placeholder="60" />
          </label>
          <label className="grow">{t('your_name')}
            <input name="updated_by" placeholder={t('field_worker_name')} />
          </label>
        </div>

        <label>{t('location_verify')}</label>
        <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />

        <label>{t('block_row_pos')}</label>
        <div className="row gap">
          <input name="block" placeholder="Block A" maxLength="8" />
          <input name="row_no" type="number" min="1" placeholder="Row 3" />
          <input name="pos" type="number" min="1" placeholder="#12" />
        </div>

        <label>{t('note')}
          <textarea name="note" rows="3" />
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? t('saving') : '✅ ' + t('save_update')}
        </button>
        <Link to={'/tree/' + id} className="btn btn-outline">{t('cancel')}</Link>
      </form>
    </div>
  )
}
