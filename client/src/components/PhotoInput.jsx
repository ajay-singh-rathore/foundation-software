import { useState } from 'react'

// Camera/gallery photo picker with preview. On mobile, capture opens the back camera.
export default function PhotoInput({ onChange }) {
  const [preview, setPreview] = useState(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  return (
    <label className="photo-input">
      {preview
        ? <img src={preview} alt="Selected" />
        : <div className="photo-input-empty">📷<span>Tap to take photo / फोटो लें</span></div>}
      <input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
    </label>
  )
}
