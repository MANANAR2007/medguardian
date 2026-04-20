import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseErrorMessage } from '../utils/firebaseError'
import { getDefaultRouteForRole } from '../utils/roles'
import Button from './Button'
import InputField from './InputField'

const initialValues = {
  email: '',
  password: '',
  role: 'patient',
}

export default function AuthForm({
  mode,
  title,
  subtitle,
  submitLabel,
  footerPrompt,
  footerLinkLabel,
  footerLinkTo,
}) {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const [formData, setFormData] = useState(initialValues)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (isSignup) {
        const result = await signup(formData.email, formData.password, formData.role)
        navigate(getDefaultRouteForRole(result.profile?.role), { replace: true })
      } else {
        const result = await login(formData.email, formData.password)
        navigate(getDefaultRouteForRole(result.profile?.role), { replace: true })
      }
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 space-y-2">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          {isSignup ? 'Create account' : 'Welcome back'}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          id={`${mode}-email`}
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <InputField
          id={`${mode}-password`}
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? 'Choose a secure password' : 'Enter your password'}
          value={formData.password}
          onChange={handleChange}
          hint={isSignup ? 'Use at least 6 characters for Firebase email authentication.' : undefined}
          required
        />

        {isSignup ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Account role</span>
            <select
              value={formData.role}
              onChange={(event) => handleChange(event)}
              name="role"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
            >
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </label>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : submitLabel}
        </Button>
      </form>

      <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
        {footerPrompt}{' '}
        <Link to={footerLinkTo} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
          {footerLinkLabel}
        </Link>
      </p>

      <p className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
        New signups create a Firestore profile with the selected role for patient or caregiver access.
      </p>
    </div>
  )
}
