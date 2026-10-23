import { useCallback, useRef, useState } from 'react'

const initialState = { data: null, loading: false, error: null }

// Wraps any async function with loading / error / data state.
// Used for both the prediction and the top-5 calls.
export function useAsync(asyncFn) {
  const [state, setState] = useState(initialState)
  // Each call gets an id, so a slow old response can't overwrite a newer one
  const latestCall = useRef(0)

  const run = useCallback(
    async (...args) => {
      const callId = ++latestCall.current
      setState({ data: null, loading: true, error: null })

      try {
        const data = await asyncFn(...args)
        if (callId === latestCall.current) {
          setState({ data, loading: false, error: null })
        }
      } catch (error) {
        if (callId === latestCall.current) {
          setState({ data: null, loading: false, error })
        }
      }
    },
    [asyncFn],
  )

  const reset = useCallback(() => {
    latestCall.current++ // ignore any request still in flight
    setState(initialState)
  }, [])

  return { ...state, run, reset }
}
