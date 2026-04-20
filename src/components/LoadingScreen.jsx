export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500 dark:border-gray-800 dark:border-t-blue-400" />
      <div>
        <p className="text-lg font-extrabold tracking-tight">MedGuardian</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
