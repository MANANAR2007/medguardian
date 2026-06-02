import ThemeToggle from './ThemeToggle'

export default function AuthLayout({ title, eyebrow, description, children }) {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-6xl justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] w-full max-w-6xl gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="max-w-2xl">
          <span className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600 shadow-sm dark:border-blue-900 dark:bg-gray-900 dark:text-blue-300">
            {eyebrow}
          </span>
          <h2 className="mt-6 max-w-xl text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 dark:text-gray-400">{description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Auth foundation</p>
              <p className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-gray-100">Firebase</p>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Secure sign-in with Firestore-backed account profiles.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Family record vault</p>
              <p className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-gray-100">Organized</p>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Upload reports, prescriptions, and notes for every family member in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">{children}</section>
      </div>
    </div>
  )
}
