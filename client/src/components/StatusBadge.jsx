import { statusInfo } from '../api.js'
import { useLang } from '../i18n.jsx'

const VALID = { healthy: 1, needs_attention: 1, sick: 1, dead: 1 }

export default function StatusBadge({ status, large }) {
  const { t } = useLang()
  const s = statusInfo(status)
  const key = 'status_' + (status in VALID ? status : 'healthy')
  return (
    <span
      className={'badge' + (large ? ' badge-lg' : '')}
      style={{ color: s.color, background: s.bg }}
    >
      <i className="dot" style={{ background: s.color }} /> {t(key)}
    </span>
  )
}
