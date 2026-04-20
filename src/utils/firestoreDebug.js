export function logFirestoreStart() {
  console.log('Firestore request started')
}

export function logFirestoreError(error) {
  console.error('Firestore error:', error)

  if (error?.message?.toLowerCase().includes('offline')) {
    console.warn('Firestore offline mode detected')
  }
}
