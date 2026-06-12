import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { postForm, STATUS } from '../api.js'
import PhotoInput from '../components/PhotoInput.jsx'
import GpsField from '../components/GpsField.jsx'

export default function UpdateForm() {
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
      <h2>📝 Progress Update — <code>{id}</code></h2>
      <form onSubmit={submit} className="form card">
        <PhotoInput onChange={setPhoto} />

        <label>Tree condition · पेड़ की हालत</label>
        <div className="chips">
          {Object.entries(STATUS).map(([key, s]) => (
            <button
              type="button" key={key}
              className={'chip' + (status === key ? ' active' : '')}
              style={status === key ? { background: s.color, borderColor: s.color } : {}}
              onClick={() => setStatus(key)}
            >{s.emoji} {s.label}</button>
          ))}
        </div>

        <div className="row gap">
          <label className="grow">Height (cm) · ऊँचाई
            <input name="height_cm" type="number" step="any" min="0" placeholder="60" />
          </label>
          <label className="grow">Your name · आपका नाम
            <input name="updated_by" placeholder="Field worker name" />
          </label>
        </div>

        <label>Location (verifies the visit) · लोकेशन</label>
        <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />

        <label>Note · टिप्पणी
          <textarea name="note" rows="3" placeholder="Watered, added compost, pest check…" />
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : '✅ Save Update · सेव करें'}
        </button>
        <Link to={'/tree/' + id} className="btn btn-outline">Cancel</Link>
      </form>
    </div>
  )
}
