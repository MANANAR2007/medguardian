import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

function sanitizeFileName(name) {
  return String(name || 'upload')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
}

export async function uploadHealthDocumentFile({ accountId, familyMemberId, file }) {
  if (!accountId || !familyMemberId || !file) {
    throw new Error('A valid account, family member, and file are required for upload.')
  }

  const fileName = sanitizeFileName(file.name)
  const storagePath = `family-health/${accountId}/${familyMemberId}/${Date.now()}-${fileName}`
  const storageRef = ref(storage, storagePath)

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      accountId,
      familyMemberId,
      originalName: file.name,
    },
  })

  const storageUrl = await getDownloadURL(storageRef)

  return {
    storagePath,
    storageUrl,
  }
}
