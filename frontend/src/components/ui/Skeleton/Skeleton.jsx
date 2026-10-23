import styles from './Skeleton.module.css'

// A shimmering placeholder shown in place of content that is still loading
export default function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)' }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
