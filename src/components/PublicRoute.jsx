import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getAuthRoute } from '../utils/roles'
import LoadingScreen from './LoadingScreen'

export default function PublicRoute({ children }) {
  const { authLoading, currentUser, userProfile } = useAuth()

  if (authLoading) {
    return <LoadingScreen label="Loading authentication..." />
  }

  return currentUser ? <Navigate to={getAuthRoute({ currentUser, userProfile })} replace /> : children
}
