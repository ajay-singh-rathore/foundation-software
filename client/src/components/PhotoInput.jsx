import { useState } from 'react'
import Icon from './Icons.jsx'
import { useLang } from '../i18n.jsx'

// Shrinks phone photos (~4MB) to app-sized JPEGs (~300KB) before upload,
// so the 1GB server disk holds thousands of photos instead of ~250.
async function compress(file) {
  if (!file.type.startsWith('image/')) return file
  try {
    let bmp
    try {
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      bmp = await createImageBitmap(file)
    }
    const MAX = 1600
    const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height))
    const w = Math.round(bmp.width * scale)
    const h = Math.round(bmp.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.8))
    if (blob && blob.size < file.size) {
      const name = (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg'
      return new File([blob], name, { type: 'image/jpeg' })
    }
  } catch {
    // any failure: fall back to the original file
  }
  return file
}

// Camera/gallery photo picker with preview. On mobile, capture opens the back camera.
export default function PhotoInput({ onChange }) {
  const { t } = useLang()
  const [preview, setPreview] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const small = await compress(file)
    setPreview(URL.createObjectURL(small))
    onChange(small)
  }

  return (
    <label className="photo-input">
      {preview
        ? <img src={preview} alt="Selected" />
        : (
          <div className="photo-input-empty">
            <Icon name="camera" size={30} strokeWidth={1.7} />
            <span>{t('photo_tap')}</span>
          </div>
        )}
      <input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
    </label>
  )
}
