import { useState } from 'react'
import styles from './ImageDropzone.module.css'

// Lets the user drag & drop an image or click to choose one.
// A <label> wraps the hidden <input>, so click, keyboard and screen readers all work.
export default function ImageDropzone({ onSelect, onInvalid }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onInvalid?.('Please choose an image file (JPG or PNG).')
      return
    }
    onSelect(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault() // required, otherwise the browser opens the file
    setIsDragging(true)
  }

  return (
    <label
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
    >
      <input
        className={styles.input}
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files[0])}
      />

      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      <span className={styles.title}>Drop a dog photo here</span>
      <span className={styles.hint}>or click to browse · JPG or PNG</span>
    </label>
  )
}
