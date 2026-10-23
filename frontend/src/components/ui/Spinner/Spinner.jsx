import styles from './Spinner.module.css'

// A spinning ring that uses the current text color, so it fits in any button or card
export default function Spinner({ size = 18, label = 'Loading' }) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  )
}
