'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Image from 'next/image'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { useAppointments } from '@/hooks/useApi'
import { Appointment } from '@/types'

const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM'
]

export default function Appointments() {
  const { user, userProfile } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'Follow-up' as 'Follow-up' | 'Initial Consultation' | 'Emergency' | 'Video Call' | 'In-Person'
  })

  const { appointments, loading, createAppointment, updateAppointment } = useAppointments(user?.uid)

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCreateAppointment = async () => {
    try {
      const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        doctorId: user?.uid || '',
        patientId: newAppointment.patientId,
        patientName: newAppointment.patientName,
        doctorName: userProfile?.name || '',
        date: newAppointment.date,
        time: newAppointment.time,
        duration: newAppointment.duration,
        type: newAppointment.type,
        status: 'pending'
      }
      
      await createAppointment(appointmentData)
      setShowNewAppointment(false)
      setNewAppointment({
        patientName: '',
        patientId: '',
        date: '',
        time: '',
        duration: 60,
        type: 'Follow-up'
      })
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointment(appointmentId, { status })
      
      // Mark related alerts as read when appointment is confirmed/cancelled
      if (status === 'confirmed' || status === 'cancelled') {
        try {
          const appointment = appointments.find(apt => apt.id === appointmentId)
          if (appointment) {
            // Find and mark the related alert as read
            await fetch('/api/alerts/mark-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                doctorId: user?.uid,
                patientId: appointment.patientId,
                appointmentId: appointmentId
              })
            })
            
            // Create a notification for the patient about the status update
            await fetch('/api/alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId: appointment.patientId,
                doctorId: user?.uid || '',
                patientName: appointment.patientName,
                type: 'appointment',
                message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been ${status}`,
                priority: 'medium'
              })
            })
          }
        } catch (error) {
          console.error('Error updating alerts:', error)
          // Don't fail the appointment update if alert update fails
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['doctor']}>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading appointments...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['doctor']}>
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif">Appointments</h1>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2f1a] text-white rounded-lg hover:bg-[#2a4f2a]"
            >
              <Plus className="w-5 h-5" />
              New Appointment
            </button>
          </div>

          {/* Pending Appointments Alert */}
          {appointments.filter(apt => apt.status === 'pending').length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-yellow-800">
                    {appointments.filter(apt => apt.status === 'pending').length} Pending Appointment Confirmation{appointments.filter(apt => apt.status === 'pending').length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-sm text-yellow-700">
                    Please review and confirm these appointment requests from patients
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {appointments.filter(apt => apt.status === 'pending').map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={`https://ui-avatars.com/api/?name=${appointment.patientName}`}
                          alt={appointment.patientName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-500">{appointment.type}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="grid grid-cols-12 gap-8">
          {/* Calendar */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-medium">January 2024</h2>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDateChange(new Date(2024, 0, i + 1))}
                    className={`aspect-square rounded-full flex items-center justify-center text-sm ${
                      selectedDate.getDate() === i + 1
                        ? 'bg-[#1a2f1a] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-lg font-medium mb-4">Available Time Slots</h2>
              <div className="space-y-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={`https://ui-avatars.com/api/?name=${appointment.patientName}`}
                        alt={appointment.patientName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{appointment.time}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.duration} minutes
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No appointments found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">New Appointment</h2>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={newAppointment.patientName}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      patientName: e.target.value
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID (temporary)
                </label>
                <input
                  type="text"
                  value={newAppointment.patientId}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      patientId: e.target.value
                    })
                  }
                  placeholder="Enter patient ID"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      time: e.target.value
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={newAppointment.duration}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      duration: parseInt(e.target.value)
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newAppointment.type}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value as 'Initial Consultation' | 'Follow-up' | 'Emergency' | 'Video Call' | 'In-Person'
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                >
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowNewAppointment(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                className="px-4 py-2 bg-[#1a2f1a] text-white rounded-lg hover:bg-[#2a4f2a]"
              >
                Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
} 