'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  Filter,
  ChevronRight,
  MessageSquare,
  Calendar,
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react'
import { usePatients, useAlerts } from '@/hooks/useApi'

export default function Patients() {
  const { user, userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const { patients, loading } = usePatients(user?.uid, searchTerm, filterStatus)
  const { alerts } = useAlerts(user?.uid)

  // Get alerts for each patient
  const getPatientAlerts = (patientId: string) => {
    return alerts.filter(alert => alert.patientId === patientId && !alert.isRead)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['doctor']}>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading patients...</div>
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
            <h1 className="text-3xl font-serif">Patients</h1>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
            >
              <option value="all">All Status</option>
              <option value="stable">Stable</option>
              <option value="needs attention">Needs Attention</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
          {patients.map((patient) => {
            const patientAlerts = getPatientAlerts(patient.id)
            return (
              <div key={patient.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${patient.name}`}
                      alt={patient.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-xl font-medium">{patient.name}</h2>
                        <span>•</span>
                        <span className="text-gray-500">{patient.age} years</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm bg-green-100 text-green-800`}
                        >
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">Patient ID: {patient.id}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Member since: {new Date(patient.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Status: Active
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/doctor/messages?patient=${patient.id}`}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/doctor/appointments?patient=${patient.id}`}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      <Calendar className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/doctor/patients/${patient.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a2f1a] text-white rounded-lg hover:bg-[#2a4f2a]"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Alerts */}
                {patientAlerts.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-medium">Alerts</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {patientAlerts.map((alert, index) => (
                        <li key={index}>{alert.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
          {patients.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No patients found
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
} 