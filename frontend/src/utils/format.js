// "soft-coated_wheaten_terrier" -> "Soft-Coated Wheaten Terrier"
export function formatBreed(breed) {
  return breed
    .replace(/_/g, ' ')
    .replace(/(^|[\s-])\w/g, (match) => match.toUpperCase())
}

// 0.7029 -> "70.3%"
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}
