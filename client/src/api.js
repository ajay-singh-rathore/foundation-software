async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed'
    try { msg = (await res.json()).error || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export const getJSON = (path) => fetch(path).then(handle)

export const postForm = (path, formData) =>
  fetch(path, { method: 'POST', body: formData }).then(handle)

export const postJSON = (path, data) =>
  fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handle)

export const STATUS = {
  healthy:         { label: 'Healthy',    color: '#16a34a', bg: '#dcfce7' },
  needs_attention: { label: 'Needs Care', color: '#d97706', bg: '#fef3c7' },
  sick:            { label: 'Sick',       color: '#dc2626', bg: '#fee2e2' },
  dead:            { label: 'Dead',       color: '#52525b', bg: '#e4e4e7' }
}

export const statusInfo = (s) => STATUS[s] || STATUS.healthy

// "A · Row 3 · #5" — human label for a tree's block/row position
export function treeLocation(t) {
  if (!t?.block) return null
  let s = 'Block ' + t.block
  if (t.row_no) s += ' · Row ' + t.row_no
  if (t.pos) s += ' · #' + t.pos
  return s
}

export function fmtDate(d) {
  if (!d) return '—'
  const date = new Date(d.includes('T') || d.includes(' ') ? d.replace(' ', 'T') + 'Z' : d)
  if (isNaN(date)) return d
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDateTime(d) {
  if (!d) return '—'
  const date = new Date(d.replace(' ', 'T') + 'Z')
  if (isNaN(date)) return d
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
