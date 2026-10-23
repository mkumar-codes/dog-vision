import ProgressBar from '../../ui/ProgressBar/ProgressBar'
import Skeleton from '../../ui/Skeleton/Skeleton'
import { formatBreed, formatPercent } from '../../../utils/format'
import styles from './PredictionRow.module.css'

// One breed + confidence line. Used once by PredictionResult and five times by TopPredictions.
// size: "md" | "lg"   highlight: use the primary color for the bar
export default function PredictionRow({ breed, confidence, rank, size = 'md', highlight = true }) {
  const name = formatBreed(breed)

  return (
    <div className={`${styles.row} ${styles[size]}`}>
      <div className={styles.header}>
        {rank && <span className={styles.rank}>{rank}</span>}
        <span className={styles.breed}>{name}</span>
        <span className={styles.percent}>{formatPercent(confidence)}</span>
      </div>
      <ProgressBar
        value={confidence}
        tone={highlight ? 'primary' : 'muted'}
        label={`${name} confidence`}
      />
    </div>
  )
}

// Same shape as a real row, shown while the prediction is loading
export function PredictionRowSkeleton({ size = 'md' }) {
  return (
    <div className={`${styles.row} ${styles[size]}`}>
      <div className={styles.header}>
        <Skeleton width="55%" height={size === 'lg' ? 28 : 16} />
        <Skeleton width={48} height={size === 'lg' ? 28 : 16} />
      </div>
      <Skeleton height={8} radius="var(--radius-full)" />
    </div>
  )
}
