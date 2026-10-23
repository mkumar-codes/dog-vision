import PredictionRow, { PredictionRowSkeleton } from '../PredictionRow/PredictionRow'
import styles from './TopPredictions.module.css'

const ROW_COUNT = 5

// The 5 most likely breeds. Only the top one gets the primary color.
export default function TopPredictions({ predictions, loading }) {
  return (
    <ol className={styles.list}>
      {loading
        ? Array.from({ length: ROW_COUNT }, (_, i) => (
            <li key={i}>
              <PredictionRowSkeleton />
            </li>
          ))
        : predictions.map((prediction, i) => (
            // Stagger each row's entrance so the list "builds up"
            <li key={prediction.breed} style={{ '--delay': `${i * 70}ms` }}>
              <PredictionRow
                rank={prediction.rank}
                breed={prediction.breed}
                confidence={prediction.confidence}
                highlight={i === 0}
              />
            </li>
          ))}
    </ol>
  )
}
