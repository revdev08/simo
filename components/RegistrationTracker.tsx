'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { fbTrackOnce } from '@/lib/metaPixel'

// Ventana de tolerancia para distinguir "se acaba de registrar" de "inició sesión" en una cuenta antigua.
const REGISTRATION_WINDOW_MS = 5 * 60 * 1000

export default function RegistrationTracker() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isSignedIn || !user?.createdAt) return

    const justRegistered = Date.now() - new Date(user.createdAt).getTime() < REGISTRATION_WINDOW_MS
    if (!justRegistered) return

    fbTrackOnce(user.id, 'CompleteRegistration', {
      content_name: 'SIMO Test Signup',
    })
  }, [isSignedIn, user])

  return null
}
