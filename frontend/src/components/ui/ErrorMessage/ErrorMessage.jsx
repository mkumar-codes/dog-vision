import styles from './ErrorMessage.module.css'

export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  )
}
