function fetchWithTimeout(url, options = {}, timeout = 20000) {
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

async function postGemini(payload, fallback) {
  try {
    const response = await fetchWithTimeout('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return await safeParseResponse(response, fallback)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI failed, try again', { cause: error })
    }

    throw new Error(error.message || 'AI failed, try again', { cause: error })
  }
}

export async function analyzeHealthDocument({ fileData, mimeType, fileName, category, familyMemberName }) {
  return postGemini(
    {
      mode: 'analyze-health-document',
      category,
      familyMemberName,
      file: {
        data: fileData,
        mimeType,
        name: fileName,
      },
    },
    {
      reportTitle: fileName || 'Uploaded document',
      reportDate: '',
      reportType: category,
      tests: [],
      medications: [],
      healthCard: null,
      doctorSummary: null,
      extractedNarrative: '',
    },
  )
}

export async function explainHealthTest(test) {
  return postGemini(
    {
      mode: 'explain-report-test',
      test,
    },
    {
      testName: test.test || '',
      whatItMeasures: '',
      normalRange: test.referenceRange || '',
      userValue: `${test.value || ''}${test.unit ? ` ${test.unit}` : ''}`.trim(),
      whyItMatters: '',
      interpretation: '',
    },
  )
}

export async function generateDoctorSummary({ familyMemberName, reports }) {
  return postGemini(
    {
      mode: 'generate-doctor-summary',
      familyMemberName,
      reports,
    },
    {
      headline: '',
      summary: '',
      importantAbnormalities: [],
      trends: [],
      medicationChanges: [],
      recommendedFollowUps: [],
    },
  )
}
