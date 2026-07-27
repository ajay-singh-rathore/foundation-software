import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { getJSON } from '../api.js'
import Icon from '../components/Icons.jsx'
import { useLang } from '../i18n.jsx'

const CHUNK = 300 // tags per print batch, keeps the page fast

export default function PrintTags() {
  const { t } = useLang()
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
      slice.map(tr =>
        QRCode.toDataURL(window.location.origin + '/tree/' + tr.id, {
          width: 300,
          margin: 1,
          errorCorrectionLevel: 'H', // survives ~30% damage — sun/rain-worn tags still scan
          color: { dark: '#0f2e1c' }
        }).then(qr => ({ ...tr, qr }))
      )
    ).then(list => { if (!cancelled) { setTags(list); setRendering(false) } })
    return () => { cancelled = true }
  }, [trees, batch])

  if (!trees) return <div className="loading">{t('loading')}</div>

  const batches = Math.ceil(trees.length / CHUNK)

  return (
    <div className="page">
      <div className="no-print">
        <h2>{t('qr_tags')} — {site?.name || ''} ({trees.length})</h2>
        <div className="card">
          <p className="muted small">{t('tag_print_hint')}</p>
          <div className="row gap" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => window.print()} disabled={rendering}>
              <Icon name="printer" size={16} /> {t('print')} {rendering ? `(${t('preparing')})` : `${batch + 1}/${batches || 1}`}
            </button>
            {batches > 1 && (
              <>
                <button className="btn btn-outline" disabled={batch === 0} onClick={() => setBatch(b => b - 1)}>← {t('prev')}</button>
                <button className="btn btn-outline" disabled={batch >= batches - 1} onClick={() => setBatch(b => b + 1)}>{t('next')} →</button>
              </>
            )}
            <Link to={`/site/${id}`} className="btn btn-outline">{t('back')}</Link>
          </div>
          {batches > 1 && (
            <p className="muted small">
              {t('batch')} {batch + 1}/{batches} — {batch * CHUNK + 1}–{Math.min((batch + 1) * CHUNK, trees.length)}. {t('print_each_batch')}
            </p>
          )}
        </div>
      </div>

      <div className="tag-sheet">
        {tags.map(tr => (
          <div className="tag" key={tr.id}>
            <img src={tr.qr} alt={tr.id} />
            <div className="tag-id">{tr.id}</div>
            <div className="tag-species">{tr.species}{tr.local_name ? ` · ${tr.local_name}` : ''}</div>
            {tr.block && (
              <div className="tag-loc">
                Block {tr.block}{tr.row_no ? ` · Row ${tr.row_no}` : ''}{tr.pos ? ` · #${tr.pos}` : ''}
              </div>
            )}
            <div className="tag-org">Aranya · aranya.briklabs.in</div>
          </div>
        ))}
      </div>
    </div>
  )
}
