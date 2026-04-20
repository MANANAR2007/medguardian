import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from './firebase'
import { logFirestoreError, logFirestoreStart } from '../utils/firestoreDebug'

export async function fetchHealthNotes(userId) {
  const notesQuery = query(collection(db, 'healthNotes'), where('userId', '==', userId))

  try {
    logFirestoreStart()
    const snapshot = await getDocs(notesQuery)

    return snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data(),
      }))
      .sort((left, right) => {
        const leftMillis = left.createdAt?.toDate?.()?.getTime?.() ?? 0
        const rightMillis = right.createdAt?.toDate?.()?.getTime?.() ?? 0
        return rightMillis - leftMillis
      })
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}

export async function addHealthNote({ userId, note }) {
  try {
    logFirestoreStart()
    await addDoc(collection(db, 'healthNotes'), {
      userId,
      note: note.trim(),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError(error)
    throw error
  }
}
