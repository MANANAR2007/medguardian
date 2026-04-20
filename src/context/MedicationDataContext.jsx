import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import {
  addMedicationRecord,
  createMedicationLog,
  deleteMedicationRecord,
  fetchLogs,
  fetchMedications,
  updateMedicationRecord,
} from '../services/medications'
import { addHealthNote, fetchHealthNotes } from '../services/healthNotes'
import { getUserProfile } from '../services/auth'
import { calculateAdherenceMetrics, calculateWeeklyTrend } from '../utils/adherence'
import { checkMedicationInteractions } from '../utils/interactions'
import {
  createDoseSlotKey,
  getDateKey,
  isMedicationScheduledOnDate,
  normalizeTimes,
} from '../utils/schedule'
import { MedicationDataContext } from './medication-data-context'

const initialState = {
  medications: [],
  logs: [],
  notes: [],
  dataLoading: true,
  dataError: '',
  medicationsReady: false,
  logsReady: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'idle':
      return {
        ...initialState,
        dataLoading: false,
      }
    case 'loading':
      return {
        ...initialState,
        dataLoading: true,
      }
    case 'medicationsLoaded': {
      const pendingLocalItems = state.medications.filter(
        (medication) => medication._optimistic || medication._saving || medication._saved,
      )
      const serverIds = new Set(action.payload.map((medication) => medication.id))
      const mergedMedications = [
        ...pendingLocalItems.filter((medication) => !serverIds.has(medication.id)),
        ...action.payload.map((medication) => {
          const pendingMatch = pendingLocalItems.find((item) => item.id === medication.id)
          return pendingMatch?._saving ? pendingMatch : medication
        }),
      ]

      const nextState = {
        ...state,
        medications: mergedMedications,
        medicationsReady: true,
      }

      return {
        ...nextState,
        dataLoading: !nextState.medicationsReady || !nextState.logsReady,
      }
    }
    case 'logsLoaded': {
      const nextState = {
        ...state,
        logs: action.payload,
        logsReady: true,
      }

      return {
        ...nextState,
        dataLoading: !nextState.medicationsReady || !nextState.logsReady,
      }
    }
    case 'notesLoaded':
      return {
        ...state,
        notes: action.payload,
      }
    case 'addMedicationOptimistic':
      return {
        ...state,
        medications: [action.payload, ...state.medications],
      }
    case 'replaceMedicationTempId':
      return {
        ...state,
        medications: state.medications.map((medication) =>
          medication.id === action.payload.tempId
            ? {
                ...medication,
                id: action.payload.realId,
                _optimistic: false,
                _saving: false,
                _saved: true,
              }
            : medication,
        ),
      }
    case 'updateMedicationOptimistic':
      return {
        ...state,
        medications: state.medications.map((medication) =>
          medication.id === action.payload.id
            ? {
                ...medication,
                ...action.payload.updates,
                _saving: true,
                _saved: false,
              }
            : medication,
        ),
      }
    case 'confirmMedicationSaved':
      return {
        ...state,
        medications: state.medications.map((medication) =>
          medication.id === action.payload
            ? {
                ...medication,
                _optimistic: false,
                _saving: false,
                _saved: true,
              }
            : medication,
        ),
      }
    case 'rollbackMedicationAdd':
      return {
        ...state,
        medications: state.medications.filter((medication) => medication.id !== action.payload),
      }
    case 'rollbackMedicationUpdate':
      return {
        ...state,
        medications: state.medications.map((medication) =>
          medication.id === action.payload.id ? action.payload.previousMedication : medication,
        ),
      }
    case 'error':
      return {
        ...state,
        dataError: action.payload,
      }
    default:
      return state
  }
}

export function MedicationDataProvider({ children }) {
  const { authLoading, currentUser, userProfile } = useAuth()
  const { showToast } = useToast()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [linkedPatientProfileState, setLinkedPatientProfileState] = useState(null)

  const role = userProfile?.role ?? 'patient'
  const currentUserId = currentUser?.uid ?? null
  const linkedPatientId = userProfile?.linkedPatientId ?? null
  const profileUid = userProfile?.uid ?? null
  const hasCurrentUser = Boolean(currentUserId)
  const hasUserProfile = Boolean(profileUid)
  const accessUserId = role === 'caregiver' ? linkedPatientId : currentUserId
  const linkedPatientProfile = role === 'caregiver' ? linkedPatientProfileState : null
  const medications = useMemo(() => (accessUserId ? state.medications : []), [accessUserId, state.medications])
  const logs = useMemo(() => (accessUserId ? state.logs : []), [accessUserId, state.logs])
  const notes = useMemo(() => (accessUserId ? state.notes : []), [accessUserId, state.notes])
  const dataLoading = authLoading ? true : accessUserId ? state.dataLoading : false
  const dataError = accessUserId ? state.dataError : ''

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (role !== 'caregiver' || !linkedPatientId) {
      return
    }

    let isMounted = true

    async function loadLinkedPatient() {
      try {
        const profile = await getUserProfile(linkedPatientId)

        if (isMounted) {
          setLinkedPatientProfileState(profile)
        }
      } catch {
        if (isMounted) {
          setLinkedPatientProfileState(null)
        }
      }
    }

    loadLinkedPatient()

    return () => {
      isMounted = false
    }
  }, [authLoading, linkedPatientId, role])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!hasCurrentUser || !hasUserProfile) {
      dispatch({ type: 'idle' })
      return
    }

    if (!accessUserId) {
      dispatch({ type: 'idle' })
      return
    }

    dispatch({ type: 'loading' })

    let isMounted = true

    async function loadMedicationData() {
      try {
        const [medicationItems, logItems, noteItems] = await Promise.all([
          fetchMedications(accessUserId),
          fetchLogs(accessUserId),
          fetchHealthNotes(accessUserId),
        ])

        if (!isMounted) {
          return
        }

        dispatch({ type: 'medicationsLoaded', payload: medicationItems })
        dispatch({ type: 'logsLoaded', payload: logItems })
        dispatch({ type: 'notesLoaded', payload: noteItems })
      } catch {
        if (!isMounted) {
          return
        }

        dispatch({ type: 'error', payload: 'Unable to load medications right now.' })
        dispatch({ type: 'medicationsLoaded', payload: [] })
        dispatch({ type: 'logsLoaded', payload: [] })
        dispatch({ type: 'notesLoaded', payload: [] })
      }
    }

    loadMedicationData()

    return () => {
      isMounted = false
    }
  }, [accessUserId, authLoading, hasCurrentUser, hasUserProfile])

  const medicationsById = useMemo(
    () =>
      medications.reduce((accumulator, medication) => {
        accumulator[medication.id] = medication
        return accumulator
      }, {}),
    [medications],
  )

  const interactionResults = useMemo(() => checkMedicationInteractions(medications), [medications])
  const adherence = useMemo(() => calculateAdherenceMetrics(medications, logs), [medications, logs])
  const weeklyTrend = useMemo(() => calculateWeeklyTrend(medications, logs), [medications, logs])

  const todayStatusMap = useMemo(() => {
    const todayKey = getDateKey()

    return logs.reduce((accumulator, log) => {
      if (log.scheduledDate === todayKey) {
        accumulator[log.slotKey] = log.status
      }

      return accumulator
    }, {})
  }, [logs])

  const addMedication = useCallback(async (input) => {
    if (!accessUserId || role === 'caregiver') {
      throw new Error('Only patients can manage medications.')
    }

    const normalizedTimes = normalizeTimes(input.times)

    if (!input.name?.trim() || !input.dosage?.trim() || normalizedTimes.length === 0) {
      throw new Error('Medication name, dosage, and at least one time are required.')
    }

    const normalizedMedication = {
      userId: accessUserId,
      name: input.name.trim(),
      dosage: input.dosage.trim(),
      times: normalizedTimes,
      frequency: input.frequency,
    }
    const tempId = `temp-${crypto.randomUUID()}`

    dispatch({
      type: 'addMedicationOptimistic',
      payload: {
        id: tempId,
        ...normalizedMedication,
        createdAt: new Date(),
        _optimistic: true,
        _saving: true,
      },
    })

    try {
      const realId = await addMedicationRecord(normalizedMedication)
      dispatch({ type: 'replaceMedicationTempId', payload: { tempId, realId } })
      showToast('Medication saved ✓', 'success')
      return realId
    } catch (error) {
      console.error(error)
      dispatch({ type: 'rollbackMedicationAdd', payload: tempId })
      showToast(error.message || 'Medication could not be saved.', 'error')
      throw error
    }
  }, [accessUserId, role, showToast])

  const updateMedication = useCallback(async (medicationId, input) => {
    if (!accessUserId || role === 'caregiver') {
      throw new Error('Only patients can manage medications.')
    }

    const previousMedication = medications.find((medication) => medication.id === medicationId)
    const normalizedTimes = normalizeTimes(input.times)

    if (!input.name?.trim() || !input.dosage?.trim() || normalizedTimes.length === 0) {
      throw new Error('Medication name, dosage, and at least one time are required.')
    }

    const updates = {
      name: input.name.trim(),
      dosage: input.dosage.trim(),
      times: normalizedTimes,
      frequency: input.frequency,
    }

    console.log('Saving medication:', { id: medicationId, ...updates })

    dispatch({ type: 'updateMedicationOptimistic', payload: { id: medicationId, updates } })

    try {
      await updateMedicationRecord(medicationId, updates)
      console.log('Saved successfully')
      dispatch({ type: 'confirmMedicationSaved', payload: medicationId })
      showToast('Medication updated ✓', 'success')
    } catch (error) {
      console.error(error)
      if (previousMedication) {
        dispatch({ type: 'rollbackMedicationUpdate', payload: { id: medicationId, previousMedication } })
      }
      showToast(error.message || 'Medication update failed.', 'error')
      throw error
    }
  }, [accessUserId, medications, role, showToast])

  const deleteMedication = useCallback(async (medicationId) => {
    if (!accessUserId || role === 'caregiver') {
      throw new Error('Only patients can manage medications.')
    }

    await deleteMedicationRecord(medicationId)
  }, [accessUserId, role])

  const logDose = useCallback(async ({ medicationId, scheduledTime, status }) => {
    if (!accessUserId || role === 'caregiver') {
      throw new Error('Only patients can log doses.')
    }

    const scheduledDate = getDateKey()
    const slotKey = createDoseSlotKey({ medicationId, dateKey: scheduledDate, time: scheduledTime })

    await createMedicationLog({
      userId: accessUserId,
      medicationId,
      status,
      scheduledDate,
      scheduledTime,
      slotKey,
    })
  }, [accessUserId, role])

  const addNote = useCallback(async (note) => {
    if (!accessUserId || role === 'caregiver') {
      throw new Error('Only patients can add health notes.')
    }

    await addHealthNote({
      userId: accessUserId,
      note,
    })
  }, [accessUserId, role])

  const value = {
    accessUserId,
    accessProfile: role === 'caregiver' ? linkedPatientProfile : userProfile,
    adherence,
    dataError,
    dataLoading,
    deleteMedication,
    interactionWarnings: interactionResults.warnings,
    isCaregiverView: role === 'caregiver',
    linkedPatientProfile,
    logDose,
    logs,
    medications,
    medicationsById,
    todayStatusMap,
    updateMedication,
    addMedication,
    addNote,
    weeklyTrend,
    notes,
    warningsByMedicationId: interactionResults.byMedicationId,
    isDoseDueToday: (medication) => isMedicationScheduledOnDate(medication, new Date()),
  }

  return <MedicationDataContext.Provider value={value}>{children}</MedicationDataContext.Provider>
}
