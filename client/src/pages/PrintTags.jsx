import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { getJSON } from '../api.js'

const CHUNK = 300 // tags per print batch, keeps the page fast

export default function PrintTags() {
  const { id } = useParams()
  const [site, setSite] = useState(null)
  const [trees, setTrees] = useState(null)
  const [batch, setBatch] = useState(0)
  const [tags, setTags] = useState([])
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    getJSON('/api/sites/' + id).then(setSite).catch(() => {})
    getJSON('/api/trees?site=' + id).then(setTrees).catch(() => setTrees([]))
  }, [id])

  useEffect(() => {
    if (!trees) return
    const slice = trees.slice(batch * CHUNK, (batch + 1) * CHUNK)
    setRendering(true)
    let cancelled = false
    Promise.all(
      slice.map(t =>
        QRCode.toDataURL(window.location.origin + '/tree/' + t.id, {
          width: 300,
          margin: 1,
          errorCorrectionLevel: 'H', // survives ~30% damage — sun/rain-worn tags still scan
          color: { dark: '#0f2e1c' }
        }).then(qr => ({ ...t, qr }))
      )
    ).then(list => { if (!cancelled) { setTags(list); setRendering(false) } })
    return () => { cancelled = true }
  }, [trees, batch])

  if (!trees) return <div className="loading">Loading…</div>

  const batches = Math.ceil(trees.length / CHUNK)

  return (
    <div className="page">
      <div className="no-print">
        <h2>🏷️ QR Tags — {site?.name || ''} ({trees.length} trees)</h2>
        <div className="card">
          <p className="muted small">
            Print karo (A4), laminate ya flex-print karwao, aur dheele zip-tie se pedh par bandho.
            QR kharab ho jaye toh bhi tag par likha ID app mein search hota hai.
          </p>
          <div className="row gap" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => window.print()} disabled={rendering}>
              🖨️ Print {rendering ? '(preparing…)' : `batch ${batch + 1}/${batches || 1}`}
            </button>
            {batches > 1 && (
              <>
                <button className="btn btn-outline" disabled={batch === 0} onClick={() => setBatch(b => b - 1)}>← Prev</button>
                <button className="btn btn-outline" disabled={batch >= batches - 1} onClick={() => setBatch(b => b + 1)}>Next →</button>
              </>
            )}
            <Link to={`/site/${id}`} className="btn btn-outline">Back</Link>
          </div>
          {batches > 1 && (
            <p className="muted small">
              Batch {batch + 1} of {batches} — showing tags {batch * CHUNK + 1}–{Math.min((batch + 1) * CHUNK, trees.length)}.
              Har batch alag se print karo.
            </p>
          )}
        </div>
      </div>

      <div className="tag-sheet">
        {tags.map(t => (
          <div className="tag" key={t.id}>
            <img src={t.qr} alt={t.id} />
            <div className="tag-id">{t.id}</div>
            <div className="tag-species">{t.species}{t.local_name ? ` · ${t.local_name}` : ''}</div>
            <div className="tag-org">🌳 Foundation Software</div>
          </div>
        ))}
      </div>
    </div>
  )
}
