import styles from './ProgressBar.module.css'

// value: a number from 0 to 1. The bar grows from 0 when it first appears.
// tone: "primary" | "muted"
export default function ProgressBar({ value, tone = 'primary', label }) {
  const clamped = Math.min(Math.max(value, 0), 1)

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div
        className={`${styles.fill} ${styles[tone]}`}
        style={{ '--value': clamped }}
      />
    </div>
  )
}
