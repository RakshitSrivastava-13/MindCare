'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageCircle,
  CheckCircle,
  ArrowLeft,
  Star,
  Shield,
  Heart,
  Brain
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

const BANNER_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
const AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/616/616494.png'

interface AppointmentForm {
  name: string
  email: string
  phone: string
  date: string
  time: string
  type: string
  message: string
  disease: string
  doctorId: string
}

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
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
]

const initialForm: AppointmentForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  type: 'initial',
  message: '',
  disease: '',
  doctorId: ''
}

export default function AppointmentPage() {
  const [form, setForm] = useState<AppointmentForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Fetch diseases on component mount
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
    
    fetchDiseases()
  }, [])

  // Fetch doctors when disease is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!form.disease) {
        setAvailableDoctors([])
        return
      }

      console.log('Frontend: Fetching doctors for disease:', form.disease)
      setLoadingDoctors(true)
      try {
        const response = await fetch(`/api/doctors?specialization=${form.disease}`)
        const data = await response.json()
        console.log('Frontend: Doctors API response:', data)
        if (data.success) {
          setAvailableDoctors(data.doctors || [])
          console.log('Frontend: Available doctors set:', data.doctors)
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setLoadingDoctors(false)
      }
    }
    
    fetchDoctors()
  }, [form.disease])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create appointment with selected doctor
      const appointmentData = {
        ...form,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success('Appointment booked successfully!')
      } else {
        throw new Error('Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Reset doctor selection when disease changes
    if (name === 'disease') {
      setForm(prev => ({ ...prev, [name]: value, doctorId: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif mb-4">Appointment Scheduled!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for booking an appointment. We will send you a confirmation email shortly with all the details.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/appointment.jpg"
            alt="Appointment Background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Book Your Appointment</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Take the first step towards better mental health. Schedule a session with our qualified professionals.
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
              </div>

              {/* Condition & Doctor Selection */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mental Health Condition
                    </label>
                    <div className="relative">
                      <Brain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                      <select
                        name="disease"
                        value={form.disease}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="">Select your condition</option>
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
                      Select Doctor
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                      <select
                        name="doctorId"
                        value={form.doctorId}
                        onChange={handleChange}
                        required
                        disabled={!form.disease || loadingDoctors}
                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
                        </option>
                        {availableDoctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} {doctor.rating > 0 && `(★ ${doctor.rating.toFixed(1)})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!form.disease && (
                      <p className="text-sm text-gray-500 mt-1">Please select a condition first</p>
                    )}
                    {form.disease && availableDoctors.length === 0 && !loadingDoctors && (
                      <p className="text-sm text-orange-600 mt-1">
                        No doctors available for {diseases.find(d => d.id === form.disease)?.name || 'this condition'}. 
                        <br />Only registered doctors appear here.
                      </p>
                    )}
                    {form.disease && availableDoctors.length > 0 && !loadingDoctors && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {availableDoctors.length} registered doctor(s) available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="initial">Initial Consultation</option>
                    <option value="followup">Follow-up Session</option>
                    <option value="emergency">Emergency Session</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please share any additional information that might be helpful..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </div>
                ) : (
                  'Schedule Appointment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 