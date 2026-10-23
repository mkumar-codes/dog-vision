import Spinner from '../Spinner/Spinner'
import styles from './Button.module.css'

// variant: "primary" | "secondary" | "ghost"
// loading: shows a spinner and blocks clicks until the request finishes
export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}
