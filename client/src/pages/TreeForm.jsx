import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postForm } from '../api.js'
import PhotoInput from '../components/PhotoInput.jsx'
import GpsField from '../components/GpsField.jsx'

export default function TreeForm() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [gps, setGps] = useState({ lat: '', lng: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

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
      <h2>🌱 Add New Tree · नया पेड़ जोड़ें</h2>
      <form onSubmit={submit} className="form card">
        <PhotoInput onChange={setPhoto} />

        <label>Species * · प्रजाति
          <input name="species" required placeholder="e.g. Neem, Peepal, Mango" />
        </label>
        <label>Local name · स्थानीय नाम
          <input name="local_name" placeholder="e.g. नीम" />
        </label>
        <div className="row gap">
          <label className="grow">Planted date · तारीख
            <input name="planted_date" type="date" />
          </label>
          <label className="grow">Height (cm) · ऊँचाई
            <input name="height_cm" type="number" step="any" min="0" placeholder="45" />
          </label>
        </div>
        <label>Planted by · किसने लगाया
          <input name="planted_by" placeholder="Volunteer / team name" />
        </label>

        <label>Location · लोकेशन</label>
        <GpsField lat={gps.lat} lng={gps.lng} onChange={setGps} />

        <label>Notes · टिप्पणी
          <textarea name="notes" rows="3" placeholder="Soil type, surroundings, anything important…" />
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : '✅ Save Tree · सेव करें'}
        </button>
      </form>
    </div>
  )
}
