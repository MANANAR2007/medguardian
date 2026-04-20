import { useEffect, useRef, useState } from 'react'
import {
  createUserProfile,
  getUserProfile,
  linkCaregiverToPatient,
  observeAuthState,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 🔥 Prevent duplicate fetches
  const isFetchingRef = useRef(false)

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      console.log('Auth state changed:', user)

      // ✅ Avoid unnecessary state updates
      setCurrentUser((prev) => {
        if (prev?.uid === user?.uid) return prev
        return user
      })

      if (!user) {
        setUserProfile(null)
        setAuthLoading(false)
        return
      }

      // 🔥 Prevent multiple parallel fetches
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      try {
        console.log('Fetching profile...')
        const profile = await getUserProfile(user.uid)

        if (profile?.role) {
          setUserProfile(profile)
        } else {
          console.warn('User profile missing')
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setAuthLoading(false)
        isFetchingRef.current = false
      }
    })

    return () => unsubscribe()
  }, [])

  // 🔁 Refresh profile manually
  async function refreshUserProfile() {
    if (!currentUser?.uid) return null

    try {
      const profile = await getUserProfile(currentUser.uid)
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      return null
    }
  }

  // 🔐 LOGIN
  async function login(email, password) {
    const credential = await signInWithEmail(email, password)

    let profile
    try {
      profile = await getUserProfile(credential.user.uid)
    } catch (error) {
      console.error('Login profile fetch failed:', error)
      throw new Error('Unable to fetch user profile.', { cause: error })
    }

    if (!profile?.role) {
      throw new Error('Your account profile is missing a role.')
    }

    setCurrentUser(credential.user)
    setUserProfile(profile)

    return { user: credential.user, profile }
  }

  // 🆕 SIGNUP
  async function signup(email, password, role) {
    if (!['patient', 'caregiver'].includes(role)) {
      throw new Error('Please select a valid role.')
    }

    const credential = await signUpWithEmail(email, password)

    const profile = {
      uid: credential.user.uid,
      email: credential.user.email ?? email,
      role,
      linkedPatientId: null,
      linkedCaregiverId: null,
    }

    try {
      await createUserProfile(profile)
    } catch (error) {
      console.error('Profile creation failed:', error)
      throw new Error('Failed to create user profile.', { cause: error })
    }

    setCurrentUser(credential.user)
    setUserProfile(profile)

    return { user: credential.user, profile }
  }

  // 🚪 LOGOUT
  async function logout() {
    await signOutUser()
    setCurrentUser(null)
    setUserProfile(null)
  }

  // 🔗 LINK CAREGIVER → PATIENT
  async function linkPatientAccount(patientIdentifier) {
    if (!currentUser?.uid) {
      throw new Error('You must be signed in to link a patient.')
    }

    try {
      const patient = await linkCaregiverToPatient({
        caregiverUid: currentUser.uid,
        patientIdentifier,
      })

      await refreshUserProfile()
      return patient
    } catch (error) {
      console.error('Linking failed:', error)
      throw new Error('Failed to link patient account.', { cause: error })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        authLoading,
        login,
        signup,
        logout,
        refreshUserProfile,
        linkPatientAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
