import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { useAuth } from './hooks/useAuth'
import { getAuthRoute } from './utils/roles'
import { ROUTES } from './utils/routes'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DoctorSummaryPage = lazy(() => import('./pages/DoctorSummaryPage'))
const FamilyMembersPage = lazy(() => import('./pages/FamilyMembersPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const TimelinePage = lazy(() => import('./pages/TimelinePage'))

function IndexRedirect() {
  const { authLoading, currentUser, userProfile } = useAuth()

  if (authLoading) {
    return <LoadingScreen label="Preparing Family Health Companion..." />
  }

  return <Navigate to={getAuthRoute({ currentUser, userProfile })} replace />
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading Family Health Companion..." />}>
      <Routes>
        <Route path={ROUTES.home} element={<IndexRedirect />} />

        <Route
          path={ROUTES.login}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.signup}
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.family} element={<FamilyMembersPage />} />
          <Route path={ROUTES.reports} element={<ReportsPage />} />
          <Route path={ROUTES.timeline} element={<TimelinePage />} />
          <Route path={ROUTES.doctorSummary} element={<DoctorSummaryPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  )
}
