import { postImage } from './client'

// Returns { breed, confidence }
export const predictBreed = (file) => postImage('/predict', file)

// Returns { predictions: [{ rank, breed, confidence }, ...] }
export const predictTop5 = (file) => postImage('/predict/top5', file)
