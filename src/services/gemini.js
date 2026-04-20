function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id))
}

function safeJsonParse(text, fallback = {}) {
  try {
    return text ? JSON.parse(text) : fallback
  } catch (error) {
    console.error('Invalid JSON from API:', text, error)
    return fallback
  }
}

async function safeParseResponse(response, fallback = {}) {
  const text = await response.text()
  const data = safeJsonParse(text, fallback)

  if (!text) {
    if (!response.ok) {
      throw new Error('AI failed, try again')
    }

    return fallback
  }

  if (!response.ok) {
    throw new Error(data?.error || 'AI failed, try again')
  }

  return data
}

export async function generateMedicationInsights(payload) {
  try {
    const response = await fetchWithTimeout('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await safeParseResponse(response, { insights: '' })

    return {
      insights: typeof data.insights === 'string' ? data.insights : '',
      fallback: Boolean(data.fallback),
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI failed, try again', { cause: error })
    }

    throw new Error(error.message || 'AI failed, try again', { cause: error })
  }
}

export async function scanPrescription({ data, mimeType }) {
  try {
    const response = await fetchWithTimeout('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'prescription-scan',
        file: {
          data,
          mimeType,
        },
      }),
    })

    const result = await safeParseResponse(response, { medications: [] })

    return Array.isArray(result.medications) ? result.medications : []
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI failed, try again', { cause: error })
    }

    throw new Error(error.message || 'AI failed, try again', { cause: error })
  }
}
