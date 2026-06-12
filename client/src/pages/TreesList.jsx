import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getJSON, STATUS } from '../api.js'
import TreeCard from '../components/TreeCard.jsx'

export default function TreesList() {
  const [params, setParams] = useSearchParams()
  const [trees, setTrees] = useState(null)
  const search = params.get('search') || ''
  const status = params.get('status') || ''

  useEffect(() => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    getJSON('/api/trees?' + q.toString()).then(setTrees).catch(() => setTrees([]))
  }, [search, status])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="page">
      <h2>All Trees · सभी पेड़ {trees ? `(${trees.length})` : ''}</h2>
      <input
        className="search"
        placeholder="🔍 Search by ID, species, planter…"
        value={search}
        onChange={(e) => setParam('search', e.target.value)}
      />
      <div className="chips">
        <button className={'chip' + (!status ? ' active' : '')} onClick={() => setParam('status', '')}>All</button>
        {Object.entries(STATUS).map(([key, s]) => (
          <button
            key={key}
            className={'chip' + (status === key ? ' active' : '')}
            style={status === key ? { background: s.color, borderColor: s.color } : {}}
            onClick={() => setParam('status', key)}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {!trees && <div className="loading">Loading…</div>}
      {trees && trees.length === 0 && (
        <div className="card empty">No trees found. Tap ➕ to add your first tree! 🌱</div>
      )}
      <div className="tree-grid">
        {trees?.map(t => <TreeCard key={t.id} tree={t} />)}
      </div>
    </div>
  )
}
