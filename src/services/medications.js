import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { logFirestoreError, logFirestoreStart } from '../utils/firestoreDebug'

function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => {
    const leftDate = left.createdAt?.toDate?.() ?? left.createdAt
    const rightDate = right.createdAt?.toDate?.() ?? right.createdAt
    const leftMillis = leftDate instanceof Date ? leftDate.getTime() : 0
    const rightMillis = rightDate instanceof Date ? rightDate.getTime() : 0
    return rightMillis - leftMillis
  })
}

function sortByTimestampDesc(items) {
  return [...items].sort((left, right) => {
    const leftMillis = left.timestamp?.toDate?.()?.getTime?.() ?? 0
    const rightMillis = right.timestamp?.toDate?.()?.getTime?.() ?? 0
    return rightMillis - leftMillis
  })
}

export async function fetchMedications(userId) {
  const medicationsQuery = query(collection(db, 'medications'), where('userId', '==', userId))

  try {
    logFirestoreStart()
    const snapshot = await getDocs(medicationsQuery)

    const medications = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))

    return sortByCreatedAtDesc(medications)
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function fetchLogs(userId) {
  const logsQuery = query(collection(db, 'logs'), where('userId', '==', userId))

  try {
    logFirestoreStart()
    const snapshot = await getDocs(logsQuery)

    const logs = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))

    return sortByTimestampDesc(logs)
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function addMedicationRecord({ userId, name, dosage, times, frequency }) {
  if (!userId || !name?.trim() || !dosage?.trim() || !Array.isArray(times) || times.length === 0) {
    throw new Error('Medication requires a user, name, dosage, and at least one time.')
  }

  const data = {
    userId,
    name: name.trim(),
    dosage: dosage.trim(),
    times,
    frequency,
    createdAt: serverTimestamp(),
  }

  console.log('Saving medication:', data)

  try {
    logFirestoreStart()
    const documentRef = await addDoc(collection(db, 'medications'), data)

    console.log('Saved successfully')

    return documentRef.id
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function updateMedicationRecord(medicationId, { name, dosage, times, frequency }) {
  try {
    logFirestoreStart()
    await updateDoc(doc(db, 'medications', medicationId), {
      name: name.trim(),
      dosage: dosage.trim(),
      times,
      frequency,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function deleteMedicationRecord(medicationId) {
  try {
    logFirestoreStart()
    const medicationRef = doc(db, 'medications', medicationId)
    const relatedLogsQuery = query(collection(db, 'logs'), where('medicationId', '==', medicationId))
    const relatedLogsSnapshot = await getDocs(relatedLogsQuery)
    const batch = writeBatch(db)

    batch.delete(medicationRef)
    relatedLogsSnapshot.forEach((document) => batch.delete(document.ref))

    await batch.commit()
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function createMedicationLog({
  userId,
  medicationId,
  status,
  scheduledDate,
  scheduledTime,
  slotKey,
}) {
  try {
    logFirestoreStart()
    const logId = `${userId}_${medicationId}_${scheduledDate}_${scheduledTime.replace(':', '-')}`
    const logRef = doc(db, 'logs', logId)
    const existingLog = await getDoc(logRef)

    if (existingLog.exists()) {
      throw new Error('This dose has already been logged for today.')
    }

    await setDoc(logRef, {
      id: logId,
      userId,
      medicationId,
      status,
      scheduledDate,
      scheduledTime,
      slotKey,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}
