'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  ChevronRight,
  Bell,
  X,
  Check,
  XCircle
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { useDoctorDashboard, useAppointments, useAlerts, useDoctorId } from '@/hooks/useApi'

export default function DoctorDashboard() {
  const { user, userProfile } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  
  // Get doctor ID from user ID
  const { doctorId, loading: doctorIdLoading } = useDoctorId(user?.uid)
  
  // Fetch real data using doctor ID
  const { stats, loading: statsLoading } = useDoctorDashboard(doctorId || '')
  const { appointments, refetch: refetchAppointments } = useAppointments(doctorId || undefined)
  
  // Only fetch alerts when we have a valid doctorId to prevent showing all doctors' alerts
  const alertsResult = useAlerts(doctorId || undefined, undefined, false)
  const alerts = doctorId ? alertsResult.alerts : [] // Only use alerts if we have a valid doctorId

  // Get today's schedule
  const todayDate = new Date().toISOString().split('T')[0]
  const todaySchedule = appointments
    .filter(appointment => appointment.date === todayDate && appointment.status === 'confirmed')
    .slice(0, 2) // Show only first 2 appointments

  // Get unread alerts - only count them if we have a valid doctorId
  // More accurate counting: Remove duplicates and only count recent pending appointments
  const today = new Date()
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Filter pending appointments more carefully
  const validPendingAppointments = appointments.filter(apt => {
    if (apt.status !== 'pending') return false
    
    // Only count appointments from the last 7 days or future appointments
    const appointmentDate = new Date(apt.date)
    const createdDate = apt.createdAt ? new Date(apt.createdAt) : appointmentDate
    
    return createdDate >= sevenDaysAgo || appointmentDate >= today
  })
  
  // Remove duplicates based on multiple criteria to ensure accuracy
  const uniquePendingAppointments = validPendingAppointments.filter((appointment, index, self) => {
    return index === self.findIndex(apt => {
      // Check for duplicates using multiple criteria
      const samePatient = apt.patientId === appointment.patientId || 
                         apt.patientName === appointment.patientName
      const sameDateTime = apt.date === appointment.date && apt.time === appointment.time
      const sameDoctor = apt.doctorId === appointment.doctorId
      
      return samePatient && sameDateTime && sameDoctor
    })
  })
  
  // Additional filter: Only count appointments that are actually actionable
  const actionablePendingAppointments = uniquePendingAppointments.filter(apt => {
    // Make sure the appointment has essential data
    return apt.patientName && apt.date && apt.time && apt.doctorId === doctorId
  })
  
  // Debug logging (remove in production)
  if (doctorId && typeof window !== 'undefined') {
    console.log(`Doctor ${userProfile?.name} (${doctorId}):`)
    console.log(`- Total appointments: ${appointments.length}`)
    console.log(`- Raw pending: ${appointments.filter(apt => apt.status === 'pending').length}`)
    console.log(`- Valid pending: ${validPendingAppointments.length}`)
    console.log(`- Unique pending: ${uniquePendingAppointments.length}`)
    console.log(`- Actionable pending: ${actionablePendingAppointments.length}`)
    console.log('Actionable pending appointments:', actionablePendingAppointments.map(apt => ({
      id: apt.id,
      patient: apt.patientName || apt.patientId,
      date: apt.date,
      time: apt.time,
      created: apt.createdAt
    })))
  }
  
  const pendingAppointmentsCount = actionablePendingAppointments.length
  const totalUnreadAlerts = doctorId ? pendingAppointmentsCount : 0 // Total count for notification
  const displayAlerts = doctorId ? alerts.slice(0, 2) : [] // Show only first 2 for UI
  const pendingAppointments = actionablePendingAppointments // Use filtered appointments

  // Handle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  // Handle appointment status updates
  const updateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    setUpdatingAppointment(appointmentId)
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh appointments data without page reload
        await refetchAppointments()
        
        // Show success message
        const actionText = status === 'confirmed' ? 'confirmed' : 'cancelled'
        console.log(`Appointment ${actionText} successfully`)
        
        // Close notification dropdown after successful action
        setShowNotifications(false)
      } else {
        console.error('Failed to update appointment:', result.error)
        alert('Failed to update appointment. Please try again.')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment. Please try again.')
    } finally {
      setUpdatingAppointment(null)
    }
  }

  const confirmAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'confirmed')
  }

  const cancelAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatus(appointmentId, 'cancelled')
    }
  }

  // Close notifications when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showNotifications])

  if (statsLoading || doctorIdLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['doctor']}>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1a2f1a] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['doctor']}>
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-1">Welcome Back, Dr. {userProfile?.name}</h1>
              <p className="text-gray-500">Here's what's happening with your patients today</p>
            </div>
            
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={toggleNotifications}
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {totalUnreadAlerts > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {totalUnreadAlerts}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 transform transition-all duration-200 ease-out">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-medium">Notifications</h3>
                      {totalUnreadAlerts > 0 && (
                        <p className="text-sm text-gray-500">
                          {totalUnreadAlerts} new appointment request{totalUnreadAlerts > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {totalUnreadAlerts > 0 ? (
                      <>
                        {pendingAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <Image
                                  src={`https://ui-avatars.com/api/?name=${appointment.patientName}&background=f3f4f6&color=374151`}
                                  alt={appointment.patientName}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <p className="text-sm font-medium text-gray-900">
                                    New appointment request
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(appointment.createdAt || Date.now()).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">{appointment.patientName}</span> has requested an appointment
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(appointment.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {appointment.time}
                                  </span>
                                </div>
                                <p className="text-xs text-blue-600 font-medium mb-3">
                                  {appointment.type || 'General consultation'}
                                </p>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => confirmAppointment(appointment.id)}
                                    disabled={updatingAppointment === appointment.id}
                                    className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    {updatingAppointment === appointment.id ? 'Updating...' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => cancelAppointment(appointment.id)}
                                    disabled={updatingAppointment === appointment.id}
                                    className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    {updatingAppointment === appointment.id ? 'Updating...' : 'Cancel'}
                                  </button>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* View All Link */}
                        <div className="p-4">
                          <Link
                            href="/doctor/appointments"
                            onClick={() => setShowNotifications(false)}
                            className="block w-full text-center bg-[#1a2f1a] text-white py-2 px-4 rounded-lg hover:bg-[#2d4a2d] transition-colors"
                          >
                            View All Appointments
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No new notifications</p>
                        <p className="text-gray-400 text-sm">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-[#1a2f1a]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats?.totalPatients || 0}</h3>
            <p className="text-gray-500">Total Patients</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats?.activePatients || 0}</h3>
            <p className="text-gray-500">Active Patients</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats?.todayAppointments || 0}</h3>
            <p className="text-gray-500">Today's Appointments</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats?.pendingMessages || 0}</h3>
            <p className="text-gray-500">Pending Messages</p>
          </div>
        </div>

        {/* Pending Appointments Notification */}
        {actionablePendingAppointments.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800">
                    {actionablePendingAppointments.length} Pending Appointment{actionablePendingAppointments.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-yellow-700">
                    You have appointment requests waiting for confirmation
                  </p>
                </div>
              </div>
              <Link
                href="/doctor/appointments"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                Review Appointments
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Charts */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-medium mb-6">Monthly Appointments</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.weeklyAppointments || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1a2f1a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">Patient Progress</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.patientProgress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="improved"
                      stroke="#1a2f1a"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="stable"
                      stroke="#0088FE"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="declined"
                      stroke="#FF8042"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Today's Schedule & Alerts */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Today's Schedule</h2>
                <Link
                  href="/doctor/appointments"
                  className="text-[#1a2f1a] hover:underline text-sm flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <Image
                      src={`https://ui-avatars.com/api/?name=${appointment.patientName}`}
                      alt={appointment.patientName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {appointment.patientName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {appointment.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                    </div>
                  </div>
                ))}
                {todaySchedule.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No appointments today</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Patient Alerts</h2>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  {totalUnreadAlerts} New
                </span>
              </div>

              <div className="space-y-4">
                {displayAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{alert.message}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {totalUnreadAlerts === 0 && (
                  <p className="text-gray-500 text-center py-4">No new alerts</p>
                )}
                {totalUnreadAlerts > 2 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      and {totalUnreadAlerts - 2} more...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 