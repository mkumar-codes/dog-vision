import styles from './ImagePreview.module.css'

// Shows the chosen image. While `scanning` is true, a scan line sweeps over it.
export default function ImagePreview({ src, alt = 'Selected dog', scanning = false }) {
  return (
    <div className={styles.frame} aria-busy={scanning}>
      <img className={styles.image} src={src} alt={alt} />

      {scanning && (
        <div className={styles.overlay}>
          <span className={styles.corners} />
          <span className={styles.scanLine} />
          <span className={styles.badge}>Scanning…</span>
        </div>
      )}
    </div>
  )
}
