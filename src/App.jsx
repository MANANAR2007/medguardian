import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { useAuth } from './hooks/useAuth'
import { getAuthRoute } from './utils/roles'
import { ROUTES } from './utils/routes'


const CaregiverDashboardPage = lazy(() => import('./pages/CaregiverDashboardPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MedicationsPage = lazy(() => import('./pages/MedicationsPage'))
const ScannerPage = lazy(() => import('./pages/ScannerPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))


function IndexRedirect() {
  const { authLoading, currentUser, userProfile } = useAuth()

  if (authLoading) {
    return <LoadingScreen label="Preparing your MedGuardian workspace..." />
  }

  return <Navigate to={getAuthRoute({ currentUser, userProfile })} replace />
}


export default function App() {
  const location = useLocation() // ✅ key fix

  return (
    <Suspense fallback={<LoadingScreen label="Loading MedGuardian..." />}>
      
      <Routes location={location} key={location.pathname}>
        
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

        {/* Protected Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.caregiverDashboard}
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.medications}
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.insights}
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <InsightsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.scanner}
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <ScannerPage />
              </ProtectedRoute>
            }
          />
        </Route>

       
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  )
}