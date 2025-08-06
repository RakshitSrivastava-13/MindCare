'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Plus,
  Edit3,
  MessageSquare,
  Activity,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

// Temporary data - replace with API calls
const patientData = {
  id: 1,
  name: 'John Doe',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe',
  age: 32,
  email: 'john.doe@example.com',
  phone: '(123) 456-7890',
  address: '123 Main St, City, State 12345',
  status: 'Stable',
  nextAppointment: '2024-01-17',
  lastVisit: '2024-01-10',
  diagnosis: 'Generalized Anxiety Disorder',
  medications: [
    { name: 'Sertraline', dosage: '50mg', frequency: 'Daily' },
    { name: 'Alprazolam', dosage: '0.5mg', frequency: 'As needed' }
  ]
}

const progressData = [
  { date: '2023-12-01', anxiety: 70, depression: 65, sleep: 75 },
  { date: '2023-12-15', anxiety: 65, depression: 60, sleep: 80 },
  { date: '2024-01-01', anxiety: 55, depression: 50, sleep: 85 },
  { date: '2024-01-15', anxiety: 45, depression: 45, sleep: 90 }
]

const notes = [
  {
    id: 1,
    date: '2024-01-10',
    content: 'Patient reports improved sleep patterns. Anxiety levels decreased.',
    type: 'Session Notes'
  },
  {
    id: 2,
    date: '2024-01-03',
    content: 'Medication adjusted. Reduced Sertraline to 50mg daily.',
    type: 'Medication Update'
  }
]

export default function PatientDetail({ params }: { params: { id: string } }) {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'treatment'>('overview')
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (!newNote.trim()) return
    // Add note to database
    console.log('Adding note:', newNote)
    setNewNote('')
  }

  return (
    <ProtectedRoute allowedUserTypes={['doctor']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Patient Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Image
                  src={patientData.avatar}
                  alt={patientData.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h1 className="text-3xl font-serif mb-2">{patientData.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>Age: {patientData.age}</span>
                  <span>•</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    patientData.status === 'Stable'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {patientData.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-5 h-5" />
                Message
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2f1a] text-white rounded-lg hover:bg-[#2a4f2a]">
                <Calendar className="w-5 h-5" />
                Schedule Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{patientData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{patientData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Next Appointment</p>
                <p>{patientData.nextAppointment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-[#1a2f1a] border-b-2 border-[#1a2f1a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notes'
                ? 'text-[#1a2f1a] border-b-2 border-[#1a2f1a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Notes & History
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'treatment'
                ? 'text-[#1a2f1a] border-b-2 border-[#1a2f1a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('treatment')}
          >
            Treatment Plan
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Progress Overview</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="anxiety"
                      stroke="#1a2f1a"
                      strokeWidth={2}
                      name="Anxiety"
                    />
                    <Line
                      type="monotone"
                      dataKey="depression"
                      stroke="#0088FE"
                      strokeWidth={2}
                      name="Depression"
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Sleep Quality"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Current Medications</h2>
                <button className="text-[#1a2f1a] hover:underline text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>
              <div className="space-y-4">
                {patientData.medications.map((med, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{med.name}</h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {med.dosage} - {med.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Session Notes</h2>
            </div>

            {/* Add Note Form */}
            <div className="mb-8">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-[#1a2f1a] text-white rounded-lg hover:bg-[#2a4f2a]"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{note.date}</span>
                    <span className="text-sm text-gray-500">{note.type}</span>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Treatment Plan</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Current Diagnosis</h3>
                <p className="text-gray-700">{patientData.diagnosis}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Treatment Goals</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Reduce anxiety symptoms through CBT techniques</li>
                  <li>Improve sleep quality and patterns</li>
                  <li>Develop healthy coping mechanisms</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recommended Activities</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Daily meditation practice (10-15 minutes)</li>
                  <li>Regular exercise (30 minutes, 3 times per week)</li>
                  <li>Sleep hygiene routine</li>
                </ul>
              </div>

              <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-[#1a2f1a] text-[#1a2f1a] rounded-lg hover:bg-gray-50">
                <Edit3 className="w-4 h-4" />
                Update Treatment Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
} 