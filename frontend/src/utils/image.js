// The model only looks at 224x224 pixels, so anything much bigger is wasted upload.
const MAX_SIDE = 640
const JPEG_QUALITY = 0.9

// Shrinks large photos (e.g. 12 MP phone camera images) before they are uploaded.
// This makes uploads much faster on mobile data and keeps the server's memory low.
// If the browser can't process the image, the original file is returned unchanged.
export async function prepareImage(file) {
  try {
    // createImageBitmap applies the photo's EXIF rotation, so phone photos stay upright
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))

    if (scale === 1) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}
