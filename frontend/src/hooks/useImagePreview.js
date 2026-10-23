import { useCallback, useEffect, useRef, useState } from 'react'

// Keeps the selected image file and a temporary URL to preview it.
// The old URL is released whenever a new file is picked, so memory doesn't leak.
export function useImagePreview() {
  const [image, setImage] = useState(null) // { file, previewUrl }
  const urlRef = useRef(null)

  const selectImage = useCallback((file) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)

    const previewUrl = file ? URL.createObjectURL(file) : null
    urlRef.current = previewUrl
    setImage(file ? { file, previewUrl } : null)
  }, [])

  const clearImage = useCallback(() => selectImage(null), [selectImage])

  // Release the last URL when the component using this hook unmounts
  useEffect(() => {
    const urls = urlRef
    return () => {
      if (urls.current) URL.revokeObjectURL(urls.current)
    }
  }, [])

  return {
    file: image?.file ?? null,
    previewUrl: image?.previewUrl ?? null,
    selectImage,
    clearImage,
  }
}
