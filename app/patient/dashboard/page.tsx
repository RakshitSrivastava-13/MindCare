'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Calendar,
  Clock,
  Activity,
  Brain,
  MessageSquare,
  Calendar as CalendarIcon,
  User,
  BarChart,
  Award,
  MoreVertical,
  Edit,
  X,
  Phone,
  Video,
  MapPin
} from 'lucide-react'
import { usePatientDashboard, useAppointments } from '@/hooks/useApi'
import MoodTracker from '@/app/components/MoodTracker'
import toast from 'react-hot-toast'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function PatientDashboard() {
  const { user, userProfile } = useAuth()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])
  
  // Fetch real data
  const { stats, loading: statsLoading } = usePatientDashboard(user?.uid || '')
  const { appointments, cancelAppointment } = useAppointments(undefined, user?.uid)

  // Get upcoming appointments
  const today = new Date().toISOString().split('T')[0]
  const upcomingAppointments = appointments
    .filter(appointment => appointment.date >= today && (appointment.status === 'confirmed' || appointment.status === 'pending'))
    .slice(0, 2)

  if (statsLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['patient']}>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1a2f1a] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['patient']}>
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif mb-2">
              Welcome back, {userProfile?.name}
            </h1>
            <p className="text-gray-600">
              Track your progress and manage your mental health journey
            </p>
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-blue-700">{stats?.averageMood || 0}</span>
            </div>
            <h3 className="text-blue-800 font-medium">Average Mood</h3>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <span>↗️</span> 0.5 from last week
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-700">{stats?.chatSessions || 0}</span>
            </div>
            <h3 className="text-purple-800 font-medium">Chat Sessions</h3>
            <p className="text-sm text-purple-600">This month</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-green-700">{upcomingAppointments.length}</span>
            </div>
            <h3 className="text-green-800 font-medium">Upcoming Sessions</h3>
            <p className="text-sm text-green-600">Next 7 days</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-orange-700">{stats?.progressPercentage || 0}%</span>
            </div>
            <h3 className="text-orange-800 font-medium">Progress</h3>
            <p className="text-sm text-orange-600">Overall improvement</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mood Tracking Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Mood Tracking</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.moodData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1a2f1a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Progress Overview</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.progressData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {(stats?.progressData || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {(stats?.progressData || []).map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link 
              href="/appointment"
              className="text-[#1a2f1a] hover:text-[#2a4f2a] text-sm font-medium flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Book New
            </Link>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 relative bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-white"
              >
                {/* Three-dot menu */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === appointment.id ? null : appointment.id)
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuId === appointment.id && (
                    <>
                      {/* Backdrop to close menu when clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenMenuId(null)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden">
                        <div className="py-1">
                          <Link
                            href={`/patient/appointments?edit=${appointment.id}`}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                            Reschedule Appointment
                          </Link>
                          <Link
                            href={`/chat`}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <MessageSquare className="w-4 h-4 text-green-500" />
                            Message Doctor
                          </Link>
                          <button
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              // Add video call logic here
                              setOpenMenuId(null)
                            }}
                          >
                            <Video className="w-4 h-4 text-purple-500" />
                            Join Video Call
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={async () => {
                              try {
                                await cancelAppointment(appointment.id, 'Cancelled by patient')
                                toast.success('Appointment cancelled successfully')
                                setOpenMenuId(null)
                              } catch (error) {
                                toast.error('Failed to cancel appointment')
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3 pr-8">
                  {/* Doctor Avatar */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 lg:p-3 rounded-full flex-shrink-0">
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Doctor & Appointment Type - Horizontal Layout */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{appointment.doctorName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs lg:text-sm capitalize">{appointment.type}</p>
                    </div>
                    
                    {/* Date & Time - Compact Layout */}
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500 mb-2 lg:mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Online</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button className="bg-[#1a2f1a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f2a] transition-colors flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Join Call
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 bg-[#1a2f1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a4f2a] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book your first appointment
                </Link>
              </div>
            )}
          </div>
          
          {upcomingAppointments.length > 0 && (
            <Link 
              href="/patient/appointments"
              className="mt-6 text-[#1a2f1a] hover:text-[#2a4f2a] inline-flex items-center gap-1 font-medium"
            >
              View All Appointments
              <Calendar className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/chat"
            className="bg-gradient-to-r from-[#1a2f1a] to-[#2a4f2a] text-white p-6 rounded-xl hover:from-[#2a4f2a] hover:to-[#3a5f3a] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="w-8 h-8 group-hover:animate-pulse" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="font-semibold text-lg mb-1">AI Chat Support</h3>
            <p className="text-sm text-green-100">Get instant mental health support</p>
          </Link>
          
          <Link
            href="/appointment"
            className="bg-white border-2 border-[#1a2f1a] text-[#1a2f1a] p-6 rounded-xl hover:bg-[#1a2f1a] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 group-hover:animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="font-semibold text-lg mb-1">Book Appointment</h3>
            <p className="text-sm opacity-70">Schedule with a professional</p>
          </Link>
          
          <Link
            href="/patient/appointments"
            className="bg-white border-2 border-[#1a2f1a] text-[#1a2f1a] p-6 rounded-xl hover:bg-[#1a2f1a] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between mb-3">
              <BarChart className="w-8 h-8 group-hover:animate-pulse" />
              <span className="bg-[#1a2f1a] text-white text-xs px-2 py-1 rounded-full group-hover:bg-white group-hover:text-[#1a2f1a]">
                {upcomingAppointments.length}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-1">My Appointments</h3>
            <p className="text-sm opacity-70">View and manage sessions</p>
          </Link>
        </div>

        {/* Mood Tracker */}
        <MoodTracker onMoodSubmit={() => window.location.reload()} />
      </div>
    </div>
    </ProtectedRoute>
  )
} 