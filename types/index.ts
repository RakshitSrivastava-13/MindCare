export interface User {
  id: string
  email: string
  name: string
  userType: 'doctor' | 'patient'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Doctor extends User {
  userType: 'doctor'
  specialization: string
  license: string
  experience: number
  qualifications: string[]
  availability: {
    days: string[]
    timeSlots: string[]
  }
}

export interface Patient extends User {
  userType: 'patient'
  age: number
  gender: string
  doctorId?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  patientName: string
  doctorName: string
  date: string
  time: string
  duration: number
  type: 'Initial Consultation' | 'Follow-up' | 'Emergency' | 'Video Call' | 'In-Person'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MoodEntry {
  id: string
  patientId: string
  date: string
  value: number
  notes?: string
  factors?: string[]
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  senderType: 'doctor' | 'patient'
  content: string
  type: 'text' | 'appointment' | 'alert'
  isRead: boolean
  createdAt: Date
}

export interface ChatSession {
  id: string
  patientId: string
  doctorId?: string
  title: string
  messages: ChatMessage[]
  status: 'active' | 'completed'
  aiSummary?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai' | 'doctor'
  timestamp: Date
  metadata?: {
    emotion?: string
    riskLevel?: 'low' | 'medium' | 'high'
  }
}

export interface Alert {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  type: 'medication' | 'mood' | 'appointment' | 'emergency'
  message: string
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: Date
}

export interface ProgressReport {
  id: string
  patientId: string
  doctorId: string
  reportDate: string
  moodAverage: number
  improvements: string[]
  concerns: string[]
  recommendations: string[]
  nextReviewDate: string
  createdAt: Date
}

export interface DashboardStats {
  totalPatients: number
  activePatients: number
  todayAppointments: number
  pendingMessages: number
  weeklyAppointments: {
    month: string
    count: number
  }[]
  patientProgress: {
    week: string
    improved: number
    stable: number
    declined: number
  }[]
}

export interface PatientDashboardStats {
  averageMood: number
  chatSessions: number
  completedAppointments: number
  progressPercentage: number
  moodData: {
    date: string
    value: number
  }[]
  progressData: {
    name: string
    value: number
  }[]
}
