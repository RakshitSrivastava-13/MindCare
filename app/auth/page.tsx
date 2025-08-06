'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, Stethoscope, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

type UserType = 'patient' | 'doctor'
type AuthMode = 'login' | 'signup'

interface FormData {
  email: string
  password: string
  name?: string
  phone?: string
  specialization?: string
  licenseNumber?: string
}

interface Disease {
  id: string
  name: string
  description: string
  category: string
}

export default function AuthPage() {
  const router = useRouter()
  const { user, userProfile, signIn, signUp, loading } = useAuth()
  
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.userType === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        // For patients, check if they need onboarding
        checkPatientOnboarding()
      }
    }
  }, [user, userProfile, router])

  const checkPatientOnboarding = async () => {
    if (!user) return

    try {
      // Check if patient profile exists
      const response = await fetch(`/api/patients/${user.uid}`)
      const data = await response.json()
      
      if (data.success && data.patient) {
        // Patient profile exists, go to dashboard
        router.push('/patient/dashboard')
      } else {
        // New patient, go to onboarding
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error checking patient profile:', error)
      // Default to onboarding for new patients
      router.push('/onboarding')
    }
  }

  const [userType, setUserType] = useState<UserType>('patient')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    specialization: '',
    licenseNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diseases, setDiseases] = useState<Disease[]>([])

  // Fetch diseases for doctor specialization dropdown
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await fetch('/api/diseases-doctors')
        const data = await response.json()
        if (data.success) {
          setDiseases(data.diseases || [])
        }
      } catch (error) {
        console.error('Error fetching diseases:', error)
      }
    }
    
    if (userType === 'doctor') {
      fetchDiseases()
    }
  }, [userType])

  // Reset form when switching auth modes
  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode)
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      specialization: '',
      licenseNumber: ''
    })
  }

  // Reset form when switching user types
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type)
    setFormData(prev => ({
      ...prev,
      specialization: '',
      licenseNumber: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (authMode === 'login') {
        // Validate login fields
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required')
        }
        
        await signIn(formData.email, formData.password)
        toast.success('Login successful!')
      } else {
        // Validate required fields for signup
        if (!formData.name?.trim()) {
          throw new Error('Name is required')
        }
        
        if (!formData.email?.trim()) {
          throw new Error('Email is required')
        }
        
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        
        if (!formData.phone?.trim()) {
          throw new Error('Phone number is required')
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address')
        }
        
        if (userType === 'doctor') {
          if (!formData.specialization?.trim()) {
            throw new Error('Specialization is required for doctors')
          }
          if (!formData.licenseNumber?.trim()) {
            throw new Error('License number is required for doctors')
          }
        }

        await signUp(formData.email, formData.password, {
          name: formData.name.trim(),
          userType,
          phone: formData.phone.trim(),
          specialization: formData.specialization?.trim(),
          licenseNumber: formData.licenseNumber?.trim()
        })
        
        toast.success('Registration successful!')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email'
            break
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password'
            break
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists'
            break
          case 'auth/weak-password':
            errorMessage = 'Password is too weak'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later'
            break
          default:
            errorMessage = error.message || 'An error occurred'
        }
      } else {
        errorMessage = error.message || 'An error occurred'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1a2f1a] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="relative bg-[#1a2f1a] text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-bg.jpg"
            alt="Authentication Background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">
            {authMode === 'login' ? 'Welcome Back' : 'Join MindCare'}
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            {authMode === 'login' 
              ? 'Sign in to continue your mental health journey'
              : 'Start your journey towards better mental health today'}
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="max-w-4xl mx-auto px-4 py-16 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* User Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-full">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  userType === 'patient'
                    ? 'bg-white text-[#1a2f1a] shadow'
                    : 'text-gray-600'
                }`}
                onClick={() => handleUserTypeChange('patient')}
              >
                Patient
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  userType === 'doctor'
                    ? 'bg-white text-[#1a2f1a] shadow'
                    : 'text-gray-600'
                }`}
                onClick={() => handleUserTypeChange('doctor')}
              >
                Doctor
              </button>
            </div>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="space-x-4">
              <button
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  authMode === 'login'
                    ? 'text-[#1a2f1a] border-b-2 border-[#1a2f1a]'
                    : 'text-gray-600'
                }`}
                onClick={() => handleAuthModeChange('login')}
              >
                Login
              </button>
              <button
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  authMode === 'signup'
                    ? 'text-[#1a2f1a] border-b-2 border-[#1a2f1a]'
                    : 'text-gray-600'
                }`}
                onClick={() => handleAuthModeChange('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                {userType === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          required
                          className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a] appearance-none bg-white"
                        >
                          <option value="">Select your specialization</option>
                          {diseases.map(disease => (
                            <option key={disease.id} value={disease.id}>
                              {disease.name} - {disease.category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          required
                          className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                          placeholder="License/Registration Number"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-[#1a2f1a] text-white rounded-xl hover:bg-[#2a4f2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => handleAuthModeChange('signup')}
                  className="text-[#1a2f1a] font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => handleAuthModeChange('login')}
                  className="text-[#1a2f1a] font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 