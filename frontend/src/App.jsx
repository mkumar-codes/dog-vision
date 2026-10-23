import { useState } from 'react'
import { predictBreed, predictTop5 } from './api/predictions'
import { useAsync } from './hooks/useAsync'
import { useImagePreview } from './hooks/useImagePreview'
import Button from './components/ui/Button/Button'
import Card from './components/ui/Card/Card'
import ErrorMessage from './components/ui/ErrorMessage/ErrorMessage'
import ImageDropzone from './components/upload/ImageDropzone/ImageDropzone'
import ImagePreview from './components/upload/ImagePreview/ImagePreview'
import PredictionResult from './components/prediction/PredictionResult/PredictionResult'
import TopPredictions from './components/prediction/TopPredictions/TopPredictions'
import styles from './App.module.css'

function App() {
  const { file, previewUrl, selectImage, clearImage } = useImagePreview()
  const prediction = useAsync(predictBreed)
  const top5 = useAsync(predictTop5)
  const [uploadError, setUploadError] = useState('')

  // Any new image or reset clears all previous results
  const clearResults = () => {
    prediction.reset()
    top5.reset()
    setUploadError('')
  }

  const handleSelect = (newFile) => {
    clearResults()
    selectImage(newFile)
  }

  const handleReset = () => {
    clearResults()
    clearImage()
  }

  const handlePredict = () => {
    top5.reset()
    prediction.run(file)
  }

  const showTop5Card = top5.loading || top5.data || top5.error

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dog Vision</h1>
        <p className={styles.subtitle}>Upload a photo and find out which of 120 dog breeds it looks like.</p>
      </header>

      <main className={styles.layout}>
        <Card title="Your photo">
          {previewUrl ? (
            <ImagePreview src={previewUrl} scanning={prediction.loading} />
          ) : (
            <ImageDropzone onSelect={handleSelect} onInvalid={setUploadError} />
          )}
          <ErrorMessage message={uploadError} />

          <div className={styles.actions}>
            <Button onClick={handlePredict} disabled={!file} loading={prediction.loading}>
              {prediction.loading ? 'Predicting…' : 'Predict breed'}
            </Button>
            {file && (
              <Button variant="ghost" onClick={handleReset}>
                Try another photo
              </Button>
            )}
          </div>
        </Card>

        <div className={styles.results}>
          <Card title="Prediction">
            <PredictionResult result={prediction.data} loading={prediction.loading} />
            <ErrorMessage message={prediction.error?.message} />

            {prediction.data && !showTop5Card && (
              <Button variant="secondary" onClick={() => top5.run(file)}>
                Show top 5 predictions
              </Button>
            )}
          </Card>

          {showTop5Card && (
            <Card title="Top 5 predictions">
              <TopPredictions predictions={top5.data?.predictions ?? []} loading={top5.loading} />
              <ErrorMessage message={top5.error?.message} />
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
