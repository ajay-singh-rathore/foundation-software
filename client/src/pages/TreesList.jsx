import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getJSON, STATUS } from '../api.js'
import TreeCard from '../components/TreeCard.jsx'
import { useLang } from '../i18n.jsx'

export default function TreesList() {
  const { t } = useLang()
  const [params, setParams] = useSearchParams()
  const [trees, setTrees] = useState(null)
  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const site = params.get('site') || ''

  useEffect(() => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    if (site) q.set('site', site)
    getJSON('/api/trees?' + q.toString()).then(setTrees).catch(() => setTrees([]))
  }, [search, status, site])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="page">
      <h2>{t('all_trees')} {trees ? `(${trees.length})` : ''}</h2>
      {site && trees?.length > 0 && (
        <div className="card small" style={{ padding: '10px 14px' }}>
          {t('site_filter')}: <strong>{trees[0].site_name || `#${site}`}</strong>
          {' · '}
          <a href="#" onClick={(e) => { e.preventDefault(); setParam('site', '') }}>{t('clear')}</a>
        </div>
      )}
      <input
        className="search"
        placeholder={t('search_placeholder')}
        value={search}
        onChange={(e) => setParam('search', e.target.value)}
      />
      <div className="chips">
        <button className={'chip' + (!status ? ' active' : '')} onClick={() => setParam('status', '')}>{t('all')}</button>
        {Object.entries(STATUS).map(([key, s]) => (
          <button
            key={key}
            className={'chip' + (status === key ? ' active' : '')}
            style={status === key ? { background: s.color, borderColor: s.color } : {}}
            onClick={() => setParam('status', key)}
          >
            <i className="dot" style={{ background: status === key ? '#fff' : s.color }} /> {t('status_' + key)}
          </button>
        ))}
      </div>

      {!trees && <div className="loading">{t('loading')}</div>}
      {trees && trees.length === 0 && (
        <div className="card empty">{t('no_trees_found')}</div>
      )}
      <div className="tree-grid">
        {trees?.map(tr => <TreeCard key={tr.id} tree={tr} />)}
      </div>
    </div>
  )
}
