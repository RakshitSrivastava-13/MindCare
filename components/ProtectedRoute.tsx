'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: ('doctor' | 'patient')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['doctor', 'patient'],
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (userProfile && !allowedUserTypes.includes(userProfile.userType)) {
        // Redirect to appropriate dashboard if user type not allowed
        const destination = userProfile.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
        router.push(destination)
        return
      }
    }
  }, [user, userProfile, loading, router, allowedUserTypes, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1a2f1a]"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  if (!allowedUserTypes.includes(userProfile.userType)) {
    return null
  }

  return <>{children}</>
}
