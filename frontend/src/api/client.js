const API_URL = import.meta.env.VITE_API_URL

// Free hosting plans put the server to sleep when idle, and waking it can take about a minute
const REQUEST_TIMEOUT_MS = 90_000

const MESSAGES = {
  offline: "You seem to be offline. Please check your internet connection and try again.",
  unreachable: "We couldn't connect to Dog Vision. The server may be waking up, which can take up to a minute. Please try again shortly.",
  timeout: "This is taking longer than usual. Please try again in a moment.",
  invalidImage: "That file doesn't look like a photo. Please choose a JPG or PNG image.",
  tooLarge: "This photo is too large. Please choose a smaller one.",
  server: "Something went wrong while analyzing your photo. Please try again.",
}

function messageForStatus(status) {
  if (status === 400 || status === 415 || status === 422) return MESSAGES.invalidImage
  if (status === 413) return MESSAGES.tooLarge
  return MESSAGES.server
}

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
      signal: AbortSignal.timeout?.(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    let message = MESSAGES.unreachable
    if (error.name === 'TimeoutError') message = MESSAGES.timeout
    else if (!navigator.onLine) message = MESSAGES.offline

    // Keep the original error as `cause`, so the technical details are still available
    throw new Error(message, { cause: error })
  }

  // fetch does not throw on 4xx/5xx, so check the status ourselves
  if (!response.ok) {
    throw new Error(messageForStatus(response.status))
  }

  return response.json()
}

// Sends a tiny request when the app opens, so a sleeping server starts waking up
// while the user is still choosing a photo. Errors are ignored on purpose.
export function wakeUpServer() {
  fetch(`${API_URL}/`).catch(() => {})
}
