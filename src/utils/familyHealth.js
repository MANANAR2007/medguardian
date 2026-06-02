function toDate(value) {
  if (value?.toDate) {
    return value.toDate()
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function formatDisplayDate(value) {
  const date = toDate(value)

  if (!date) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getReportStatusTone(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'high') {
    return 'danger'
  }

  if (normalizedStatus === 'low') {
    return 'warning'
  }

  if (normalizedStatus === 'normal') {
    return 'success'
  }

  return 'default'
}

export function getStatusBadgeClasses(status) {
  const tone = getReportStatusTone(status)

  if (tone === 'danger') {
    return 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900'
  }

  if (tone === 'warning') {
    return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900'
  }

  if (tone === 'success') {
    return 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900'
  }

  return 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
}

export function buildHealthAlerts(reports) {
  return reports
    .flatMap((report) =>
      (report.tests || [])
        .filter((test) => ['high', 'low'].includes(String(test.status || '').toLowerCase()))
        .map((test) => ({
          id: `${report.id}-${test.test}`,
          title: `${test.test} is ${test.status}`,
          description: `${report.familyMemberName || 'Family member'}: ${test.value || 'Unknown value'} ${test.unit || ''} against ${test.referenceRange || 'no reference range'}`.trim(),
        })),
    )
    .slice(0, 6)
}

export function buildFollowUps(reports) {
  return reports
    .flatMap((report) => report.healthCard?.recommendedFollowUps || [])
    .filter(Boolean)
    .slice(0, 6)
}

export function buildKeyFindings(reports) {
  return reports
    .flatMap((report) => report.healthCard?.keyFindings || [])
    .filter(Boolean)
    .slice(0, 6)
}

export function buildTimelineMap(reports) {
  const map = new Map()

  reports.forEach((report) => {
    const reportDate = report.reportDate || report.uploadedAt
    const label = formatDisplayDate(reportDate)

    ;(report.tests || []).forEach((test) => {
      const key = String(test.test || '').trim()

      if (!key) {
        return
      }

      const numericValue =
        typeof test.numericValue === 'number'
          ? test.numericValue
          : Number.parseFloat(String(test.value || '').replace(/[^0-9.-]/g, ''))

      if (Number.isNaN(numericValue)) {
        return
      }

      const current = map.get(key) || []
      current.push({
        reportId: report.id,
        label,
        date: toDate(reportDate),
        value: numericValue,
        rawValue: test.value,
        unit: test.unit,
        status: test.status,
      })
      map.set(key, current)
    })
  })

  return new Map(
    [...map.entries()].map(([key, values]) => [
      key,
      values.sort((left, right) => (left.date?.getTime?.() || 0) - (right.date?.getTime?.() || 0)),
    ]),
  )
}

export function buildTrendNarrative(points) {
  if (!points || points.length < 2) {
    return 'More reports are needed before a trend can be described.'
  }

  const first = points[0]
  const last = points[points.length - 1]

  if (last.value > first.value) {
    return `This value has increased from ${first.rawValue}${first.unit ? ` ${first.unit}` : ''} to ${last.rawValue}${last.unit ? ` ${last.unit}` : ''}.`
  }

  if (last.value < first.value) {
    return `This value has decreased from ${first.rawValue}${first.unit ? ` ${first.unit}` : ''} to ${last.rawValue}${last.unit ? ` ${last.unit}` : ''}.`
  }

  return `This value has remained stable around ${last.rawValue}${last.unit ? ` ${last.unit}` : ''}.`
}

export function getLatestHealthScore(report) {
  const value = Number(report?.healthCard?.healthScore)
  return Number.isFinite(value) ? value : null
}
