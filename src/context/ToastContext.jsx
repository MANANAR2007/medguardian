import { useCallback, useState } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID()

    setToasts((current) => [...current, { id, message, type }])
    window.setTimeout(() => removeToast(id), 4200)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => removeToast(toast.id)}
            className={[
              'rounded-xl border px-4 py-3 text-left text-sm font-semibold shadow-lg backdrop-blur transition hover:-translate-y-0.5',
              toast.type === 'error'
                ? 'border-red-200 bg-red-50/95 text-red-700 dark:border-red-900 dark:bg-red-950/95 dark:text-red-300'
                : toast.type === 'success'
                  ? 'border-green-200 bg-green-50/95 text-green-700 dark:border-green-900 dark:bg-green-950/95 dark:text-green-300'
                  : 'border-gray-200 bg-white/95 text-gray-700 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200',
            ].join(' ')}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
