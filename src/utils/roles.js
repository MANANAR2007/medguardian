import { ROUTES } from './routes'

export function getDefaultRouteForRole(_role) {
  return ROUTES.dashboard
}

export function getAuthRoute({ currentUser, userProfile }) {
  if (!currentUser) {
    return ROUTES.login
  }

  if (!userProfile?.role) {
    return ROUTES.login
  }

  return getDefaultRouteForRole(userProfile.role)
}
