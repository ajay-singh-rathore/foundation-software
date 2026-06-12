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

export const STATUS = {
  healthy:         { label: 'Healthy', hindi: 'स्वस्थ',        color: '#16a34a', bg: '#dcfce7', emoji: '🌿' },
  needs_attention: { label: 'Needs Care', hindi: 'देखभाल चाहिए', color: '#d97706', bg: '#fef3c7', emoji: '⚠️' },
  sick:            { label: 'Sick', hindi: 'बीमार',            color: '#dc2626', bg: '#fee2e2', emoji: '🍂' },
  dead:            { label: 'Dead', hindi: 'सूख गया',          color: '#52525b', bg: '#e4e4e7', emoji: '🪵' }
}

export const statusInfo = (s) => STATUS[s] || STATUS.healthy

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
