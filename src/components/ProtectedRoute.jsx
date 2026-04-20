import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDefaultRouteForRole } from '../utils/roles'
import { ROUTES } from '../utils/routes'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { authLoading, currentUser, userProfile } = useAuth()

  if (authLoading) {
    return <LoadingScreen label="Checking your secure session..." />
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (!userProfile?.role) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (allowedRoles && userProfile?.role && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={getDefaultRouteForRole(userProfile.role)} replace />
  }

  return children
}
