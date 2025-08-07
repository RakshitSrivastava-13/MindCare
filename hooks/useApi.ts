import { useState, useEffect } from 'react'
import { Appointment, Patient, Message, Alert, DashboardStats, PatientDashboardStats, MoodEntry, ChatSession } from '@/types'

// Global state for appointment updates
let appointmentUpdateListeners: Array<() => void> = []

const notifyAppointmentUpdate = () => {
  appointmentUpdateListeners.forEach(listener => listener())
}

const subscribeToAppointmentUpdates = (listener: () => void) => {
  appointmentUpdateListeners.push(listener)
  return () => {
    appointmentUpdateListeners = appointmentUpdateListeners.filter(l => l !== listener)
  }
}

// Global state for dashboard updates
let dashboardUpdateListeners: Array<() => void> = []

const notifyDashboardUpdate = () => {
  dashboardUpdateListeners.forEach(listener => listener())
}

const subscribeToDashboardUpdates = (listener: () => void) => {
  dashboardUpdateListeners.push(listener)
  return () => {
    dashboardUpdateListeners = dashboardUpdateListeners.filter(l => l !== listener)
  }
}

// Generic API hook
function useApi<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data || result)
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [...dependencies, refetchTrigger])

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1)
  }

  return { data, loading, error, refetch }
}

// Appointments hooks
export function useAppointments(doctorId?: string, patientId?: string, date?: string) {
  const params = new URLSearchParams()
  if (doctorId) params.append('doctorId', doctorId)
  if (patientId) params.append('patientId', patientId)
  if (date) params.append('date', date)
  
  const url = `/api/appointments?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ appointments: Appointment[] }>(url, [doctorId, patientId, date])
  
  // Subscribe to global appointment updates
  useEffect(() => {
    const unsubscribe = subscribeToAppointmentUpdates(refetch)
    return unsubscribe
  }, [refetch])
  
  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })
      const result = await response.json()
      if (result.success) {
        notifyAppointmentUpdate()
        notifyDashboardUpdate()
        return result.appointment
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  const updateAppointment = async (id: string, updateData: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      const result = await response.json()
      if (result.success) {
        notifyAppointmentUpdate()
        notifyDashboardUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        notifyAppointmentUpdate()
        notifyDashboardUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  const cancelAppointment = async (id: string, reason?: string, patientId?: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, patientId })
      })
      const result = await response.json()
      if (result.success) {
        notifyAppointmentUpdate()
        notifyDashboardUpdate()
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    appointments: data?.appointments || [],
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    refetch
  }
}

// Patients hooks
export function usePatients(doctorId?: string, search?: string, status?: string) {
  const params = new URLSearchParams()
  if (doctorId) params.append('doctorId', doctorId)
  if (search) params.append('search', search)
  if (status) params.append('status', status)
  
  const url = `/api/patients?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ patients: Patient[] }>(url, [doctorId, search, status])
  
  const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        return result.patient
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    patients: data?.patients || [],
    loading,
    error,
    createPatient,
    refetch
  }
}

// Messages hooks
export function useMessages(userId: string, conversationWith?: string) {
  const params = new URLSearchParams()
  params.append('userId', userId)
  if (conversationWith) params.append('conversationWith', conversationWith)
  
  const url = `/api/messages?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ messages: Message[] }>(url, [userId, conversationWith])
  
  const sendMessage = async (messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        return result.message
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    messages: data?.messages || [],
    loading,
    error,
    sendMessage,
    refetch
  }
}

// Alerts hooks
export function useAlerts(doctorId?: string, patientId?: string, isRead?: boolean) {
  const params = new URLSearchParams()
  if (doctorId) params.append('doctorId', doctorId)
  if (patientId) params.append('patientId', patientId)
  if (isRead !== undefined) params.append('isRead', isRead.toString())
  
  const url = `/api/alerts?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ alerts: Alert[] }>(url, [doctorId, patientId, isRead])
  
  const createAlert = async (alertData: Omit<Alert, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        return result.alert
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    alerts: data?.alerts || [],
    loading,
    error,
    createAlert,
    refetch
  }
}

// Dashboard hooks
export function useDoctorDashboard(doctorId: string) {
  const url = `/api/dashboard/doctor?doctorId=${doctorId}`
  const { data, loading, error, refetch } = useApi<{ stats: DashboardStats }>(url, [doctorId])
  
  // Subscribe to global dashboard and appointment updates
  useEffect(() => {
    const unsubscribeAppointment = subscribeToAppointmentUpdates(() => {
      refetch()
    })
    const unsubscribeDashboard = subscribeToDashboardUpdates(() => {
      refetch()
    })
    return () => {
      unsubscribeAppointment()
      unsubscribeDashboard()
    }
  }, [refetch])
  
  return {
    stats: data?.stats,
    loading,
    error,
    refetch
  }
}

export function usePatientDashboard(patientId: string) {
  const url = `/api/dashboard/patient?patientId=${patientId}`
  const { data, loading, error } = useApi<{ stats: PatientDashboardStats }>(url, [patientId])
  
  return {
    stats: data?.stats,
    loading,
    error
  }
}

// Mood tracking hooks
export function useMoodEntries(patientId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams()
  params.append('patientId', patientId)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const url = `/api/mood?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ moodEntries: MoodEntry[] }>(url, [patientId, startDate, endDate])
  
  const addMoodEntry = async (moodData: Omit<MoodEntry, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData)
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        return result.moodEntry
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    moodEntries: data?.moodEntries || [],
    loading,
    error,
    addMoodEntry,
    refetch
  }
}

// Chat sessions hooks
export function useChatSessions(patientId?: string, doctorId?: string) {
  const params = new URLSearchParams()
  if (patientId) params.append('patientId', patientId)
  if (doctorId) params.append('doctorId', doctorId)
  
  const url = `/api/chat?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ chatSessions: ChatSession[] }>(url, [patientId, doctorId])
  
  const createChatSession = async (sessionData: Omit<ChatSession, 'id' | 'messages' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        return result.chatSession
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  return {
    chatSessions: data?.chatSessions || [],
    loading,
    error,
    createChatSession,
    refetch
  }
}

// Doctors hooks
export function useDoctorsBySpecialization(specialization?: string) {
  const params = new URLSearchParams()
  if (specialization) params.append('specialization', specialization)
  
  const url = `/api/doctors?${params.toString()}`
  const { data, loading, error, refetch } = useApi<{ doctors: any[] }>(url, [specialization])
  
  return {
    doctors: data?.doctors || [],
    loading,
    error,
    refetch
  }
}

// Hook to get doctor ID from user ID
export function useDoctorId(userId?: string) {
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchDoctorId = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/doctors')
        const result = await response.json()
        
        if (result.success) {
          const doctor = result.doctors.find((doc: any) => doc.userId === userId)
          setDoctorId(doctor?.id || null)
        }
      } catch (error) {
        console.error('Error fetching doctor ID:', error)
        setDoctorId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorId()
  }, [userId])

  return { doctorId, loading }
}
