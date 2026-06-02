import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { logFirestoreError, logFirestoreStart } from '../utils/firestoreDebug'

function sortByDateDesc(items, field = 'uploadedAt') {
  return [...items].sort((left, right) => {
    const leftDate = left[field]?.toDate?.() ?? left[field]
    const rightDate = right[field]?.toDate?.() ?? right[field]
    const leftMillis = leftDate instanceof Date ? leftDate.getTime() : 0
    const rightMillis = rightDate instanceof Date ? rightDate.getTime() : 0
    return rightMillis - leftMillis
  })
}

export async function fetchFamilyMembers(accountId) {
  const membersQuery = query(collection(db, 'familyMembers'), where('accountId', '==', accountId))

  try {
    logFirestoreStart()
    const snapshot = await getDocs(membersQuery)

    return sortByDateDesc(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
      'createdAt',
    )
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function createFamilyMemberRecord({
  accountId,
  name,
  relation,
  birthYear = '',
  gender = '',
}) {
  if (!accountId || !name?.trim() || !relation?.trim()) {
    throw new Error('Family member name and relation are required.')
  }

  try {
    logFirestoreStart()
    const documentRef = await addDoc(collection(db, 'familyMembers'), {
      accountId,
      name: name.trim(),
      relation: relation.trim(),
      birthYear: String(birthYear || '').trim(),
      gender: String(gender || '').trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return documentRef.id
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function updateFamilyMemberRecord(memberId, updates) {
  try {
    logFirestoreStart()
    await updateDoc(doc(db, 'familyMembers', memberId), {
      ...updates,
      name: updates.name.trim(),
      relation: updates.relation.trim(),
      birthYear: String(updates.birthYear || '').trim(),
      gender: String(updates.gender || '').trim(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function deleteFamilyMemberRecord(memberId) {
  try {
    logFirestoreStart()
    const reportQuery = query(collection(db, 'healthReports'), where('familyMemberId', '==', memberId))
    const reportSnapshot = await getDocs(reportQuery)
    const batch = writeBatch(db)

    batch.delete(doc(db, 'familyMembers', memberId))
    reportSnapshot.forEach((document) => batch.delete(document.ref))

    await batch.commit()
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function fetchHealthReports(accountId) {
  const reportsQuery = query(collection(db, 'healthReports'), where('accountId', '==', accountId))

  try {
    logFirestoreStart()
    const snapshot = await getDocs(reportsQuery)

    return sortByDateDesc(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
    )
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function createHealthReportRecord(report) {
  try {
    logFirestoreStart()
    const documentRef = await addDoc(collection(db, 'healthReports'), {
      ...report,
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return documentRef.id
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function deleteHealthReportRecord(reportId) {
  try {
    logFirestoreStart()
    await deleteDoc(doc(db, 'healthReports', reportId))
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}
