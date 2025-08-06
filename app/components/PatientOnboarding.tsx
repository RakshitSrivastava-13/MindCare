'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useDoctorsBySpecialization } from '@/hooks/useApi'
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react'

interface Disease {
  id: string
  name: string
  description: string
  category: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
  rating: number
  totalReviews: number
  isAvailable: boolean
  phone?: string
  email?: string
  licenseNumber?: string
}

interface TimeSlot {
  value: string
  label: string
  hour: number
}

interface OnboardingData {
  diseaseId: string
  diseaseName: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  completed: boolean
}

export default function PatientOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    diseaseId: '',
    diseaseName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    completed: false
  })

  // Use the new hook to fetch doctors by specialization
  const { 
    doctors, 
    loading: loadingDoctors, 
    error: doctorsError 
  } = useDoctorsBySpecialization(onboardingData.diseaseName || undefined)

  // Load diseases on component mount
  useEffect(() => {
    fetchDiseases()
  }, [])

  // Load available slots when doctor and date are selected
  useEffect(() => {
    if (onboardingData.doctorId && onboardingData.date) {
      fetchAvailableSlots()
    }
  }, [onboardingData.doctorId, onboardingData.date])

  const fetchDiseases = async () => {
    try {
      const response = await fetch('/api/diseases-doctors')
      const data = await response.json()
      
      if (data.success) {
        setDiseases(data.diseases)
      } else {
        setError('Failed to load diseases')
      }
    } catch (err) {
      setError('Failed to load diseases')
      console.error('Error:', err)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/available-slots?doctorId=${onboardingData.doctorId}&date=${onboardingData.date}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableSlots(data.availableSlots)
      } else {
        setError('Failed to load available slots')
      }
    } catch (err) {
      setError('Failed to load time slots')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDiseaseSelect = (disease: Disease) => {
    setOnboardingData(prev => ({
      ...prev,
      diseaseId: disease.id,
      diseaseName: disease.name,
      doctorId: '', // Reset doctor selection
      doctorName: '',
      date: '',
      time: ''
    }))
    setCurrentStep(2)
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setOnboardingData(prev => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: doctor.name
    }))
    setCurrentStep(3)
  }

  const handleDateSelect = (date: string) => {
    setOnboardingData(prev => ({
      ...prev,
      date,
      time: '' // Reset time selection
    }))
  }

  const handleTimeSelect = (time: string) => {
    setOnboardingData(prev => ({
      ...prev,
      time
    }))
    setCurrentStep(4)
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Create appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: onboardingData.doctorId,
          patientId: user.uid,
          patientName: user.displayName || user.email,
          doctorName: onboardingData.doctorName,
          date: onboardingData.date,
          time: onboardingData.time,
          duration: 60,
          type: 'Initial Consultation',
          status: 'pending'
        })
      })

      const appointmentData = await appointmentResponse.json()

      if (!appointmentData.success) {
        throw new Error(appointmentData.error || 'Failed to create appointment')
      }

      // Create notification for doctor about new appointment booking
      try {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: user.uid,
            doctorId: onboardingData.doctorId,
            patientName: user.displayName || user.email,
            type: 'appointment',
            message: `New appointment request from ${user.displayName || user.email} for ${onboardingData.diseaseName} on ${new Date(onboardingData.date).toLocaleDateString()} at ${onboardingData.time}`,
            priority: 'medium'
          })
        })
      } catch (error) {
        console.error('Error creating notification:', error)
        // Don't fail the appointment creation if notification fails
      }

      // Update patient profile with disease and doctor info
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          age: 25, // Default age - can be updated later
          gender: 'Not specified',
          doctorId: onboardingData.doctorId,
          primaryDiagnosis: onboardingData.diseaseName,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        })
      })

      const patientData = await patientResponse.json()

      if (patientData.success) {
        setOnboardingData(prev => ({ ...prev, completed: true }))
        setCurrentStep(5)
        
        // Show success message and redirect to appointments page to see the booked appointment
        setTimeout(() => {
          router.push('/patient/appointments')
        }, 3000)
      } else {
        throw new Error(patientData.error || 'Failed to update patient profile')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredDoctors = () => {
    // Since we're now fetching doctors filtered by specialization from the API,
    // we just return all doctors (they're already filtered)
    return doctors
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // 30 days from today
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-[#1a2f1a] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-[#1a2f1a]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Select Condition</span>
            <span>Choose Doctor</span>
            <span>Pick Date</span>
            <span>Select Time</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Error Message */}
        {(error || doctorsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error || doctorsError}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: Disease Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">What brings you here today?</h2>
              <p className="text-gray-600 mb-6">Select the condition you'd like help with</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diseases.map((disease) => (
                  <button
                    key={disease.id}
                    onClick={() => handleDiseaseSelect(disease)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#1a2f1a] hover:bg-green-50 transition-colors text-left"
                  >
                    <h3 className="font-medium text-lg mb-1">{disease.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{disease.description}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{disease.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Doctor Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Choose Your Doctor</h2>
              <p className="text-gray-600 mb-6">
                Specialists for <span className="font-medium">{onboardingData.diseaseName}</span>
              </p>
              
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2f1a]"></div>
                  <span className="ml-3 text-gray-600">Loading doctors...</span>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No doctors available for {onboardingData.diseaseName}</p>
                  <p className="text-sm text-gray-400">Only registered doctors appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredDoctors().map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#1a2f1a] hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-15 h-15 bg-[#1a2f1a] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-lg">Dr. {doctor.name}</h3>
                          <p className="text-[#1a2f1a] text-sm mb-1">{doctor.specialization}</p>
                          {doctor.rating > 0 && (
                            <p className="text-gray-600 text-sm mb-2">
                              ★ {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {doctor.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setCurrentStep(1)}
                className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to conditions
              </button>
            </div>
          )}

          {/* Step 3: Date Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Appointment Date</h2>
              <p className="text-gray-600 mb-6">
                Choose a convenient date for your appointment with {onboardingData.doctorName}
              </p>
              
              <div className="max-w-md">
                <input
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={onboardingData.date}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                />
              </div>

              {onboardingData.date && (
                <button
                  onClick={() => setCurrentStep(4)}
                  className="mt-6 bg-[#1a2f1a] text-white px-6 py-2 rounded-lg hover:bg-[#2a4f2a] transition-colors"
                >
                  Continue to Time Selection
                </button>
              )}
              
              <button
                onClick={() => setCurrentStep(2)}
                className="mt-4 ml-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to doctors
              </button>
            </div>
          )}

          {/* Step 4: Time Selection */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Appointment Time</h2>
              <p className="text-gray-600 mb-6">
                Available time slots for {new Date(onboardingData.date).toLocaleDateString()}
              </p>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading available slots...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => handleTimeSelect(slot.label)}
                        className={`p-3 border border-gray-200 rounded-lg hover:border-[#1a2f1a] hover:bg-green-50 transition-colors ${
                          onboardingData.time === slot.label ? 'border-[#1a2f1a] bg-green-50' : ''
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <div className="text-sm font-medium">{slot.label}</div>
                      </button>
                    ))}
                  </div>

                  {availableSlots.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date. Please choose another date.
                    </div>
                  )}
                </>
              )}
              
              <button
                onClick={() => setCurrentStep(3)}
                className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to date selection
              </button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">Appointment Booked Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your appointment has been scheduled successfully! You'll be redirected to your appointments page to view all details.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-medium mb-2">Appointment Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Condition:</strong> {onboardingData.diseaseName}</p>
                  <p><strong>Doctor:</strong> {onboardingData.doctorName}</p>
                  <p><strong>Date:</strong> {new Date(onboardingData.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {onboardingData.time}</p>
                  <p><strong>Type:</strong> Initial Consultation</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 Confirmation Button */}
          {currentStep === 4 && onboardingData.time && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">Confirm Appointment Details:</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-1 text-sm">
                  <p><strong>Condition:</strong> {onboardingData.diseaseName}</p>
                  <p><strong>Doctor:</strong> {onboardingData.doctorName}</p>
                  <p><strong>Date:</strong> {new Date(onboardingData.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {onboardingData.time}</p>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#1a2f1a] text-white px-6 py-3 rounded-lg hover:bg-[#2a4f2a] transition-colors disabled:opacity-50"
              >
                {loading ? 'Booking Appointment...' : 'Confirm & Book Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
