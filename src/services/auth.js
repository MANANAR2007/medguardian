import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, db } from './firebase'
import { logFirestoreError, logFirestoreStart } from '../utils/firestoreDebug'

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signOutUser() {
  return signOut(auth)
}

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function createUserProfile({
  uid,
  email,
  role,
  linkedPatientId = null,
  linkedCaregiverId = null,
}) {
  if (!uid || !email || !['patient', 'caregiver'].includes(role)) {
    throw new Error('A valid uid, email, and role are required to create a user profile.')
  }

  const userRef = doc(db, 'users', uid)

  try {
    logFirestoreStart()
    await setDoc(
      userRef,
      {
        uid,
        email: email.toLowerCase(),
        role,
        linkedPatientId,
        linkedCaregiverId,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function getUserProfile(uid) {
  try {
    logFirestoreStart()
    const userSnapshot = await getDoc(doc(db, 'users', uid))

    if (!userSnapshot.exists()) {
      return null
    }

    return userSnapshot.data()
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function findUserByIdentifier(identifier) {
  const value = identifier.trim().toLowerCase()

  if (!value) {
    return null
  }

  try {
    logFirestoreStart()
    const directMatch = await getDoc(doc(db, 'users', value))

    if (directMatch.exists()) {
      return directMatch.data()
    }

    const emailQuery = query(collection(db, 'users'), where('email', '==', value))
    const emailSnapshot = await getDocs(emailQuery)

    if (emailSnapshot.empty) {
      return null
    }

    return emailSnapshot.docs[0].data()
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function linkCaregiverToPatient({ caregiverUid, patientIdentifier }) {
  const caregiver = await getUserProfile(caregiverUid)

  if (!caregiver) {
    throw new Error('Unable to find the caregiver profile.')
  }

  if (caregiver.role !== 'caregiver') {
    throw new Error('Only caregiver accounts can link to patients.')
  }

  const patient = await findUserByIdentifier(patientIdentifier)

  if (!patient) {
    throw new Error('No patient was found for that UID or email.')
  }

  if (patient.role !== 'patient') {
    throw new Error('You can only link caregiver accounts to patient accounts.')
  }

  if (patient.uid === caregiver.uid) {
    throw new Error('A caregiver cannot link to their own account.')
  }

  if (patient.linkedCaregiverId && patient.linkedCaregiverId !== caregiver.uid) {
    throw new Error('That patient is already linked to another caregiver.')
  }

  if (caregiver.linkedPatientId && caregiver.linkedPatientId !== patient.uid) {
    throw new Error('This caregiver is already linked to a different patient.')
  }

  const batch = writeBatch(db)

  batch.set(
    doc(db, 'users', caregiver.uid),
    {
      linkedPatientId: patient.uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  batch.set(
    doc(db, 'users', patient.uid),
    {
      linkedCaregiverId: caregiver.uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  try {
    logFirestoreStart()
    await batch.commit()
  } catch (error) {
    logFirestoreError(error)
    throw error
  }

  return patient
}
