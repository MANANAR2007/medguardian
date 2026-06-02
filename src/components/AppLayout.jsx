import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDefaultRouteForRole } from '../utils/roles'
import { ROUTES } from '../utils/routes'
import FamilySwitcher from './FamilySwitcher'
import ThemeToggle from './ThemeToggle'

function getInitials(email = '') {
  return email.slice(0, 2).toUpperCase() || 'FH'
}

function navLinkClassName({ isActive }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
  ].join(' ')
}

function mobileNavLinkClassName({ isActive }) {
  return [
    'rounded-full px-3 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
  ].join(' ')
}

export default function AppLayout() {
  const { currentUser, logout, userProfile } = useAuth()

  const navigation = [
    { label: 'Dashboard', to: ROUTES.dashboard, marker: 'D' },
    { label: 'Family', to: ROUTES.family, marker: 'F' },
    { label: 'Reports', to: ROUTES.reports, marker: 'R' },
    { label: 'Timeline', to: ROUTES.timeline, marker: 'T' },
    { label: 'Summary', to: ROUTES.doctorSummary, marker: 'S' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-gray-200 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90 lg:block">
          <Link to={getDefaultRouteForRole(userProfile?.role)} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-sm font-extrabold text-white shadow-sm shadow-blue-500/30">
              FH
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Family Health Companion
              </span>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                AI-powered family health records
              </span>
            </span>
          </Link>

          <nav className="mt-6 space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                  {item.marker}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Session</p>
            <p className="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {currentUser?.email}
            </p>
            <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
              {userProfile?.role === 'caregiver' ? 'care partner' : 'family organizer'}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 text-sm font-semibold text-red-500 transition hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 px-6 py-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/85">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <Link
                  to={getDefaultRouteForRole(userProfile?.role)}
                  className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100 lg:hidden"
                >
                  Family Health Companion
                </Link>
                <p className="hidden text-sm font-medium text-gray-500 dark:text-gray-400 lg:block">
                  Upload reports, track trends, and turn medical records into clearer family insights.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end xl:items-center">
                <FamilySwitcher />
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div className="hidden items-center gap-3 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:flex">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                      {getInitials(currentUser?.email)}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-44 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {currentUser?.email}
                      </span>
                      <span className="block text-xs capitalize text-gray-500 dark:text-gray-400">
                        account owner
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileNavLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="px-6 py-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
