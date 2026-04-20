import { useContext } from 'react'
import { MedicationDataContext } from '../context/medication-data-context'

export function useMedicationData() {
  const context = useContext(MedicationDataContext)

  if (!context) {
    throw new Error('useMedicationData must be used within a MedicationDataProvider')
  }

  return context
}
