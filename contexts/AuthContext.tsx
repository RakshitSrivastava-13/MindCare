'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  DocumentData,
  collection,
  addDoc
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserProfile {
  email: string
  name: string
  userType: 'doctor' | 'patient'
  phone?: string
  specialization?: string
  licenseNumber?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserCredential>
  signUp: (email: string, password: string, userData: Omit<UserProfile, 'email'>) => Promise<UserCredential>
  signOut: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  }

  const signUp = async (email: string, password: string, userData: Omit<UserProfile, 'email'>) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Save user profile to Firestore
    const userProfile: UserProfile = {
      email,
      ...userData
    }
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile)
    
    // If user is a doctor, also create a doctor profile in the doctors collection
    if (userData.userType === 'doctor') {
      const doctorProfile = {
        userId: result.user.uid,
        name: userData.name,
        email: email,
        specialization: userData.specialization,
        licenseNumber: userData.licenseNumber,
        phone: userData.phone,
        isAvailable: true,
        createdAt: new Date(),
        rating: 0,
        totalReviews: 0
      }
      
      console.log('Creating doctor profile:', doctorProfile)
      
      // Create doctor profile via API
      const doctorResponse = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(doctorProfile)
      })
      
      const doctorResult = await doctorResponse.json()
      console.log('Doctor profile creation result:', doctorResult)
      
      if (!doctorResult.success) {
        console.error('Failed to create doctor profile:', doctorResult.error)
        throw new Error('Failed to create doctor profile')
      }
    }
    
    setUserProfile(userProfile)
    
    return result
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserProfile(null)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user')
    
    const updatedProfile = { ...userProfile, ...data } as UserProfile
    await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true })
    setUserProfile(updatedProfile)
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
