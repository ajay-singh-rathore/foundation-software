import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJSON, postForm } from '../api.js'
import PhotoInput from '../components/PhotoInput.jsx'
import GpsField from '../components/GpsField.jsx'
import Icon from '../components/Icons.jsx'
import { useLang } from '../i18n.jsx'

export default function TreeForm() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [gps, setGps] = useState({ lat: '', lng: '' })
  const [sites, setSites] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { getJSON('/api/sites').then(setSites).catch(() => {}) }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const fd = new FormData(e.target)
      if (photo) fd.set('photo', photo)
      fd.set('lat', gps.lat); fd.set('lng', gps.lng)
      const tree = await postForm('/api/trees', fd)
      navigate('/tree/' + tree.id)
    } catch (err) {
      setError(err.message); setBusy(false)
    }
  }

  return (
    <div className="page">
      <h2>{t('add_new_tree')}</h2>
      <form onSubmit={submit} className="form card">
        <PhotoInput onChange={setPhoto} />

        <label>{t('species')} *
          <input name="species" required placeholder="Neem, Peepal, Mango…" />
        </label>
        <label>{t('local_name')}
          <input name="local_name" placeholder="नीम" />
        </label>
        {sites.length > 0 && (
          <label>{t('site')}
            <select name="site_id" defaultValue="">
              <option value="">{t('no_site')}</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
        <div className="row gap">
          <label className="grow">{t('planted_date')}
            <input name="planted_date" type="date" />
          </label>
          <label className="grow">{t('height_cm')}
            <input name="height_cm" type="number" step="any" min="0" placeholder="45" />
          </label>
        </div>
        <label>{t('planted_by')}
          <input name="planted_by" placeholder={t('field_worker_name')} />
        </label>

        <label>{t('location')}</label>
        <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />

        <label>{t('notes')}
          <textarea name="notes" rows="3" />
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>
          <Icon name="check" size={16} /> {busy ? t('saving') : t('save_tree')}
        </button>
      </form>
    </div>
  )
}
