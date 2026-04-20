const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const EMPTY_SCAN_RESULT = { medications: [] }

function sendJson(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json')
  return res.status(statusCode).send(JSON.stringify(payload))
}

function safeJsonParse(text, fallback = null) {
  if (!text || !String(text).trim()) {
    return fallback
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Safe JSON parse failed:', error)
    console.error('Raw JSON text:', text)
    return fallback
  }
}

function stripMarkdown(value) {
  return String(value || '')
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .replace(/^json\s*/i, '')
    .trim()
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .filter(Boolean)
      .join('\n')
      .trim() || ''
  )
}

function extractJsonArray(rawText) {
  const cleaned = stripMarkdown(rawText)

  if (!cleaned) {
    return []
  }

  const directParsed = safeJsonParse(cleaned, null)

  if (Array.isArray(directParsed)) {
    return normalizeMedicationArray(directParsed)
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)

  if (!arrayMatch?.[0]) {
    console.error('No JSON array found in Gemini output:', cleaned)
    return []
  }

  const extractedParsed = safeJsonParse(arrayMatch[0], [])
  return Array.isArray(extractedParsed) ? normalizeMedicationArray(extractedParsed) : []
}

function normalizeMedicationArray(items) {
  return items
    .map((item) => ({
      name: String(item?.name || '').trim(),
      dosage: String(item?.dosage || '').trim(),
      frequency: String(item?.frequency || '').trim(),
    }))
    .filter((item) => item.name || item.dosage || item.frequency)
}

function sanitizeMedicationInput(medications) {
  return medications
    .map((medication) => ({
      name: String(medication?.name || '').trim(),
      dosage: String(medication?.dosage || '').trim(),
      frequency: String(medication?.frequency || '').trim(),
    }))
    .filter((medication) => medication.name || medication.dosage || medication.frequency)
}

function createScannerPrompt() {
  return `Extract medication details from this prescription.

Return ONLY valid JSON.
NO markdown.
NO code fences.
NO explanation.
NO surrounding text.

Return exactly this shape:
[
  { "name": "", "dosage": "", "frequency": "" }
]

Rules:
- Include only medication-related text.
- Ignore patient name, doctor name, address, clinic details, dates, and non-medical text.
- If dosage is unclear, use "".
- If frequency is unclear, use "".
- If no medications are confidently found, return [].
- If unsure, return [].`
}

function createInsightsPrompt({ medications, adherence, missedPatterns }) {
  const adherencePercentage = Number(adherence?.adherencePercentage ?? 0)
  const totalScheduled = Number(adherence?.totalScheduled ?? 0)
  const totalTaken = Number(adherence?.totalTaken ?? 0)
  const totalMissed = Number(adherence?.totalMissed ?? 0)

  const medicationLines = medications
    .map((medication) => {
      const details = [medication.name, medication.dosage, medication.frequency].filter(Boolean).join(' ')
      return `- ${details}`
    })
    .join('\n')

  const missedPatternLines =
    missedPatterns.length > 0
      ? missedPatterns.map((pattern) => `- ${String(pattern).trim()}`).join('\n')
      : '- No missed-dose pattern supplied'

  return `You are a concise healthcare medication adherence assistant.

Return EXACTLY this format:

Risk:
* ...

Insight:
* ...

Action:
* ...

Rules:
- Use the medication names in the response.
- Base the insight on adherence percentage and missed-dose patterns.
- Be specific, not generic.
- Keep each bullet under 22 words.
- Do not diagnose.
- If adherence is below 70%, mention elevated adherence risk.
- If missed doses exist, mention the most relevant missed pattern.
- Include one short "not medical advice" phrase in Action.
- Do not add extra sections.

Medication list:
${medicationLines}

Adherence:
- Percentage: ${adherencePercentage}%
- Scheduled doses: ${totalScheduled}
- Taken doses: ${totalTaken}
- Missed doses: ${totalMissed}

Missed patterns:
${missedPatternLines}`
}

function createFallbackInsights({ medications, adherence, missedPatterns }) {
  const names = medications.map((medication) => medication.name).filter(Boolean).join(', ') || 'your medications'
  const adherencePercentage = Number(adherence?.adherencePercentage ?? 0)
  const totalMissed = Number(adherence?.totalMissed ?? 0)
  const missedPattern = missedPatterns?.[0] ? String(missedPatterns[0]) : 'No repeated missed pattern was provided.'
  const risk =
    adherencePercentage < 70
      ? `${names} may need closer tracking because adherence is ${adherencePercentage}%.`
      : `${names} show no obvious AI-detected risk from the provided adherence data.`
  const insight =
    totalMissed > 0
      ? `${missedPattern} This may point to a schedule or reminder gap.`
      : `No missed doses were supplied, so the main pattern is current completion.`

  return `Risk:
* ${risk}

Insight:
* ${insight}

Action:
* Review timing reminders and contact a clinician for concerns; not medical advice.`
}

function extractInsightBullet(text, sectionName) {
  const sectionPattern = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n(?:Risk|Insight|Action):|$)`, 'i')
  const section = text.match(sectionPattern)?.[1] || ''
  const line =
    section
      .split('\n')
      .map((item) => item.trim())
      .find((item) => item.replace(/^[-*]\s*/, '').trim()) || ''

  return line.replace(/^[-*]\s*/, '').trim()
}

function normalizeInsightsText(rawText, fallbackInsights) {
  const cleaned = stripMarkdown(rawText)

  if (!cleaned) {
    return fallbackInsights
  }

  const risk = extractInsightBullet(cleaned, 'Risk')
  const insight = extractInsightBullet(cleaned, 'Insight')
  const action = extractInsightBullet(cleaned, 'Action')

  if (!risk || !insight || !action) {
    console.error('Gemini insights output did not match required structure:', cleaned)
    return fallbackInsights
  }

  return `Risk:
* ${risk}

Insight:
* ${insight}

Action:
* ${action}`
}

async function callGemini(parts, generationConfig = {}, signal) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig,
      }),
      signal,
    })

    const rawBody = await response.text()
    const data = safeJsonParse(rawBody, {})

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        text: '',
        raw: rawBody,
        error: data?.error?.message || 'Gemini request failed',
      }
    }

    const text = extractGeminiText(data)
    console.log('Gemini raw output:', text || rawBody || '[empty]')

    return {
      ok: true,
      status: response.status,
      text,
      raw: rawBody,
      error: '',
    }
  } catch (error) {
    console.error('Gemini fetch failed:', error)
    return {
      ok: false,
      status: error.name === 'AbortError' ? 504 : 500,
      text: '',
      raw: '',
      error: error.name === 'AbortError' ? 'Gemini request timed out' : 'Gemini request failed',
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return sendJson(res, 500, { error: 'Missing GEMINI_API_KEY' })
  }

  if (req.body?.mode === 'prescription-scan') {
    const fileData = String(req.body?.file?.data || '').trim()
    const mimeType = String(req.body?.file?.mimeType || '').trim()

    if (!fileData || !mimeType) {
      return sendJson(res, 200, EMPTY_SCAN_RESULT)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000)

    try {
      const geminiResult = await callGemini(
        [
          { text: createScannerPrompt() },
          {
            inline_data: {
              mime_type: mimeType,
              data: fileData,
            },
          },
        ],
        {
          temperature: 0,
          maxOutputTokens: 450,
        },
        controller.signal,
      )

      if (!geminiResult.ok || !geminiResult.text) {
        console.error('Prescription scan returned no usable Gemini output:', geminiResult.error)
        return sendJson(res, 200, EMPTY_SCAN_RESULT)
      }

      const medications = extractJsonArray(geminiResult.text)
      return sendJson(res, 200, { medications })
    } catch (error) {
      console.error('Prescription scan handler failed:', error)
      return sendJson(res, 200, EMPTY_SCAN_RESULT)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const medications = sanitizeMedicationInput(Array.isArray(req.body?.medications) ? req.body.medications : [])

  if (medications.length === 0) {
    return sendJson(res, 400, { error: 'No medications provided', insights: '' })
  }

  const adherence = req.body?.adherence && typeof req.body.adherence === 'object' ? req.body.adherence : {}
  const missedPatterns = Array.isArray(req.body?.missedPatterns) ? req.body.missedPatterns : []
  const fallbackInsights = createFallbackInsights({ medications, adherence, missedPatterns })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const geminiResult = await callGemini(
      [
        {
          text: createInsightsPrompt({
            medications,
            adherence,
            missedPatterns,
          }),
        },
      ],
      {
        temperature: 0.25,
        maxOutputTokens: 260,
      },
      controller.signal,
    )

    const insights = normalizeInsightsText(geminiResult.text, fallbackInsights)
    return sendJson(res, 200, {
      insights,
      fallback: insights === fallbackInsights,
    })
  } catch (error) {
    console.error('Insights handler failed:', error)
    return sendJson(res, 200, {
      insights: fallbackInsights,
      fallback: true,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}
