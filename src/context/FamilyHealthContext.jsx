import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import {
  createFamilyMemberRecord,
  createHealthReportRecord,
  deleteFamilyMemberRecord,
  deleteHealthReportRecord,
  fetchFamilyMembers,
  fetchHealthReports,
  updateFamilyMemberRecord,
} from '../services/familyHealth'
import { analyzeHealthDocument } from '../services/gemini'
import {
  buildFollowUps,
  buildHealthAlerts,
  buildKeyFindings,
  buildTimelineMap,
  getLatestHealthScore,
} from '../utils/familyHealth'
import { FamilyHealthContext } from './family-health-context'

const initialState = {
  familyMembers: [],
  reports: [],
  activeFamilyMemberId: '',
  dataLoading: true,
  dataError: '',
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
        ...state,
        dataLoading: true,
        dataError: '',
      }
    case 'dataLoaded': {
      const nextActiveId =
        state.activeFamilyMemberId && action.payload.familyMembers.some((member) => member.id === state.activeFamilyMemberId)
          ? state.activeFamilyMemberId
          : action.payload.familyMembers[0]?.id || ''

      return {
        familyMembers: action.payload.familyMembers,
        reports: action.payload.reports,
        activeFamilyMemberId: nextActiveId,
        dataLoading: false,
        dataError: '',
      }
    }
    case 'error':
      return {
        ...state,
        dataLoading: false,
        dataError: action.payload,
      }
    case 'setActiveFamilyMember':
      return {
        ...state,
        activeFamilyMemberId: action.payload,
      }
    case 'familyMemberCreated':
      return {
        ...state,
        familyMembers: [action.payload, ...state.familyMembers],
        activeFamilyMemberId: state.activeFamilyMemberId || action.payload.id,
      }
    case 'familyMemberUpdated':
      return {
        ...state,
        familyMembers: state.familyMembers.map((member) =>
          member.id === action.payload.id ? { ...member, ...action.payload } : member,
        ),
      }
    case 'familyMemberDeleted': {
      const nextMembers = state.familyMembers.filter((member) => member.id !== action.payload)
      const nextReports = state.reports.filter((report) => report.familyMemberId !== action.payload)

      return {
        ...state,
        familyMembers: nextMembers,
        reports: nextReports,
        activeFamilyMemberId:
          state.activeFamilyMemberId === action.payload ? nextMembers[0]?.id || '' : state.activeFamilyMemberId,
      }
    }
    case 'reportCreated':
      return {
        ...state,
        reports: [action.payload, ...state.reports],
      }
    case 'reportDeleted':
      return {
        ...state,
        reports: state.reports.filter((report) => report.id !== action.payload),
      }
    default:
      return state
  }
}

export function FamilyHealthProvider({ children }) {
  const { authLoading, currentUser, userProfile } = useAuth()
  const { showToast } = useToast()
  const [state, dispatch] = useReducer(reducer, initialState)

  const accountId = currentUser?.uid ?? ''
  const hasProfile = Boolean(userProfile?.role)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!accountId || !hasProfile) {
      dispatch({ type: 'idle' })
      return
    }

    let isMounted = true
    dispatch({ type: 'loading' })

    async function loadFamilyHealthData() {
      try {
        const [familyMembers, reports] = await Promise.all([
          fetchFamilyMembers(accountId),
          fetchHealthReports(accountId),
        ])

        if (!isMounted) {
          return
        }

        dispatch({
          type: 'dataLoaded',
          payload: {
            familyMembers,
            reports,
          },
        })
      } catch (error) {
        console.error(error)

        if (!isMounted) {
          return
        }

        dispatch({ type: 'error', payload: 'Unable to load family health records right now.' })
      }
    }

    loadFamilyHealthData()

    return () => {
      isMounted = false
    }
  }, [accountId, authLoading, hasProfile])

  const activeFamilyMember = useMemo(
    () => state.familyMembers.find((member) => member.id === state.activeFamilyMemberId) || null,
    [state.activeFamilyMemberId, state.familyMembers],
  )

  const reportsForActiveMember = useMemo(
    () =>
      activeFamilyMember
        ? state.reports.filter((report) => report.familyMemberId === activeFamilyMember.id)
        : [],
    [activeFamilyMember, state.reports],
  )

  const timelineMap = useMemo(() => buildTimelineMap(reportsForActiveMember), [reportsForActiveMember])
  const availableTimelineTests = useMemo(() => [...timelineMap.keys()], [timelineMap])
  const recentReports = useMemo(() => reportsForActiveMember.slice(0, 5), [reportsForActiveMember])
  const healthAlerts = useMemo(() => buildHealthAlerts(reportsForActiveMember), [reportsForActiveMember])
  const followUps = useMemo(() => buildFollowUps(reportsForActiveMember), [reportsForActiveMember])
  const keyFindings = useMemo(() => buildKeyFindings(reportsForActiveMember), [reportsForActiveMember])
  const latestReport = reportsForActiveMember[0] || null
  const latestHealthScore = getLatestHealthScore(latestReport)
  const abnormalTestCount = useMemo(
    () =>
      reportsForActiveMember.reduce(
        (count, report) =>
          count +
          (report.tests || []).filter((test) => ['high', 'low'].includes(String(test.status || '').toLowerCase())).length,
        0,
      ),
    [reportsForActiveMember],
  )
  const prescriptionReports = useMemo(
    () => reportsForActiveMember.filter((report) => report.category === 'prescription'),
    [reportsForActiveMember],
  )

  const setActiveFamilyMember = useCallback((memberId) => {
    dispatch({ type: 'setActiveFamilyMember', payload: memberId })
  }, [])

  const createFamilyMember = useCallback(async (input) => {
    if (!accountId) {
      throw new Error('You must be signed in to create family profiles.')
    }

    const payload = {
      accountId,
      name: input.name,
      relation: input.relation,
      birthYear: input.birthYear,
      gender: input.gender,
    }

    const id = await createFamilyMemberRecord(payload)
    dispatch({
      type: 'familyMemberCreated',
      payload: {
        id,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    showToast('Family profile created.', 'success')
  }, [accountId, showToast])

  const updateFamilyMember = useCallback(async (memberId, input) => {
    await updateFamilyMemberRecord(memberId, input)
    dispatch({
      type: 'familyMemberUpdated',
      payload: {
        id: memberId,
        ...input,
        updatedAt: new Date(),
      },
    })
    showToast('Family profile updated.', 'success')
  }, [showToast])

  const deleteFamilyMember = useCallback(async (memberId) => {
    await deleteFamilyMemberRecord(memberId)
    dispatch({ type: 'familyMemberDeleted', payload: memberId })
    showToast('Family profile removed.', 'success')
  }, [showToast])

  const uploadHealthDocument = useCallback(async ({ familyMemberId, familyMemberName, category, file }) => {
    if (!accountId) {
      throw new Error('You must be signed in to upload reports.')
    }

    const analysis = await analyzeHealthDocument({
      fileData: file.data,
      mimeType: file.mimeType,
      category,
      familyMemberName,
    })

    const reportPayload = {
      accountId,
      familyMemberId,
      familyMemberName,
      category,
      fileName: file.name,
      mimeType: file.mimeType,
      reportTitle: analysis.reportTitle || file.name,
      reportDate: analysis.reportDate || '',
      reportType: analysis.reportType || category,
      tests: analysis.tests || [],
      medications: analysis.medications || [],
      healthCard: analysis.healthCard || null,
      doctorSummary: analysis.doctorSummary || null,
      extractedNarrative: analysis.extractedNarrative || '',
    }

    const reportId = await createHealthReportRecord(reportPayload)
    dispatch({
      type: 'reportCreated',
      payload: {
        id: reportId,
        ...reportPayload,
        uploadedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    showToast('Health document analyzed and saved.', 'success')

    return {
      id: reportId,
      ...reportPayload,
    }
  }, [accountId, showToast])

  const deleteReport = useCallback(async (reportId) => {
    await deleteHealthReportRecord(reportId)
    dispatch({ type: 'reportDeleted', payload: reportId })
    showToast('Report removed from vault.', 'success')
  }, [showToast])

  const value = useMemo(
    () => ({
      dataLoading: authLoading ? true : state.dataLoading,
      dataError: state.dataError,
      familyMembers: state.familyMembers,
      activeFamilyMember,
      activeFamilyMemberId: state.activeFamilyMemberId,
      reports: state.reports,
      reportsForActiveMember,
      recentReports,
      latestReport,
      latestHealthScore,
      abnormalTestCount,
      prescriptionReports,
      healthAlerts,
      followUps,
      keyFindings,
      timelineMap,
      availableTimelineTests,
      setActiveFamilyMember,
      createFamilyMember,
      updateFamilyMember,
      deleteFamilyMember,
      uploadHealthDocument,
      deleteReport,
    }),
    [
      abnormalTestCount,
      activeFamilyMember,
      authLoading,
      availableTimelineTests,
      createFamilyMember,
      deleteFamilyMember,
      deleteReport,
      followUps,
      healthAlerts,
      keyFindings,
      latestHealthScore,
      latestReport,
      prescriptionReports,
      recentReports,
      reportsForActiveMember,
      setActiveFamilyMember,
      state.activeFamilyMemberId,
      state.dataError,
      state.dataLoading,
      state.familyMembers,
      state.reports,
      timelineMap,
      updateFamilyMember,
      uploadHealthDocument,
    ],
  )

  return <FamilyHealthContext.Provider value={value}>{children}</FamilyHealthContext.Provider>
}
