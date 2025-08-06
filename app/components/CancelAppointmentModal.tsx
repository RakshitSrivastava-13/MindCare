'use client'

import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface CancelAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  appointment: {
    id: string
    doctorName: string
    date: string
    time: string
    type: string
  }
  loading?: boolean
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  loading = false
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState('')
  const [selectedReason, setSelectedReason] = useState('')

  const predefinedReasons = [
    'Schedule conflict',
    'Feeling better',
    'Emergency came up',
    'Need to reschedule',
    'Financial reasons',
    'Transportation issues',
    'Other'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalReason = selectedReason === 'Other' ? reason : selectedReason
    onConfirm(finalReason || 'No reason provided')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cancel Appointment</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Important Notice</h3>
                <p className="text-sm text-yellow-700">
                  Appointments can only be cancelled at least 24 hours in advance. 
                  For urgent cancellations, please contact your doctor directly.
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{appointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(appointment.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(appointment.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{appointment.type}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for cancellation (optional)
              </label>
              <div className="space-y-2">
                {predefinedReasons.map((predefinedReason) => (
                  <label key={predefinedReason} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={predefinedReason}
                      checked={selectedReason === predefinedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      disabled={loading}
                      className="mr-3 text-[#1a2f1a] focus:ring-[#1a2f1a]"
                    />
                    <span className="text-sm text-gray-700">{predefinedReason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a] disabled:bg-gray-100"
                  placeholder="Please provide a brief reason..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Keep Appointment
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
