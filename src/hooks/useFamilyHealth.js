import { useContext } from 'react'
import { FamilyHealthContext } from '../context/family-health-context'

export function useFamilyHealth() {
  const context = useContext(FamilyHealthContext)

  if (!context) {
    throw new Error('useFamilyHealth must be used within a FamilyHealthProvider')
  }

  return context
}
