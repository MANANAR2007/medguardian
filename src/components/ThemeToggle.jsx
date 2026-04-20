import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
      aria-label="Toggle theme"
    >
      <span className="relative h-5 w-9 rounded-full bg-gray-200 dark:bg-gray-700">
        <span
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-gray-100',
            isDark ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
