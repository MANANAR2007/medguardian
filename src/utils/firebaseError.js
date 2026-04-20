const firebaseErrorMessages = {
  'auth/email-already-in-use': 'That email is already registered.',
  'auth/invalid-credential': 'The email or password you entered is incorrect.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/network-request-failed': 'Network error. Please try again.',
  'auth/too-many-requests': 'Too many attempts detected. Please try again later.',
  'auth/weak-password': 'Password must be at least 6 characters long.',
}

export function getFirebaseErrorMessage(error) {
  if (error?.message) {
    return error.message
  }

  if (!error?.code) {
    return 'Something went wrong. Please try again.'
  }

  return firebaseErrorMessages[error.code] ?? 'Something went wrong. Please try again.'
}
