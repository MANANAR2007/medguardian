import pdf from 'pdf-parse'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

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

function extractJsonObject(rawText, fallback = {}) {
  const cleaned = stripMarkdown(rawText)

  if (!cleaned) {
    return fallback
  }

  const directParsed = safeJsonParse(cleaned, null)

  if (directParsed && typeof directParsed === 'object' && !Array.isArray(directParsed)) {
    return directParsed
  }

  const objectMatch = cleaned.match(/\{[\s\S]*\}/)

  if (!objectMatch?.[0]) {
    console.error('No JSON object found in Gemini output:', cleaned)
    return fallback
  }

  const extractedParsed = safeJsonParse(objectMatch[0], fallback)
  return extractedParsed && typeof extractedParsed === 'object' && !Array.isArray(extractedParsed)
    ? extractedParsed
    : fallback
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : []
}

function normalizeReportTests(tests) {
  return (Array.isArray(tests) ? tests : [])
    .map((test) => {
      const status = String(test?.status || 'Unknown').trim()
      const numericValue =
        typeof test?.numericValue === 'number'
          ? test.numericValue
          : Number.parseFloat(String(test?.value || '').replace(/[^0-9.-]/g, ''))

      return {
        test: String(test?.test || '').trim(),
        value: String(test?.value || '').trim(),
        numericValue: Number.isFinite(numericValue) ? numericValue : null,
        unit: String(test?.unit || '').trim(),
        referenceRange: String(test?.referenceRange || '').trim(),
        status: ['Low', 'Normal', 'High', 'Unknown'].includes(status) ? status : 'Unknown',
      }
    })
    .filter((test) => test.test || test.value || test.referenceRange)
}

function normalizeMedications(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      name: String(item?.name || '').trim(),
      dosage: String(item?.dosage || '').trim(),
      frequency: String(item?.frequency || '').trim(),
      purpose: String(item?.purpose || '').trim(),
      explanation: String(item?.explanation || '').trim(),
    }))
    .filter((item) => item.name || item.dosage || item.frequency || item.purpose)
}

function normalizeHealthCard(card) {
  const score = Number(card?.healthScore)

  return {
    healthScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null,
    keyFindings: normalizeStringArray(card?.keyFindings),
    areasOfConcern: normalizeStringArray(card?.areasOfConcern),
    positiveIndicators: normalizeStringArray(card?.positiveIndicators),
    recommendedFollowUps: normalizeStringArray(card?.recommendedFollowUps),
  }
}

function normalizeDoctorSummary(summary) {
  return {
    headline: String(summary?.headline || '').trim(),
    summary: String(summary?.summary || '').trim(),
    importantAbnormalities: normalizeStringArray(summary?.importantAbnormalities),
    trends: normalizeStringArray(summary?.trends),
    medicationChanges: normalizeStringArray(summary?.medicationChanges),
    recommendedFollowUps: normalizeStringArray(summary?.recommendedFollowUps),
  }
}

function normalizeTestExplanation(explanation, fallback) {
  return {
    testName: String(explanation?.testName || fallback.testName || '').trim(),
    whatItMeasures: String(explanation?.whatItMeasures || fallback.whatItMeasures || '').trim(),
    normalRange: String(explanation?.normalRange || fallback.normalRange || '').trim(),
    userValue: String(explanation?.userValue || fallback.userValue || '').trim(),
    whyItMatters: String(explanation?.whyItMatters || fallback.whyItMatters || '').trim(),
    interpretation: String(explanation?.interpretation || fallback.interpretation || '').trim(),
  }
}

function normalizeReportAnalysis(payload) {
  return {
    reportTitle: String(payload?.reportTitle || '').trim(),
    reportDate: String(payload?.reportDate || '').trim(),
    reportType: String(payload?.reportType || '').trim(),
    tests: normalizeReportTests(payload?.tests),
    medications: normalizeMedications(payload?.medications),
    healthCard: normalizeHealthCard(payload?.healthCard),
    doctorSummary: normalizeDoctorSummary(payload?.doctorSummary),
    extractedNarrative: String(payload?.extractedNarrative || '').trim(),
  }
}

function truncateText(text, maxLength = 120000) {
  const normalized = String(text || '').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return normalized.slice(0, maxLength)
}

async function fetchPdfText(fileUrl) {
  const response = await fetch(fileUrl)

  if (!response.ok) {
    throw new Error('Unable to download the uploaded PDF for analysis.')
  }

  const arrayBuffer = await response.arrayBuffer()
  const pdfData = await pdf(Buffer.from(arrayBuffer))
  return truncateText(pdfData.text)
}

function createDocumentAnalysisPrompt(category, familyMemberName) {
  return `You are analyzing a family health document for ${familyMemberName || 'a family member'}.

Return ONLY valid JSON.
NO markdown.
NO code fences.
NO explanation outside JSON.

Return exactly this object shape:
{
  "reportTitle": "",
  "reportDate": "",
  "reportType": "",
  "tests": [
    {
      "test": "",
      "value": "",
      "numericValue": null,
      "unit": "",
      "referenceRange": "",
      "status": "Low"
    }
  ],
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "purpose": "",
      "explanation": ""
    }
  ],
  "healthCard": {
    "healthScore": 0,
    "keyFindings": [],
    "areasOfConcern": [],
    "positiveIndicators": [],
    "recommendedFollowUps": []
  },
  "doctorSummary": {
    "headline": "",
    "summary": "",
    "importantAbnormalities": [],
    "trends": [],
    "medicationChanges": [],
    "recommendedFollowUps": []
  },
  "extractedNarrative": ""
}

Rules:
- Document category: ${category}.
- Preserve the original medical values exactly in "value".
- If a value is numeric, also include numericValue as a number. Otherwise use null.
- Always include user value, reference range, and status when a lab test is present.
- Status must be one of: Low, Normal, High, Unknown.
- If the document is a prescription, focus on medications and keep tests as [].
- If the document is a doctor note, extract findings, advice, medications, and follow-ups.
- If something is unknown, use "" or [].
- Never invent lab values.
- Keep key findings and follow-ups short and patient-friendly.
- If unsure, return an empty but valid object with empty strings, empty arrays, and null values.`
}

function createDocumentTextPrompt({ category, familyMemberName, extractedText, fileName }) {
  return `${createDocumentAnalysisPrompt(category, familyMemberName)}

Document file name: ${fileName || 'Unknown file'}

Extracted document text:
${truncateText(extractedText, 100000) || 'No extracted text available.'}`
}

function createTestExplanationPrompt(test) {
  return `Explain this medical test in patient-friendly language.

Return ONLY valid JSON.
NO markdown.
NO code fences.
NO explanation outside JSON.

Return exactly:
{
  "testName": "",
  "whatItMeasures": "",
  "normalRange": "",
  "userValue": "",
  "whyItMatters": "",
  "interpretation": ""
}

Test details:
- Test: ${String(test?.test || '').trim()}
- User value: ${String(test?.value || '').trim()} ${String(test?.unit || '').trim()}
- Normal range: ${String(test?.referenceRange || '').trim()}
- Status: ${String(test?.status || '').trim()}

Rules:
- Keep the explanation simple and specific to the test.
- Mention the user value and normal range.
- Do not hide the medical numbers.
- Do not diagnose.
- If the value appears abnormal, explain that clearly but calmly.
- If unsure, return a valid JSON object with short generic explanations.`
}

function createDoctorSummaryPrompt(familyMemberName, reports) {
  const reportLines = reports
    .slice(0, 8)
    .map((report) => {
      const tests = (report.tests || [])
        .slice(0, 6)
        .map((test) => `${test.test}: ${test.value} ${test.unit || ''} (${test.status || 'Unknown'})`)
        .join('; ')
      const medications = (report.medications || [])
        .slice(0, 4)
        .map((medication) => `${medication.name} ${medication.dosage} ${medication.frequency}`)
        .join('; ')

      return `- ${report.reportTitle || report.fileName || 'Report'} | ${report.reportDate || 'Unknown date'} | Tests: ${tests || 'None'} | Medications: ${medications || 'None'}`
    })
    .join('\n')

  return `Create a concise clinical summary for ${familyMemberName || 'this family member'}.

Return ONLY valid JSON.
NO markdown.
NO code fences.
NO explanation outside JSON.

Return exactly:
{
  "headline": "",
  "summary": "",
  "importantAbnormalities": [],
  "trends": [],
  "medicationChanges": [],
  "recommendedFollowUps": []
}

Rules:
- Focus on important abnormalities, trends, and medication changes.
- Keep the summary concise and clinically useful.
- Do not invent values.
- Use the supplied report facts only.
- If trends are unclear, say so briefly.
- If unsure, return a valid empty JSON object.

Reports:
${reportLines || '- No reports provided'}`
}

function createFallbackReportAnalysis(category, fileName) {
  return {
    reportTitle: fileName || 'Uploaded document',
    reportDate: '',
    reportType: category,
    tests: [],
    medications: [],
    healthCard: {
      healthScore: null,
      keyFindings: ['This document was stored, but the AI could not confidently extract structured medical findings.'],
      areasOfConcern: [],
      positiveIndicators: [],
      recommendedFollowUps: ['Review the uploaded document manually and re-upload a clearer copy if needed.'],
    },
    doctorSummary: {
      headline: 'Limited extraction available',
      summary: 'The original medical document remains the source of truth because AI extraction was limited.',
      importantAbnormalities: [],
      trends: [],
      medicationChanges: [],
      recommendedFollowUps: ['Confirm key values directly from the original report.'],
    },
    extractedNarrative: '',
  }
}

function createFallbackTestExplanation(test) {
  return {
    testName: String(test?.test || '').trim(),
    whatItMeasures: 'This test measures an important part of your health and should be read with the full report context.',
    normalRange: String(test?.referenceRange || '').trim(),
    userValue: [String(test?.value || '').trim(), String(test?.unit || '').trim()].filter(Boolean).join(' '),
    whyItMatters: 'Doctors use this result together with symptoms, history, and other tests.',
    interpretation: `${String(test?.status || 'Unknown').trim() || 'Unknown'} result. Review this value with a clinician for personal guidance.`,
  }
}

function createFallbackDoctorSummary(familyMemberName, reports) {
  const abnormalTests = reports.flatMap((report) =>
    (report.tests || []).filter((test) => ['high', 'low'].includes(String(test.status || '').toLowerCase())),
  )

  return {
    headline: familyMemberName ? `Clinical summary for ${familyMemberName}` : 'Clinical summary',
    summary: 'This summary is based on available structured report data and should be reviewed alongside the original records.',
    importantAbnormalities: abnormalTests.slice(0, 5).map((test) => `${test.test}: ${test.value} ${test.unit || ''} (${test.status})`.trim()),
    trends: [],
    medicationChanges: [],
    recommendedFollowUps: ['Review abnormal values and trends against the original documents before clinical decisions.'],
  }
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
        text: '',
        raw: rawBody,
        error: data?.error?.message || 'Gemini request failed',
      }
    }

    const text = extractGeminiText(data)
    console.log('Gemini raw output:', text || rawBody || '[empty]')

    return {
      ok: true,
      text,
      raw: rawBody,
      error: '',
    }
  } catch (error) {
    console.error('Gemini fetch failed:', error)
    return {
      ok: false,
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

  const mode = String(req.body?.mode || '').trim()

  if (mode === 'analyze-health-document') {
    const fileData = String(req.body?.file?.data || '').trim()
    const fileUrl = String(req.body?.file?.url || '').trim()
    const mimeType = String(req.body?.file?.mimeType || '').trim()
    const fileName = String(req.body?.file?.name || '').trim()
    const category = String(req.body?.category || 'general-report').trim()
    const familyMemberName = String(req.body?.familyMemberName || '').trim()
    const extractedText = String(req.body?.extractedText || '').trim()
    const fallback = createFallbackReportAnalysis(category, fileName)

    if (!mimeType) {
      return sendJson(res, 200, fallback)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 22000)

    try {
      const isPdf = mimeType === 'application/pdf'
      const isTextDocument = mimeType.startsWith('text/')
      let geminiResult

      if (isPdf || isTextDocument) {
        const documentText = isPdf
          ? await fetchPdfText(fileUrl)
          : truncateText(extractedText)

        if (!documentText) {
          return sendJson(res, 200, fallback)
        }

        geminiResult = await callGemini(
          [
            {
              text: createDocumentTextPrompt({
                category,
                familyMemberName,
                extractedText: documentText,
                fileName,
              }),
            },
          ],
          {
            temperature: 0.1,
            maxOutputTokens: 1400,
          },
          controller.signal,
        )
      } else {
        if (!fileData) {
          return sendJson(res, 200, fallback)
        }

        geminiResult = await callGemini(
          [
            { text: createDocumentAnalysisPrompt(category, familyMemberName) },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileData,
              },
            },
          ],
          {
            temperature: 0.1,
            maxOutputTokens: 1400,
          },
          controller.signal,
        )
      }

      if (!geminiResult.ok || !geminiResult.text) {
        console.error('Health document analysis returned no usable Gemini output:', geminiResult.error)
        return sendJson(res, 200, fallback)
      }

      const result = normalizeReportAnalysis(extractJsonObject(geminiResult.text, fallback))
      return sendJson(res, 200, result)
    } catch (error) {
      console.error('Health document analysis handler failed:', error)
      return sendJson(res, 200, fallback)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (mode === 'explain-report-test') {
    const test = req.body?.test && typeof req.body.test === 'object' ? req.body.test : {}
    const fallback = createFallbackTestExplanation(test)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const geminiResult = await callGemini(
        [{ text: createTestExplanationPrompt(test) }],
        {
          temperature: 0.2,
          maxOutputTokens: 350,
        },
        controller.signal,
      )

      if (!geminiResult.ok || !geminiResult.text) {
        console.error('Explain report test returned no usable Gemini output:', geminiResult.error)
        return sendJson(res, 200, fallback)
      }

      const result = normalizeTestExplanation(extractJsonObject(geminiResult.text, fallback), fallback)
      return sendJson(res, 200, result)
    } catch (error) {
      console.error('Explain report test handler failed:', error)
      return sendJson(res, 200, fallback)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (mode === 'generate-doctor-summary') {
    const familyMemberName = String(req.body?.familyMemberName || '').trim()
    const reports = Array.isArray(req.body?.reports) ? req.body.reports : []
    const fallback = createFallbackDoctorSummary(familyMemberName, reports)

    if (reports.length === 0) {
      return sendJson(res, 200, fallback)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000)

    try {
      const geminiResult = await callGemini(
        [{ text: createDoctorSummaryPrompt(familyMemberName, reports) }],
        {
          temperature: 0.2,
          maxOutputTokens: 650,
        },
        controller.signal,
      )

      if (!geminiResult.ok || !geminiResult.text) {
        console.error('Doctor summary returned no usable Gemini output:', geminiResult.error)
        return sendJson(res, 200, fallback)
      }

      const result = normalizeDoctorSummary(extractJsonObject(geminiResult.text, fallback))
      return sendJson(res, 200, result)
    } catch (error) {
      console.error('Doctor summary handler failed:', error)
      return sendJson(res, 200, fallback)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return sendJson(res, 400, { error: 'Unsupported Gemini mode' })
}
