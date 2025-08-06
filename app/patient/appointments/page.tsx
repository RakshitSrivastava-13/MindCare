'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAppointments } from '@/hooks/useApi'
import CancelAppointmentModal from '@/app/components/CancelAppointmentModal'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MapPin,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react'
import Link from 'next/link'

type AppointmentStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export default function PatientAppointments() {
  const { user } = useAuth()
  const { appointments, loading, cancelAppointment, refetch } = useAppointments(undefined, user?.uid)
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)

  // Filter appointments based on status and search term
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Group appointments by status
  const upcomingAppointments = filteredAppointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'confirmed'
  ).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())

  const pastAppointments = filteredAppointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  ).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedAppointment || !user) return

    setCancelling(true)
    try {
      await cancelAppointment(selectedAppointment.id, reason, user.uid)
      toast.success('Appointment cancelled successfully')
      setCancelModalOpen(false)
      setSelectedAppointment(null)
      // Automatically refreshed via global notification system
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel appointment')
    } finally {
      setCancelling(false)
    }
  }

  const canCancelAppointment = (appointment: any) => {
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return false
    }
    
    // Check if appointment is at least 24 hours away
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return hoursUntilAppointment >= 24
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['patient']}>
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1a2f1a] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your appointments...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['patient']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2">Manage your appointments and sessions</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/appointment"
                className="bg-white border border-[#1a2f1a] text-[#1a2f1a] px-6 py-3 rounded-lg hover:bg-[#1a2f1a] hover:text-white transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Quick Book
              </Link>
              <Link
                href="/onboarding"
                className="bg-[#1a2f1a] text-white px-6 py-3 rounded-lg hover:bg-[#2a4f2a] transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Patient Setup
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#1a2f1a]" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cancelled</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt => apt.status === 'cancelled').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Upcoming Appointments</h2>
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#1a2f1a] bg-opacity-10 p-3 rounded-lg">
                          <User className="w-6 h-6 text-[#1a2f1a]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{appointment.type}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(appointment.time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                        {canCancelAppointment(appointment) && (
                          <button
                            onClick={() => handleCancelClick(appointment)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                            title="Cancel Appointment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Past Appointments</h2>
              <div className="space-y-4">
                {pastAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{appointment.type}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(appointment.time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Appointments */}
          {filteredAppointments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t booked any appointments yet'
                }
              </p>
              <Link
                href="/onboarding"
                className="bg-[#1a2f1a] text-white px-6 py-3 rounded-lg hover:bg-[#2a4f2a] transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book Your First Appointment
              </Link>
            </div>
          )}

          {/* Cancel Appointment Modal */}
          {selectedAppointment && (
            <CancelAppointmentModal
              isOpen={cancelModalOpen}
              onClose={() => {
                setCancelModalOpen(false)
                setSelectedAppointment(null)
              }}
              onConfirm={handleCancelConfirm}
              appointment={selectedAppointment}
              loading={cancelling}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
