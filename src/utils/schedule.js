function padNumber(value) {
  return String(value).padStart(2, '0')
}

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

export function normalizeTimes(times) {
  return [...new Set(times.map((time) => time.trim()).filter(Boolean))].sort((left, right) => {
    const [leftHours, leftMinutes] = left.split(':').map(Number)
    const [rightHours, rightMinutes] = right.split(':').map(Number)
    return leftHours * 60 + leftMinutes - (rightHours * 60 + rightMinutes)
  })
}

export function formatTimeLabel(time) {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTimeLabel(value) {
  const date = value?.toDate?.() ?? new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Pending sync'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function toDate(value) {
  if (value?.toDate) {
    return value.toDate()
  }

  return value ? new Date(value) : null
}

export function createDoseSlotKey({ medicationId, dateKey, time }) {
  return `${medicationId}_${dateKey}_${time}`
}

export function isMedicationScheduledOnDate(medication, date) {
  const createdAt = toDate(medication.createdAt) ?? new Date()
  const scheduledDate = startOfDay(date)
  const createdDate = startOfDay(createdAt)

  if (scheduledDate < createdDate) {
    return false
  }

  if (medication.frequency === 'weekly') {
    return scheduledDate.getDay() === createdDate.getDay()
  }

  return true
}

export function groupMedicationsByTime(medications) {
  const groups = medications.reduce((accumulator, medication) => {
    medication.times.forEach((time) => {
      if (!accumulator[time]) {
        accumulator[time] = []
      }

      accumulator[time].push(medication)
    })

    return accumulator
  }, {})

  return Object.entries(groups)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([time, items]) => ({
      time,
      label: formatTimeLabel(time),
      items,
    }))
}

export function getDaypartForTime(time) {
  const [hours] = time.split(':').map(Number)

  if (hours < 12) {
    return 'morning'
  }

  if (hours < 17) {
    return 'afternoon'
  }

  return 'evening'
}

export const daypartLabels = {
  morning: {
    label: 'Morning',
    description: 'Before 12 PM',
  },
  afternoon: {
    label: 'Afternoon',
    description: '12 PM to 5 PM',
  },
  evening: {
    label: 'Evening',
    description: 'After 5 PM',
  },
}

export function groupMedicationsByDaypart(medications) {
  const groups = {
    morning: [],
    afternoon: [],
    evening: [],
  }

  medications.forEach((medication) => {
    medication.times.forEach((time) => {
      groups[getDaypartForTime(time)].push({
        medication,
        time,
      })
    })
  })

  return Object.entries(groups)
    .map(([period, items]) => ({
      period,
      ...daypartLabels[period],
      items: items.sort((left, right) => left.time.localeCompare(right.time)),
    }))
    .filter((group) => group.items.length > 0)
}
