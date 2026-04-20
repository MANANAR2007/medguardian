import { createDoseSlotKey, getDateKey, isMedicationScheduledOnDate, startOfDay } from './schedule'

const ADHERENCE_WINDOW_DAYS = 7

export function calculateAdherenceMetrics(medications, logs) {
  if (medications.length === 0) {
    return {
      adherencePercentage: 0,
      totalMissed: 0,
      totalScheduled: 0,
      totalTaken: 0,
      windowDays: ADHERENCE_WINDOW_DAYS,
    }
  }

  const today = startOfDay(new Date())
  const start = new Date(today)
  start.setDate(today.getDate() - (ADHERENCE_WINDOW_DAYS - 1))

  const logMap = logs.reduce((accumulator, log) => {
    accumulator[log.slotKey] = log.status
    return accumulator
  }, {})

  let totalScheduled = 0
  let totalTaken = 0
  let totalMissed = 0
  let streakDays = 0
  let streakBroken = false

  for (let index = 0; index < ADHERENCE_WINDOW_DAYS; index += 1) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + index)
    const dateKey = getDateKey(currentDate)

    medications.forEach((medication) => {
      if (!isMedicationScheduledOnDate(medication, currentDate)) {
        return
      }

      medication.times.forEach((time) => {
        totalScheduled += 1

        const status = logMap[createDoseSlotKey({ medicationId: medication.id, dateKey, time })]

        if (status === 'taken') {
          totalTaken += 1
        }

        if (status === 'missed') {
          totalMissed += 1
        }
      })
    })
  }

  for (let offset = 0; offset < ADHERENCE_WINDOW_DAYS; offset += 1) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() - offset)
    const dayMetrics = calculateDayMetrics(medications, logMap, currentDate)

    if (dayMetrics.totalScheduled === 0) {
      continue
    }

    if (!streakBroken && dayMetrics.totalTaken === dayMetrics.totalScheduled) {
      streakDays += 1
    } else {
      streakBroken = true
    }
  }

  return {
    adherencePercentage: totalScheduled ? Math.round((totalTaken / totalScheduled) * 100) : 0,
    streakDays,
    totalMissed,
    totalScheduled,
    totalTaken,
    windowDays: ADHERENCE_WINDOW_DAYS,
  }
}

function calculateDayMetrics(medications, logMap, date) {
  const dateKey = getDateKey(date)
  let totalScheduled = 0
  let totalTaken = 0
  let totalMissed = 0

  medications.forEach((medication) => {
    if (!isMedicationScheduledOnDate(medication, date)) {
      return
    }

    medication.times.forEach((time) => {
      totalScheduled += 1
      const status = logMap[createDoseSlotKey({ medicationId: medication.id, dateKey, time })]

      if (status === 'taken') {
        totalTaken += 1
      }

      if (status === 'missed') {
        totalMissed += 1
      }
    })
  })

  return {
    dateKey,
    totalMissed,
    totalScheduled,
    totalTaken,
    adherencePercentage: totalScheduled ? Math.round((totalTaken / totalScheduled) * 100) : 0,
  }
}

export function calculateWeeklyTrend(medications, logs) {
  const today = startOfDay(new Date())
  const logMap = logs.reduce((accumulator, log) => {
    accumulator[log.slotKey] = log.status
    return accumulator
  }, {})

  return Array.from({ length: ADHERENCE_WINDOW_DAYS }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (ADHERENCE_WINDOW_DAYS - 1 - index))

    return {
      ...calculateDayMetrics(medications, logMap, date),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
    }
  })
}
