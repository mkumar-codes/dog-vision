const API_URL = import.meta.env.VITE_API_URL

// Sends an image file to an API endpoint and returns the JSON response.
// Every image-based API call goes through this one function.
export async function postImage(endpoint, file) {
  const formData = new FormData()
  // The key must match the FastAPI parameter name: `file: UploadFile`
  formData.append('file', file)

  let response
  try {
    // No Content-Type header: the browser sets multipart/form-data with the boundary itself
    response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error('Could not reach the server. Is the API running?')
  }

  // fetch does not throw on 4xx/5xx, so check the status ourselves
  if (!response.ok) {
    throw new Error(`Prediction failed (status ${response.status}). Please try another image.`)
  }

  return response.json()
}
