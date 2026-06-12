import { statusInfo } from '../api.js'

export default function StatusBadge({ status, large }) {
  const s = statusInfo(status)
  return (
    <span
      className={'badge' + (large ? ' badge-lg' : '')}
      style={{ color: s.color, background: s.bg }}
    >
      {s.emoji} {s.label} · {s.hindi}
    </span>
  )
}
