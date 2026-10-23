import PredictionRow, { PredictionRowSkeleton } from '../PredictionRow/PredictionRow'
import styles from './PredictionResult.module.css'

// The main answer: the single most likely breed
export default function PredictionResult({ result, loading }) {
  if (loading) return <PredictionRowSkeleton size="lg" />

  if (!result) {
    return <p className={styles.empty}>Upload a dog photo and press Predict to see its breed.</p>
  }

  return <PredictionRow breed={result.breed} confidence={result.confidence} size="lg" />
}
